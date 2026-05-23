import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

type StageName = "stage1" | "stage2" | "stage3" | "stage4" | "stage5";
type BugClassification = "intended bug found" | "valid bug found" | "no bug found" | "unknown";

type DatasetRecord = {
  dataset_id: string;
  repo: string;
  pr_number: number;
  pr_url: string;
  bug_summary: string;
  expected_bug_slug: string;
  expected_stage3_label: string;
  pipeline_status: string;
  rust_file: string;
  rust_function: string;
  zig_file: string;
  zig_semantic_anchor: string;
  stage1_selector: string;
  notes: string;
};

type TargetSpec = {
  bunRoot: string;
  rustFile: string;
  rustFunction: string;
  zigFile: string;
  zigSemanticAnchor: string;
  rustPrompt: string;
  theoremDiscoveryPrompt: string;
  theoremSelectionPrompt: string;
  theoremProvingPrompt: string;
  theoremJudgementPrompt: string;
  outputRoot: string;
  sessionRoot: string;
  stage1Selector: string;
  datasetId: string;
  expectedBugSlug: string;
  expectedStage3Label: string;
  bugSummary: string;
  notes: string;
};

type ArtifactPaths = {
  runRoot: string;
  sessionDir: string;
  rustDafnyFile: string;
  zigSpecFile: string;
  stageInput: Record<StageName, string>;
  stageOutput: Record<StageName, string>;
  finalReportJson: string;
  finalReportMd: string;
};

type PipelineStageResult = {
  transcript: string;
  output: string;
};

type PipelineResult = {
  datasetId: string;
  stage1: PipelineStageResult;
  stage2: PipelineStageResult;
  stage3: PipelineStageResult;
  stage4: PipelineStageResult;
  stage5: PipelineStageResult & {
    classification: BugClassification;
  };
};

type BenchmarkContext = {
  target: TargetSpec;
  artifacts: ArtifactPaths;
  stageTranscriptPaths: Partial<Record<StageName, string>>;
};

const BUN_ROOT = "/home/saint/bun";
const DATASET_FILE = "/home/saint/proof-rewrite/dataset.jsonl";
const RUST_PROMPT = "/home/saint/bun/.pi/prompts/rust_to_dafny_porting_prompt.md";
const THEOREM_DISCOVERY_PROMPT = "/home/saint/bun/.pi/prompts/zig_to_dafny_theorem_discovery_prompt.md";
const THEOREM_SELECTION_PROMPT = "/home/saint/bun/.pi/prompts/zig_to_dafny_theorem_selection_prompt.md";
const THEOREM_PROVING_PROMPT = "/home/saint/bun/.pi/prompts/zig_to_dafny_theorem_proving_prompt.md";
const THEOREM_JUDGEMENT_PROMPT = "/home/saint/bun/.pi/prompts/zig_to_dafny_theorem_judgement_prompt.md";
const OUTPUT_ROOT = "/home/saint/proof-rewrite/out";
const SESSION_ROOT = "/home/saint/proof-rewrite/.pi-sessions";
const RANDOM_SAMPLE_SIZE = 5;
const DEFAULT_DATASET_ID = "bun-pr-30999";

function stageFile(runRoot: string, stage: StageName, suffix: string): string {
  return path.join(runRoot, `${stage}_${suffix}`);
}

function siblingProofFile(sourceFile: string, suffix: string): string {
  const parsed = path.parse(sourceFile);
  return path.join(parsed.dir, `${parsed.name}${suffix}`);
}

function siblingSameNameDafnyFile(sourceFile: string): string {
  const parsed = path.parse(sourceFile);
  return path.join(parsed.dir, `${parsed.name}.dfy`);
}

function ensureParentDir(filePath: string): void {
  mkdirSync(path.dirname(filePath), { recursive: true });
}

function sanitizeRunId(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, "_");
}

