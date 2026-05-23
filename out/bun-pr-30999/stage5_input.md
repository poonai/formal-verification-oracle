dataset_id: bun-pr-30999
expected_bug_slug: brace_expanded_globs_second_pass_missing
expected_stage3_label: intended bug found
bug_summary: Brace-expanded shell globs stopped globbing the expanded patterns, so the second expansion pass never ran.
rust_selector: @src/runtime/shell/states/Expansion.rs::do_brace_expand
zig_semantic_anchor: next braces state transition
notes: PR 30999 changes brace-expansion to glob transition; Rust helper target is do_brace_expand.

theorem_packet:
31. `theorem_id`: `EXP_BRACE_THEN_GLOB_TRANSITIONS_TO_GLOB`
   - `source_file`: `/home/saint/bun/src/runtime/shell/states/Expansion.zig`
   - `source_reference`: `next`, lines 280-284
   - `statement`: If a node has both brace and glob expansion flags, the expansion state moves to glob after pushing brace results.
   - `preconditions`: State is `.braces`; `node.has_glob_expansion() == true`.
   - `expected_behavior`: `state == glob` after brace results are pushed.
   - `edge_cases_covered`: Combined brace/glob expansion.
   - `why_this_is_Zig_derived`: Final conditional in braces branch.
   - `ambiguities_or_assumptions`: The glob pattern used is still `current_out`; comments note brace + command substitution has unsupported weird behavior.

proof_output:
The theorem was **not proved**.

Classification: **likely bug / divergence**

What I investigated:
- Read the theorem packet first.
- Confirmed Zig behavior in `/home/saint/bun/src/runtime/shell/states/Expansion.zig` lines 280-284:
  - after brace results are pushed, `has_glob_expansion()` sets `state = .glob`.
- Compared Rust target `do_brace_expand`:
  - `/home/saint/bun/src/runtime/shell/states/Expansion.rs` lines 296-303 sets `ExpansionState::Done` even when `atom.has_glob_expansion()` is true.
  - The nearby comment explicitly notes brace+glob is left as a TODO.
- Compared Dafny model:
  - `/home/saint/bun/src/runtime/shell/states/Expansion.dfy` lines 181-186 also sets `Done` in both branches.

Proof attempt:
- Added theorem method:

```dafny
method EXP_BRACE_THEN_GLOB_TRANSITIONS_TO_GLOB(me: Expansion)
  requires me.state == BraceExpand
  requires me.node.has_glob_expansion == true
  modifies me, me.out
  ensures me.state == Glob
```

- Added edge-case witness for combined brace/glob expansion.

Verification result:

```text
src/runtime/shell/states/Expansion.dfy(211,2): Error: assertion might not hold
src/runtime/shell/states/Expansion.dfy(223,2): Error: assertion might not hold
Dafny program verifier finished with 18 verified, 2 errors
```

Zig point confirmed:
- The final conditional in the Zig `.braces` branch transitions to `.glob` when the node has glob expansion.

Added specs / helper lemmas:
- Added only the theorem method and one concrete combined brace/glob witness.
- No Dafny method body was changed.

Conclusion:
- This is not a proof gap or missing spec: the Dafny model directly contradicts the Zig-derived theorem by setting `Done` instead of `Glob`.
- This matches the expected bug signal: brace-expanded glob patterns skip the second glob expansion pass.