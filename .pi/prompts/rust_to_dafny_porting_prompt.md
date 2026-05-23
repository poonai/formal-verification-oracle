Port the Rust code into Dafny with a Rust-faithful methodology.

Primary goal:
- Preserve Rust-to-Dafny operational equivalence as closely as possible.
- Follow the same function signature unless the target language absolutely forces a trivial surface adaptation.
- Keep the function body 1:1 with the Rust logic.
- Do not redesign the algorithm.
- Do not add postconditions, preconditions, or specifications unless explicitly requested.
- Write the Dafny file next to the target file with the same file name.

Porting rules:
- Preserve the original control flow structure.
- Preserve local variable structure and update order.
- Preserve branch conditions and loop structure.
- Preserve return-value behavior.
- Preserve byte-level and slice-level logic.
- If Rust uses helper operations that Dafny does not have directly, introduce minimal helper functions or methods that abstract the Rust-specific primitive without changing the surrounding algorithm.
- Keep helper abstractions narrow and mechanical. They should support the port, not reinterpret it.
- Add at most one concrete assertion using a sample input/output example as a sanity check that the port still behaves as expected. The sample assertion must be proved from the ported Rust logic as written; do not use `assume`, `{:axiom}`, or any equivalent proof shortcut to force it to pass.
- Add concrete assertions that exercise the functionality of all ported functions on representative sample inputs.

What is allowed:
- Abstract Rust language-specific semantics such as slice copying, ASCII case folding, or substring search behind small Dafny helpers.
- Add the minimum Dafny framing or termination scaffolding required for verification.
- Add minimal internal assumptions only when they encode caller guarantees or bounds facts that are implicit in the Rust code.

What is not allowed:
- Do not strengthen the function with new behavioral guarantees.
- Do not refactor the code into a different algorithm.
- Do not replace loops with higher-level specifications if the Rust implementation is imperative.
- Do not introduce proof-oriented structure into the main algorithm unless verification forces it.
- Do not silently “improve” the Rust behavior.
- Do not use the sample assertion to change, reinterpret, or justify logic that was derived from Rust.
- Do not weaken, replace, or axiomatize failing assertions to make verification succeed; if an assertion failure points to a likely Rust logical error or incorrect caller assumption, report it and keep the assertion failing until the underlying issue is addressed.

When Dafny verification fails:
1. First fix syntax or pure/impure mismatches in the most local way possible.
2. Then add only the minimum framing, bounds, or termination scaffolding needed.
3. Keep verifier-oriented changes separate from the operational logic.
4. If a deviation is unavoidable, state clearly whether it affects only verification structure or actual runtime behavior.

Output requirements:
- Produce Dafny code that mirrors the Rust implementation as directly as possible.
- If helper routines are needed, keep them small and obviously tied to Rust primitives.
- If verification-driven scaffolding is added, preserve the core algorithm unchanged.
- If you add a sample assertion, keep it isolated, purely diagnostic, and honestly proved from the ported code.
- Call out any non-operational deviations explicitly.

Short principle:
- Port the Rust code, not a reimagined verified version of it.
