# Proof Rewrite

A harness for using Claude Code and Dafny to semantically audit AI-generated Rust ports against their original Zig implementations in the Bun JavaScript runtime.

## Abstract

As AI agents take on increasing shares of large-scale software porting work, the need for scalable semantic verification grows urgent. This project presents a three-stage harness pipeline in which Claude Code uses Dafny as a formal semantic lens to detect divergences between AI-generated Rust ports and their Zig source implementations. In Stage 1 the target Rust function is translated mechanically into Dafny; in Stage 2 behavioral theorems are discovered from the Zig source; and in Stage 3 every discovered theorem is attempted against the Rust-derived Dafny model. Each proof result is classified as `proved`, `likely bug / divergence`, `missing Dafny spec`, `proof gap`, `ambiguous theorem packet`, or `unknown`, producing a per-theorem semantic audit of the port.

This approach identified real bugs through genuine Dafny verification failures: in both cases the verifier rejected a Zig-derived postcondition against the Rust-based model, yielding a proof-driven divergence signal rather than a heuristic code review. These bugs were reported and had real-world impact. The main limitation we observed is model coverage: if the Dafny translation does not include the behavior where the bug occurs, the verifier has nothing meaningful to reject.

## Pipeline

The main wide harness is `wide_theorem_harness.ts`. It runs three stages:

1. **Rust → Dafny port**  
   Claude mechanically translates the target Rust file into a Dafny model written next to the Rust source with a `.dfy` extension.

2. **Theorem discovery from Zig**  
   Claude reads the corresponding Zig source and emits theorem packets describing Zig-derived behavior.

3. **Wide theorem proving**  
   The harness attempts to prove every discovered theorem against the Rust-derived Dafny model. Each theorem is run independently, with source-directory snapshots restored after each proof attempt so runs do not interfere with one another.

## Proof Classifications

| Classification | Meaning |
|---|---|
| `proved` | The Zig-derived theorem verified against the Rust-derived Dafny model. |
| `likely bug / divergence` | Dafny rejected a Zig-derived obligation, indicating semantic incompatibility. |
| `missing Dafny spec` | The required behavior, type, or function is absent from the Dafny model. |
| `proof gap` | The theorem may be valid, but proof scaffolding was insufficient. |
| `ambiguous theorem packet` | The theorem was unclear, contradictory, or underspecified. |
| `unknown` | The result could not be confidently classified. |

## Usage

This repo expects a local Bun checkout at:

```text
/home/saint/bun
```

It also expects the `pi` CLI to be installed and prompt files to exist under:

```text
/home/saint/bun/.pi/prompts/
```

Run the wide theorem harness with:

```bash
pnpm harness:wide -- --rust-file <path.rs> [--zig-file <path.zig>]
```

If `--zig-file` is omitted, the harness infers a sibling `.zig` file from the Rust path.

The older benchmark-oriented harness is still available:

```bash
pnpm harness
```

## Artifacts

Wide-harness runs write artifacts under:

```text
out/<sanitized-rust-path>-<timestamp>/
```

Typical output includes:

```text
stage1_input.md
stage1_output.md
stage2_input.md
stage2_output.md
proofs/
  theorem-001_input.md
  theorem-001_output.md
  theorem-002_input.md
  theorem-002_output.md
report.md
report.json
```

Session transcripts are written under `.pi-sessions/`.

## AI Safety Implications

Formal verification will not solve the alignment problem by itself, and it is not a universal fix for AI safety. But these results suggest it can significantly reduce the attack surface of AI-generated code. The analogy is like replacing a wooden door with a steel door: it does not guarantee the house cannot be robbed, but it makes failure harder, buys time, and blocks many easy paths in. Historically, functional programming and programming-languages research have developed powerful tools for avoiding whole classes of bugs, but the bottleneck has often been implementation difficulty and developer effort. With AI assistance, that bottleneck may shrink: agents can help generate models, specifications, proofs, and ports, making these methods more practical for real software. Formal methods are best understood as one strong safety layer, not the whole solution: they can make AI-generated software more auditable and help us build more stable systems while buying time to work on the deeper alignment problem.

## Future Work

The main limitation we observed is model coverage: if the Dafny translation does not include the behavior where the bug occurs, the verifier has nothing meaningful to reject. In future work, we plan to experiment with integrating this harness with [Aeneas](https://github.com/AeneasVerif/aeneas), which translates Rust into verification-oriented representations. This may improve the coverage and fidelity of the Rust-derived formal model and reduce the amount of manual or agent-generated modeling needed before theorem proving can begin.

## Conclusion

This project shows that formal verification can be a practical safety layer for AI-generated ports. By proving Zig-derived theorems against Rust-derived Dafny models, the harness found real bugs through verifier failures rather than heuristic review. The main limitation is model coverage: the verifier can only catch behavior represented in the model. Overall, the results suggest that proof-driven auditing can make AI-generated code more trustworthy.
