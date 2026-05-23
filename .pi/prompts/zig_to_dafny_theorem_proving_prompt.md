Take one theorem packet derived from Zig and try to prove it against the existing Dafny model.

Primary goal:
- Use the theorem packet as the specification target.
- Keep the Dafny model fixed by default.
- Prove the theorem using specifications, assertions, invariants, framing, helper functions, and lemmas only.
- If the theorem cannot be proved, treat that as evidence of a mismatch, missing spec, or bug in the model relative to Zig.
- Do not repair the model by rewriting its logic to make the theorem succeed.
- Exception: if the Dafny body is clearly a stub, placeholder, or unimplemented shell, and Rust is the source of truth for the missing behavior, the body may be completed with Rust-faithful logic before proving the theorem.
- Treat any such body edit as stub completion, not as a proof-oriented rewrite; if the body is not clearly a stub, keep it fixed.
- Investigate the failure with the available tools: inspect the Dafny model, read nearby source, confirm Zig behavior when needed, and report the concrete blocker or divergence.

Core rules:
- Read the theorem packet first.
- Read the Zig source only as needed to understand the theorem packet or confirm ambiguity.
- Do not infer behavior primarily from the Dafny model.
- Do not modify the Dafny method body.
- Do not strengthen the theorem beyond what Zig or the theorem packet actually states.
- If the theorem packet is ambiguous, say so before trying to prove it.
- Use tool access to narrow the cause of failure instead of guessing.
- If a failure looks like a proof gap, try the smallest local proof-oriented change needed to confirm that diagnosis.
- If the method is only a stub and you complete it from Rust, still verify whether Zig and Rust agree; any mismatch remains a divergence signal.

Zig-derived helper/spec rules:
- When a theorem packet references a Zig helper, encode that helper's behavior directly from the referenced Zig source before proving the main theorem.
- Do not define auxiliary spec functions by mirroring the Dafny method body unless you can point to the same structure or semantics in Zig.
- If an auxiliary spec function is structurally identical to the Dafny implementation but not to the referenced Zig code, treat it as suspect and rederive it from Zig.
- For every edge case named in the theorem packet, add a small Dafny witness assertion, lemma, or theorem that captures the Zig-derived result for that edge case.
- The main theorem is not considered proved unless those edge-case witnesses are encoded and either verified or shown to fail against the existing model.
- If a Zig-derived helper witness conflicts with the Dafny model, report that conflict as likely bug / divergence; do not adjust the helper spec to match Dafny.

What to prove:
- Caller obligations encoded in the theorem packet
- Observable output or state relation
- Edge-case behavior explicitly covered by the theorem packet
- Any robustness guarantee stated by the theorem packet

Allowed verification work:
- Add preconditions, postconditions, assertions, loop invariants, framing, and helper lemmas if they are needed to prove the theorem.
- Add small auxiliary definitions if they help express the theorem precisely.
- Use the minimum additional structure needed to make the proof honest.

What not to do:
- Do not change the Dafny method body.
- Exception: if the method is clearly a stub / placeholder and Rust is the implementation source, you may complete the body once, but do not use that exception to rewrite an already-real implementation.
- Do not change control flow, branching, or state updates to match Zig more closely.
- Do not weaken the theorem just to make verification pass.
- Do not replace a failed theorem with a different claim unless the original theorem packet was found to be ambiguous or incorrect.

When verification fails:
1. Decide whether the failure is due to:
   - a real semantic mismatch
   - a missing Dafny precondition or postcondition
   - a proof gap
   - an ambiguous or over-strong theorem packet
2. Investigate the likely cause with the available tools before classifying it.
3. If the theorem is well-formed and faithful to Zig, report the failure as a potential divergence or bug signal with the concrete evidence you found.
4. If the theorem packet is ambiguous, state the ambiguity and stop rather than silently changing the claim.
5. Do not rewrite the Dafny model to make the theorem succeed, except to complete a clearly stubbed body from Rust when that is the missing implementation work.

Output requirements:
- State whether the theorem was proved.
- If not proved, classify the failure as one of:
  - likely bug / divergence
  - missing Dafny spec
  - proof gap
  - ambiguous theorem packet
- State what you investigated to reach that classification.
- State any Zig point that needed confirmation.
- State any added specs or helper lemmas used for the proof.

Short principle:
- Prove the Zig-derived theorem against the fixed Dafny model, and let failure expose the bug.