function buildStage3Input(context: BenchmarkContext, stage2Output: string): string {
  return [
    `dataset_id: ${context.target.datasetId}`,
    `expected_bug_slug: ${context.target.expectedBugSlug}`,
    `bug_summary: ${context.target.bugSummary}`,
    `rust_selector: ${context.target.stage1Selector}`,
    `zig_semantic_anchor: ${context.target.zigSemanticAnchor}`,
    `notes: ${context.target.notes}`,
    "",
    "theorem_packets:",
    stage2Output.trimEnd(),
  ].join("\n");
}

function deriveArtifacts(target: TargetSpec): ArtifactPaths {
  const runRoot = path.join(OUTPUT_ROOT, sanitizeRunId(target.datasetId));
  return {
    runRoot,
    sessionDir: path.join(SESSION_ROOT, sanitizeRunId(target.datasetId)),
    rustDafnyFile: siblingSameNameDafnyFile(target.rustFile),
    zigSpecFile: siblingProofFile(target.zigFile, "_zig.dfy"),
    stageInput: {
      stage1: stageFile(runRoot, "stage1", "input.md"),
      stage2: stageFile(runRoot, "stage2", "input.md"),
      stage3: stageFile(runRoot, "stage3", "input.md"),
      stage4: stageFile(runRoot, "stage4", "input.md"),
      stage5: stageFile(runRoot, "stage5", "input.md"),
    },
    stageOutput: {
      stage1: stageFile(runRoot, "stage1", "output.md"),
      stage2: stageFile(runRoot, "stage2", "output.md"),
      stage3: stageFile(runRoot, "stage3", "output.md"),
      stage4: stageFile(runRoot, "stage4", "output.md"),
      stage5: stageFile(runRoot, "stage5", "output.md"),
    },
    finalReportJson: path.join(runRoot, "report.json"),
    finalReportMd: path.join(runRoot, "report.md"),
  };
}

function loadDataset(): DatasetRecord[] {
  const content = readFileSync(DATASET_FILE, "utf8");
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => JSON.parse(line) as DatasetRecord);
}

function resolvedDatasetRecords(): DatasetRecord[] {
  return loadDataset().filter((record) => record.stage1_selector && record.rust_file && record.zig_file);
}

function resolveDatasetRecordById(datasetId: string): DatasetRecord {
  const record = resolvedDatasetRecords().find((candidate) => candidate.dataset_id === datasetId);
  if (!record) {
    throw new Error(`Could not find dataset record ${datasetId}`);
  }
  return record;
}

function createBenchmarkContext(record: DatasetRecord): BenchmarkContext {
  const target: TargetSpec = {
    bunRoot: BUN_ROOT,
    rustFile: record.rust_file,
    rustFunction: record.rust_function,
    zigFile: record.zig_file,
    zigSemanticAnchor: record.zig_semantic_anchor,
    rustPrompt: RUST_PROMPT,
    theoremDiscoveryPrompt: THEOREM_DISCOVERY_PROMPT,
    theoremSelectionPrompt: THEOREM_SELECTION_PROMPT,
    theoremProvingPrompt: THEOREM_PROVING_PROMPT,
    theoremJudgementPrompt: THEOREM_JUDGEMENT_PROMPT,
    outputRoot: OUTPUT_ROOT,
    sessionRoot: SESSION_ROOT,
    stage1Selector: record.stage1_selector,
    datasetId: record.dataset_id,
    expectedBugSlug: record.expected_bug_slug,
    expectedStage3Label: record.expected_stage3_label,
    bugSummary: record.bug_summary,
    notes: record.notes,
  };

  return {
    target,
    artifacts: deriveArtifacts(target),
    stageTranscriptPaths: {},
  };
}

