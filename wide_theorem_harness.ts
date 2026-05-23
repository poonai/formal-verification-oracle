import { cpSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

type StageResult = {
  inputPath: string;
  outputPath: string;
  transcriptPath: string;
  output: string;
  exitCode: number;
};

type TheoremPacket = {
  theoremNumber: number;
  theoremId: string;
  sourceFile: string;
  sourceReference: string;
  statement: string;
  raw: string;
};

type ProofResult = StageResult & {
  theorem: TheoremPacket;
  classification: ProofClassification;
};

type ProofClassification =
  | "proved"
  | "likely bug / divergence"
  | "missing Dafny spec"
  | "proof gap"
  | "ambiguous theorem packet"
  | "unknown";

type HarnessResult = {
  rustFile: string;
  zigFile: string;
  rustDafnyFile: string;
  runRoot: string;
  stage1: StageResult;
  stage2: StageResult;
  theorems: ProofResult[];
  summary: {
    theoremCount: number;
    provedCount: number;
    failedCount: number;
    classifications: Record<ProofClassification, number>;
  };
};

const BUN_ROOT = "/home/saint/bun";
const OUTPUT_ROOT = "/home/saint/proof-rewrite/out";
const SESSION_ROOT = "/home/saint/proof-rewrite/.pi-sessions";
const PROMPT_ROOT = path.join(".pi", "prompts");
const RUST_PROMPT = path.join(PROMPT_ROOT, "rust_to_dafny_porting_prompt.md");
const THEOREM_DISCOVERY_PROMPT = path.join(PROMPT_ROOT, "zig_to_dafny_theorem_discovery_prompt.md");
const THEOREM_PROVING_PROMPT = path.join(PROMPT_ROOT, "zig_to_dafny_theorem_proving_prompt.md");

function sanitizeRunId(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, "_");
}

function ensureParentDir(filePath: string): void {
  mkdirSync(path.dirname(filePath), { recursive: true });
}

function relativeToBun(filePath: string): string {
  return path.relative(BUN_ROOT, filePath);
}

function resolveBunPath(filePath: string): string {
  return path.isAbsolute(filePath) ? filePath : path.join(BUN_ROOT, filePath);
}

function inferSiblingFile(filePath: string, newExtension: string): string {
  const parsed = path.parse(filePath);
  return path.join(parsed.dir, `${parsed.name}${newExtension}`);
}

function inferZigFile(rustFile: string): string {
  return inferSiblingFile(rustFile, ".zig");
}

function inferDafnyFile(rustFile: string): string {
  return inferSiblingFile(rustFile, ".dfy");
}

function stageFile(runRoot: string, name: string, suffix: string): string {
  return path.join(runRoot, `${name}_${suffix}`);
}

function buildPiArgs(sessionDir: string, systemPrompt: string, extraArgs: string[] = []): string[] {
  return [
    "--print",
    "--session-dir",
    sessionDir,
    "--system-prompt",
    systemPrompt,
    ...extraArgs,
  ];
}

function listSessionFiles(sessionDir: string): string[] {
  try {
    return readdirSync(sessionDir)
      .filter((name) => name.endsWith(".jsonl"))
      .sort()
      .map((name) => path.join(sessionDir, name));
  } catch {
    return [];
  }
}

function captureTranscriptPath(sessionDir: string, before: string[]): string {
  const beforeSet = new Set(before);
  const after = listSessionFiles(sessionDir);
  const created = after.filter((filePath) => !beforeSet.has(filePath));
  return created[created.length - 1] ?? after[after.length - 1] ?? "";
}

function firstNonEmptyLine(output: string): string {
  return output
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.length > 0) ?? "";
}

function classifyProof(output: string): ProofClassification {
  const firstLine = firstNonEmptyLine(output).toLowerCase();
  if (firstLine === "proved" || firstLine.startsWith("proved")) {
    return "proved";
  }
  if (firstLine.includes("likely bug / divergence")) {
    return "likely bug / divergence";
  }
  if (firstLine.includes("missing dafny spec")) {
    return "missing Dafny spec";
  }
  if (firstLine.includes("proof gap")) {
    return "proof gap";
  }
  if (firstLine.includes("ambiguous theorem packet")) {
    return "ambiguous theorem packet";
  }
  return "unknown";
}

function runPiStep(
  sessionDir: string,
  stageLabel: string,
  systemPrompt: string,
  inputText: string,
  inputPath: string,
  outputPath: string,
): StageResult {
  ensureParentDir(inputPath);
  ensureParentDir(outputPath);
  mkdirSync(sessionDir, { recursive: true });

  writeFileSync(inputPath, inputText);
  const sessionFilesBefore = listSessionFiles(sessionDir);

  const result = spawnSync("pi", buildPiArgs(sessionDir, systemPrompt), {
    cwd: BUN_ROOT,
    encoding: "utf8",
    input: inputText,
    env: {
      ...process.env,
      PI_OFFLINE: process.env.PI_OFFLINE ?? "1",
    },
  });

  const transcriptPath = captureTranscriptPath(sessionDir, sessionFilesBefore);
  if (!transcriptPath) {
    throw new Error(`Could not locate pi transcript for ${stageLabel}`);
  }

  writeFileSync(outputPath, result.stdout ?? "");

  return {
    inputPath,
    outputPath,
    transcriptPath,
    output: result.stdout ?? "",
    exitCode: result.status ?? -1,
  };
}

