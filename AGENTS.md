# Agent Notes

## What this repo is
- This is a small harness repo for running a multi-stage `pi` pipeline against Bun Rust/Zig targets listed in `dataset.jsonl`.
- Main entrypoints are `harness.ts` (dataset-driven 5-stage run) and `wide_theorem_harness.ts` (prove every discovered theorem packet for one Rust/Zig pair).

## Verified commands
- `pnpm harness` runs `node harness.ts` (default dataset id is hardcoded to `bun-pr-30999`).
- `pnpm harness:wide -- --rust-file <path.rs> [--zig-file <path.zig>]` runs the wide theorem harness.
- `pnpm test` is intentionally non-functional and exits with error; do not use it as verification.

## Required local dependencies and paths
- Both harnesses depend on a local Bun checkout at absolute path `/home/saint/bun`.
- Both harnesses call external CLI `pi` via `spawnSync("pi", ...)`; runs fail if `pi` is not installed/in PATH.
- Prompt files are read from `/home/saint/bun/.pi/prompts/*.md`; missing prompt files will fail runs.
- `dataset.jsonl` stores absolute file paths into `/home/saint/bun`; updating dataset entries to relative paths will break current code.

## Runtime behavior that matters
- Pipeline order in `harness.ts` is fixed: stage1 -> stage2 -> stage3 -> stage4 -> stage5.
- `PI_OFFLINE` defaults to `1` when unset for all `pi` invocations.
- Artifacts are written under `out/<sanitized-run-id>/` (stage inputs/outputs + `report.json`/`report.md`).
- Session transcripts are written under `.pi-sessions/<sanitized-run-id>/` and harvested as `*.jsonl`.

## File-specific gotchas
- `harness.ts` uses `DEFAULT_DATASET_ID` constant; change it there if you want a different default run target.
- `wide_theorem_harness.ts` snapshots and restores source directories around each theorem proof attempt; this intentionally reverts intermediate file edits made during a run.