function describeBenchmark(context: BenchmarkContext): string {
  return [
    `datasetId: ${context.target.datasetId}`,
    `rustTarget: ${context.target.rustFile}::${context.target.rustFunction}`,
    `zigReference: ${context.target.zigFile} (${context.target.zigSemanticAnchor})`,
    `expectedBug: ${context.target.expectedBugSlug}`,
    `stage1Selector: ${context.target.stage1Selector}`,
    `runRoot: ${context.artifacts.runRoot}`,
    `sessionDir: ${context.artifacts.sessionDir}`,
    `rustDafnyFile: ${context.artifacts.rustDafnyFile}`,
    `zigSpecFile: ${context.artifacts.zigSpecFile}`,
  ].join("\n");
}

function buildStage1Input(context: BenchmarkContext): string {
  return context.target.stage1Selector;
}

function buildStage2Input(context: BenchmarkContext): string {
  const relativeZigFile = path.relative(context.target.bunRoot, context.target.zigFile);
  return `@${relativeZigFile}`;
}

function buildStage4Input(selectedTheorem: string): string {
  return selectedTheorem;
}

function buildStage4SystemPrompt(context: BenchmarkContext): string {
  return [
    readFileSync(context.target.theoremProvingPrompt, "utf8"),
    "",
    "Dataset context:",
    `dataset_id: ${context.target.datasetId}`,
    `rust_target: ${context.target.rustFile}::${context.target.rustFunction}`,
    `dafny_model: ${context.artifacts.rustDafnyFile}`,
    `zig_source: ${context.target.zigFile}`,
    `expected_bug_slug: ${context.target.expectedBugSlug}`,
    `bug_summary: ${context.target.bugSummary}`,
    `zig_semantic_anchor: ${context.target.zigSemanticAnchor}`,
    `stage1_selector: ${context.target.stage1Selector}`,
    `notes: ${context.target.notes}`,
  ].join("\n");
}

function buildStage5Input(
  context: BenchmarkContext,
  selectedTheorem: string,
  proofOutput: string,
): string {
  return [
    `dataset_id: ${context.target.datasetId}`,
    `expected_bug_slug: ${context.target.expectedBugSlug}`,
    `expected_stage3_label: ${context.target.expectedStage3Label}`,
    `bug_summary: ${context.target.bugSummary}`,
    `rust_selector: ${context.target.stage1Selector}`,
    `zig_semantic_anchor: ${context.target.zigSemanticAnchor}`,
    `notes: ${context.target.notes}`,
    "",
    "theorem_packet:",
    selectedTheorem.trimEnd(),
    "",
    "proof_output:",
    proofOutput.trimEnd(),
  ].join("\n");
}

function buildPiArgs(context: BenchmarkContext, systemPrompt: string, extraArgs: string[] = []): string[] {
  return [
    "--print",
    "--session-dir",
    context.artifacts.sessionDir,
    "--system-prompt",
    systemPrompt,
    ...extraArgs,
  ];
}

function listSessionFiles(context: BenchmarkContext): string[] {
  try {
    return readdirSync(context.artifacts.sessionDir)
      .filter((name) => name.endsWith(".jsonl"))
      .sort()
      .map((name) => path.join(context.artifacts.sessionDir, name));
  } catch {
    return [];
  }
}

function captureNewSessionFile(context: BenchmarkContext, stage: StageName, before: string[]): string {
  const beforeSet = new Set(before);
  const after = listSessionFiles(context);
  const created = after.filter((filePath) => !beforeSet.has(filePath));
  const transcriptPath = created[created.length - 1] ?? after[after.length - 1];
  if (!transcriptPath) {
    throw new Error(`Could not locate pi session transcript for ${context.target.datasetId} ${stage}`);
  }
  context.stageTranscriptPaths[stage] = transcriptPath;
  return transcriptPath;
}

function requireTranscriptPath(context: BenchmarkContext, stage: StageName): string {
  const transcriptPath = context.stageTranscriptPaths[stage];
  if (!transcriptPath) {
    throw new Error(`Missing transcript path for ${context.target.datasetId} ${stage}`);
  }
  return transcriptPath;
}