function parseTheoremPackets(output: string): TheoremPacket[] {
  const normalized = output.replace(/\r\n/g, "\n").trim();
  if (!normalized) {
    return [];
  }

  const blocks: string[] = [];
  const lines = normalized.split("\n");
  let current: string[] = [];

  for (const line of lines) {
    const isPacketStart = /^\s*\d+[.)]\s*/.test(line) && current.length > 0;
    if (isPacketStart) {
      const block = current.join("\n").trim();
      if (block.length > 0) {
        blocks.push(block);
      }
      current = [];
    }

    if (line.trim().length === 0 && current.length === 0) {
      continue;
    }

    current.push(line);
  }

  const lastBlock = current.join("\n").trim();
  if (lastBlock.length > 0) {
    blocks.push(lastBlock);
  }

  const theoremBlocks = blocks.filter((block) => /theorem_id\s*:/i.test(block));
  const usableBlocks = theoremBlocks.length > 0 ? theoremBlocks : blocks;

  return usableBlocks.map((raw, index) => {
    const theoremId = extractField(raw, "theorem_id") ?? `theorem_${String(index + 1).padStart(3, "0")}`;
    const sourceFile = extractField(raw, "source_file") ?? "";
    const sourceReference = extractField(raw, "source_reference") ?? "";
    const statement = extractField(raw, "statement") ?? "";
    return {
      theoremNumber: index + 1,
      theoremId,
      sourceFile,
      sourceReference,
      statement,
      raw,
    };
  });
}

function extractField(packet: string, fieldName: string): string | undefined {
  const pattern = new RegExp(`^\\s*${fieldName}\\s*:\\s*(.*)$`, "im");
  const match = packet.match(pattern);
  return match?.[1]?.trim();
}

function uniqueDirs(paths: string[]): string[] {
  return [...new Set(paths.map((entry) => path.dirname(entry)))];
}

function snapshotDirectories(directories: string[]): { dir: string; snapshotDir: string }[] {
  const tempRoot = mkdtempSync(path.join(os.tmpdir(), "proof-wide-"));
  return directories.map((dir, index) => {
    const snapshotDir = path.join(tempRoot, `snapshot-${index}`);
    cpSync(dir, snapshotDir, { recursive: true });
    return { dir, snapshotDir };
  });
}

function restoreSnapshots(snapshots: { dir: string; snapshotDir: string }[]): void {
  for (const snapshot of snapshots) {
    rmSync(snapshot.dir, { recursive: true, force: true });
    mkdirSync(path.dirname(snapshot.dir), { recursive: true });
    cpSync(snapshot.snapshotDir, snapshot.dir, { recursive: true });
  }
}

function buildProofSystemPrompt(rustFile: string, zigFile: string, rustDafnyFile: string): string {
  return [
    readFileSync(THEOREM_PROVING_PROMPT, "utf8"),
    "",
    "Context:",
    `rust_file: ${rustFile}`,
    `zig_file: ${zigFile}`,
    `dafny_model: ${rustDafnyFile}`,
  ].join("\n");
}

