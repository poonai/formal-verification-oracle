Find bugs in an existing Dafny method by reading the Zig source first, treating Zig as the semantic source of truth, and using the existing Dafny model as the thing under test.

Primary goal:
- Do not change the existing Dafny method logic.
- Keep the Dafny model fixed so proof failure can reveal divergence instead of being hidden by a rewrite.
- Infer the intended behavior, caller obligations, robustness guarantees, and key state invariants from the Zig implementation and closely related behavior.
- Add Dafny specifications, assertions, loop invariants, framing, helper functions, and lemmas around the existing Dafny method so it is checked against those inferred semantics.
- Treat the verification effort as a bug-finding process: the goal is to expose where the unchanged Dafny method, its assumptions, or its stated contract fail to match Zig semantics.
- If the model cannot prove a Zig-derived theorem, treat that as evidence of a mismatch, missing spec, or bug rather than repairing the model to make the proof succeed.
- Prefer surfacing a real semantic mismatch over making the proof go through by weakening the specification or silently dropping a Zig guarantee.

Core rules:
- The existing Dafny method body must remain unchanged.
- Verification work must happen around the method, not by rewriting the method.
- Do not infer intended semantics primarily from the Dafny method when Zig provides the reference behavior.
- Do not change Dafny logic merely to make it match the Zig implementation or to satisfy a theorem.
- If the Zig behavior suggests the implementation itself should be improved, make that case against the original Rust source and its intended semantics, not by silently rewriting the Dafny method to mirror Zig.
- Use Zig to identify intended semantics, invariants, caller discipline, and possible bugs; do not use Zig as a license to translate or port the algorithm into Dafny.
- Exception: if the Dafny body is clearly a stub, placeholder, or unimplemented shell, and Rust is the source of truth for the missing behavior, you may complete the body with Rust-faithful logic before verification. Do not use this exception for an already-real implementation or to hide a Zig-vs-Rust-vs-Dafny divergence.
- When Zig establishes a robustness guarantee, preserve that guarantee in the specification. Do not silently accept a crash, panic, abort, or malformed-state behavior if Zig or released behavior treats it as recoverable.

Invariant-first methodology:
- Read the Zig function first.
- Read nearby Zig helpers and surrounding logic that determine the function’s semantics.
- Read any relevant imported Zig files, referenced helper functions, and standard-library implementations when they materially affect behavior, bounds, error handling, aliasing, ownership, or return-value meaning.
- Do not treat the pointed Zig file as sufficient if it delegates important behavior elsewhere.
- Identify the concrete invariant or state relationship the method is supposed to preserve.
- Express the specification in terms of that invariant.

Things to extract from Zig:
- valid-input assumptions
- caller obligations
- intermediate state relationships
- output transformation
- return-value meaning
- write effects on arrays, slices, or buffers
- error behavior and robustness guarantees
- important edge cases

Behavior-verification rule:
- Do not assume Zig semantics from trained knowledge when they materially affect the specification.
- If behavior is unclear, confirm it by:
  - reading the relevant Zig source, including imported files, referenced helpers, and standard-library code involved in the behavior, or
  - writing a minimal Zig program that demonstrates the behavior.
- Use this especially for:
  - standard-library API contracts

What to add:
- Preconditions that capture caller obligations implicit in Zig.
- Postconditions that describe the observable behavior defined by Zig.
- Assertions and loop invariants that capture the key state relationship throughout execution.
- Pure helper functions and lemmas only when needed to express or prove Zig-derived semantics.
- Theorems or case splits that enumerate the full Zig-derived behavior space, including no-flag and edge-case branches, so failures identify where the Dafny model diverges.

What not to do:
- Do not rewrite the existing Dafny method into a different algorithm.
- Do not optimize, simplify, or clean up the method body.
- Do not replace imperative logic with a functional reimplementation.
- Do not modify Dafny control flow, state updates, or branching just to resemble Zig more closely.
- Do not "fix" the Dafny file by porting Zig behavior into it when the task is to verify or diagnose the existing Dafny logic.
- Do not strengthen behavior beyond what Zig or the established reference behavior actually guarantees.
- Do not guess low-level semantics when they can be checked directly.

When verification fails:
1. First ask whether the failure indicates a real bug or semantic mismatch in the unchanged Dafny method, its assumptions, or its contract relative to Zig.
2. Fix syntax or purity issues locally.
3. Add framing, bounds, and termination facts that reflect obligations already implicit in Zig.
4. Add assertions, invariants, helper functions, or lemmas to prove the unchanged method.
5. If the semantic point is still unclear, confirm it from Zig source or a minimal Zig experiment.
6. Do not modify the method body.
7. Do not change the Dafny method body merely to align it with Zig or to make the theorem succeed.
8. If the theorem still cannot be proved after the specification work, report the mismatch clearly instead of rewriting the model.

Output requirements:
- Keep the Dafny method body unchanged.
- State the inferred invariant explicitly.
- State which assumptions come from Zig caller discipline.
- State which robustness guarantees come from Zig or established released behavior.
- State any semantic point that was confirmed by a Zig experiment.
- State the Zig-derived theorem/case set you used to pressure the model.
- State which cases the Dafny model proves and which cases fail, since those failures are the bug signal.
- If verification reveals a mismatch, state clearly whether it is:
  - a likely bug in the Dafny method
  - a missing Dafny precondition or postcondition
  - a proof gap that still appears semantically correct
- If there is ambiguity, say so instead of silently choosing behavior.

Short principle:
- Recover the Zig invariant, enumerate the Zig-derived theorem set, verify it against the unchanged Dafny model, and treat any unprovable case as a potential bug or divergence.