function spawnPi(
  context: BenchmarkContext,
  stage: StageName,
  systemPrompt: string,
  options: { stdin?: string; args?: string[]; outputPath: string; inputPath: string },
): string {
  ensureParentDir(options.inputPath);
  ensureParentDir(options.outputPath);
  mkdirSync(context.artifacts.sessionDir, { recursive: true });

  const stageInput = options.stdin ?? (options.args ?? []).join(" ");
  writeFileSync(options.inputPath, stageInput);
  const sessionFilesBefore = listSessionFiles(context);

  const result = spawnSync("pi", buildPiArgs(context, systemPrompt, options.args ?? []), {
    cwd: context.target.bunRoot,
    encoding: "utf8",
    input: options.stdin,
    env: {
      ...process.env,
      PI_OFFLINE: process.env.PI_OFFLINE ?? "1",
    },
  });

  captureNewSessionFile(context, stage, sessionFilesBefore);
  writeFileSync(options.outputPath, result.stdout);

  if (result.status !== 0) {
    throw new Error(`${context.target.datasetId} ${stage} pi invocation failed with exit code ${result.status ?? -1}`);
  }

  return result.stdout;
}

function firstNonEmptyLine(output: string): string {
  return output
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.length > 0) ?? "";
}

function classifyBug(output: string): BugClassification {
  const firstLine = firstNonEmptyLine(output).toLowerCase();
  if (
    firstLine === "intended bug found" ||
    firstLine === "valid bug found" ||
    firstLine === "no bug found"
  ) {
    return firstLine;
  }
  return "unknown";
}

function writeFinalReports(context: BenchmarkContext, result: PipelineResult): void {
  ensureParentDir(context.artifacts.finalReportJson);
  ensureParentDir(context.artifacts.finalReportMd);

  const jsonReport = {
    datasetId: context.target.datasetId,
    target: {
      rust: `${context.target.rustFile}::${context.target.rustFunction}`,
      zig: context.target.zigFile,
      semanticAnchor: context.target.zigSemanticAnchor,
      stage1Selector: context.target.stage1Selector,
      expectedBugSlug: context.target.expectedBugSlug,
      expectedStage3Label: context.target.expectedStage3Label,
      bugSummary: context.target.bugSummary,
      notes: context.target.notes,
    },
    stages: result,
  };

  const mdReport = [
    "# Pipeline Report",
    "",
    `datasetId: ${context.target.datasetId}`,
    `rustTarget: ${context.target.rustFile}::${context.target.rustFunction}`,
    `zigReference: ${context.target.zigFile} (${context.target.zigSemanticAnchor})`,
    `stage1Selector: ${context.target.stage1Selector}`,
    `expectedBug: ${context.target.expectedBugSlug}`,
    `expectedStage3Label: ${context.target.expectedStage3Label}`,
    "",
    "## Stage 1",
    `transcript: ${result.stage1.transcript}`,
    "",
    "## Stage 2",
    `transcript: ${result.stage2.transcript}`,
    "",
    "## Stage 3",
    `transcript: ${result.stage3.transcript}`,
    "",
    "### Selected Theorem",
    "```text",
    result.stage3.output.trimEnd(),
    "```",
    "",
    "## Stage 4",
    `transcript: ${result.stage4.transcript}`,
    "",
    "### Stage 4 Output",
    "```text",
    result.stage4.output.trimEnd(),
    "```",
    "",
    "## Stage 5",
    `transcript: ${result.stage5.transcript}`,
    `classification: ${result.stage5.classification}`,
    "",
    "### Stage 5 Output",
    "```text",
    result.stage5.output.trimEnd(),
    "```",
  ].join("\n");

  writeFileSync(context.artifacts.finalReportJson, JSON.stringify(jsonReport, null, 2));
  writeFileSync(context.artifacts.finalReportMd, mdReport);
}

export function runStage1(context: BenchmarkContext): string {
  return spawnPi(context, "stage1", readFileSync(context.target.rustPrompt, "utf8"), {
    stdin: buildStage1Input(context),
    outputPath: context.artifacts.stageOutput.stage1,
    inputPath: context.artifacts.stageInput.stage1,
  });
}