function runHarness(rustFileInput: string, zigFileInput?: string): HarnessResult {
  const rustFile = resolveBunPath(rustFileInput);
  const zigFile = zigFileInput ? resolveBunPath(zigFileInput) : inferZigFile(rustFile);
  const rustDafnyFile = inferDafnyFile(rustFile);
  const runId = sanitizeRunId(`${path.relative(BUN_ROOT, rustFile)}-${Date.now()}`);
  const runRoot = path.join(OUTPUT_ROOT, runId);
  const sessionDir = path.join(SESSION_ROOT, runId);
  const proofDir = path.join(runRoot, "proofs");

  mkdirSync(runRoot, { recursive: true });
  mkdirSync(proofDir, { recursive: true });
  mkdirSync(sessionDir, { recursive: true });

  const stage1InputPath = stageFile(runRoot, "stage1", "input.md");
  const stage1OutputPath = stageFile(runRoot, "stage1", "output.md");
  const stage2InputPath = stageFile(runRoot, "stage2", "input.md");
  const stage2OutputPath = stageFile(runRoot, "stage2", "output.md");

  const stage1 = runPiStep(
    sessionDir,
    "stage1",
    readFileSync(RUST_PROMPT, "utf8"),
    `@${relativeToBun(rustFile)}`,
    stage1InputPath,
    stage1OutputPath,
  );

  const stage2 = runPiStep(
    sessionDir,
    "stage2",
    readFileSync(THEOREM_DISCOVERY_PROMPT, "utf8"),
    `@${relativeToBun(zigFile)}`,
    stage2InputPath,
    stage2OutputPath,
  );

  const theoremPackets = parseTheoremPackets(stage2.output);
  const resetSnapshots = snapshotDirectories(uniqueDirs([rustFile, zigFile]));
  const proofResults: ProofResult[] = [];
  const classifications: Record<ProofClassification, number> = {
    "proved": 0,
    "likely bug / divergence": 0,
    "missing Dafny spec": 0,
    "proof gap": 0,
    "ambiguous theorem packet": 0,
    "unknown": 0,
  };

  for (const theorem of theoremPackets) {
    const theoremTag = `theorem-${String(theorem.theoremNumber).padStart(3, "0")}`;
    const proofInputPath = path.join(proofDir, `${theoremTag}_input.md`);
    const proofOutputPath = path.join(proofDir, `${theoremTag}_output.md`);
    const theoremSystemPrompt = buildProofSystemPrompt(rustFile, zigFile, rustDafnyFile);

    try {
      const proofStage = runPiStep(
        sessionDir,
        theoremTag,
        theoremSystemPrompt,
        theorem.raw,
        proofInputPath,
        proofOutputPath,
      );
      const classification = classifyProof(proofStage.output);
      classifications[classification] += 1;

      proofResults.push({
        ...proofStage,
        theorem,
        classification,
      });
    } finally {
      restoreSnapshots(resetSnapshots);
    }
  }

  const summary = {
    theoremCount: theoremPackets.length,
    provedCount: classifications.proved,
    failedCount: theoremPackets.length - classifications.proved,
    classifications,
  };

  const result: HarnessResult = {
    rustFile,
    zigFile,
    rustDafnyFile,
    runRoot,
    stage1,
    stage2,
    theorems: proofResults,
    summary,
  };

  writeFinalReports(result);
  return result;
}

function writeFinalReports(result: HarnessResult): void {
  const reportJsonPath = path.join(result.runRoot, "report.json");
  const reportMdPath = path.join(result.runRoot, "report.md");
  ensureParentDir(reportJsonPath);
  ensureParentDir(reportMdPath);

  const jsonReport = {
    rustFile: result.rustFile,
    zigFile: result.zigFile,
    rustDafnyFile: result.rustDafnyFile,
    runRoot: result.runRoot,
    stage1: result.stage1,
    stage2: result.stage2,
    summary: result.summary,
    theorems: result.theorems,
  };

  const mdLines: string[] = [
    "# Wide Theorem Harness Report",
    "",
    `rustFile: ${result.rustFile}`,
    `zigFile: ${result.zigFile}`,
    `rustDafnyFile: ${result.rustDafnyFile}`,
    `runRoot: ${result.runRoot}`,
    "",
    "## Summary",
    `theoremCount: ${result.summary.theoremCount}`,
    `provedCount: ${result.summary.provedCount}`,
    `failedCount: ${result.summary.failedCount}`,
    "",
    "## Stage 1",
    `transcript: ${result.stage1.transcriptPath}`,
    "",
    "## Stage 2",
    `transcript: ${result.stage2.transcriptPath}`,
    "",
  ];

  for (const proof of result.theorems) {
    mdLines.push(
      `## Theorem ${proof.theorem.theoremNumber}`,
      `theoremId: ${proof.theorem.theoremId}`,
      `sourceFile: ${proof.theorem.sourceFile}`,
      `sourceReference: ${proof.theorem.sourceReference}`,
      `classification: ${proof.classification}`,
      `transcript: ${proof.transcriptPath}`,
      "",
      "### Packet",
      "```text",
      proof.theorem.raw.trimEnd(),
      "```",
      "",
      "### Proof Output",
      "```text",
      proof.output.trimEnd(),
      "```",
      "",
    );
  }

  writeFileSync(reportJsonPath, JSON.stringify(jsonReport, null, 2));
  writeFileSync(reportMdPath, mdLines.join("\n"));
}

function parseArgs(argv: string[]): { rustFile: string; zigFile?: string } {
  const positional: string[] = [];
  let rustFile: string | undefined;
  let zigFile: string | undefined;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--rust-file") {
      rustFile = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg === "--zig-file") {
      zigFile = argv[index + 1];
      index += 1;
      continue;
    }
    if (!arg.startsWith("--")) {
      positional.push(arg);
    }
  }

  rustFile = rustFile ?? positional[0];
  zigFile = zigFile ?? positional[1];

  if (!rustFile) {
    throw new Error("Usage: node wide_theorem_harness.ts --rust-file <file.rs> [--zig-file <file.zig>]");
  }

  return {
    rustFile,
    zigFile,
  };
}

if (import.meta.main) {
  const { rustFile, zigFile } = parseArgs(process.argv.slice(2));
  const result = runHarness(rustFile, zigFile);
  console.log(
    JSON.stringify(
      {
        rustFile: result.rustFile,
        zigFile: result.zigFile,
        runRoot: result.runRoot,
        theoremCount: result.summary.theoremCount,
        provedCount: result.summary.provedCount,
      },
      null,
      2,
    ),
  );
}