export function runStage2(context: BenchmarkContext): string {
  const stageInput = buildStage2Input(context);
  return spawnPi(context, "stage2", readFileSync(context.target.theoremDiscoveryPrompt, "utf8"), {
    args: [stageInput],
    outputPath: context.artifacts.stageOutput.stage2,
    inputPath: context.artifacts.stageInput.stage2,
  });
}

export function runStage3(context: BenchmarkContext, stage2Output: string): string {
  const stageInput = buildStage3Input(context, stage2Output);
  return spawnPi(context, "stage3", readFileSync(context.target.theoremSelectionPrompt, "utf8"), {
    stdin: stageInput,
    outputPath: context.artifacts.stageOutput.stage3,
    inputPath: context.artifacts.stageInput.stage3,
  });
}

export function runStage4(context: BenchmarkContext, selectedTheorem: string): string {
  return spawnPi(context, "stage4", buildStage4SystemPrompt(context), {
    stdin: buildStage4Input(selectedTheorem),
    outputPath: context.artifacts.stageOutput.stage4,
    inputPath: context.artifacts.stageInput.stage4,
  });
}

export function runStage5(
  context: BenchmarkContext,
  selectedTheorem: string,
  proofOutput: string,
): string {
  return spawnPi(context, "stage5", readFileSync(context.target.theoremJudgementPrompt, "utf8"), {
    stdin: buildStage5Input(context, selectedTheorem, proofOutput),
    outputPath: context.artifacts.stageOutput.stage5,
    inputPath: context.artifacts.stageInput.stage5,
  });
}

export function runBenchmark(record: DatasetRecord): PipelineResult {
  const context = createBenchmarkContext(record);
  const stage1Output = runStage1(context);
  const stage2Output = runStage2(context);
  const stage3Output = runStage3(context, stage2Output);
  const stage4Output = runStage4(context, stage3Output);
  const stage5Output = runStage5(context, stage3Output, stage4Output);

  const result: PipelineResult = {
    datasetId: context.target.datasetId,
    stage1: {
      transcript: requireTranscriptPath(context, "stage1"),
      output: stage1Output,
    },
    stage2: {
      transcript: requireTranscriptPath(context, "stage2"),
      output: stage2Output,
    },
    stage3: {
      transcript: requireTranscriptPath(context, "stage3"),
      output: stage3Output,
    },
    stage4: {
      transcript: requireTranscriptPath(context, "stage4"),
      output: stage4Output,
    },
    stage5: {
      transcript: requireTranscriptPath(context, "stage5"),
      output: stage5Output,
      classification: classifyBug(stage5Output),
    },
  };

  writeFinalReports(context, result);
  return result;
}

function sampleRandomRecords(records: DatasetRecord[], count: number): DatasetRecord[] {
  const pool = [...records];
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
  }
  return pool.slice(0, Math.min(count, pool.length));
}

export function runRandomSample(count = RANDOM_SAMPLE_SIZE): PipelineResult[] {
  const records = sampleRandomRecords(resolvedDatasetRecords(), count);
  const results: PipelineResult[] = [];

  for (const record of records) {
    results.push(runBenchmark(record));
  }

  return results;
}

export function describeRandomSample(count = RANDOM_SAMPLE_SIZE): string {
  return sampleRandomRecords(resolvedDatasetRecords(), count)
    .map((record) => describeBenchmark(createBenchmarkContext(record)))
    .join("\n\n");
}

if (import.meta.main) {
  const result = runBenchmark(resolveDatasetRecordById(DEFAULT_DATASET_ID));
  const summary = [{
    datasetId: result.datasetId,
    classification: result.stage5.classification,
    report: path.join(OUTPUT_ROOT, sanitizeRunId(result.datasetId), "report.md"),
  }];
  console.log(JSON.stringify(summary, null, 2));
}
