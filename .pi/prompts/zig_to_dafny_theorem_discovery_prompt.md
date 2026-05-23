Read the Zig source first and derive the complete set of candidate theorems / behavioral cases that should hold for the corresponding Dafny model.

Primary goal:
- Treat Zig as the semantic source of truth.
- Enumerate the full behavior space as discrete theorems or case splits.
- Cover no-flag behavior, valid flag combinations, invalid-flag termination behavior, empty/singleton/boundary inputs, and special edge cases.
- Do not prove anything yet.
- Do not change the Dafny model.
- Do not try to repair mismatches at this stage.

Core rules:
- Read the Zig function first, then nearby helpers and any imported code that materially affects behavior.
- Do not infer behavior primarily from the Dafny model.
- If behavior is unclear, confirm it from Zig source or a minimal Zig experiment.
- Prefer splitting into separate theorems when the Zig behavior branches in a meaningfully different way.
- Keep each theorem small enough that a later prover prompt can test it directly against the fixed Dafny model.

What to extract from Zig:
- caller obligations
- valid and invalid flag combinations
- output transformation rules
- return-value meaning
- write effects on buffers or state
- early-exit and stop conditions
- robustness guarantees
- empty input and boundary-length behavior
- special delimiter / escape / trimming edge cases
- branch-specific invariants or state relationships

Theorem construction rules:
- Each theorem should describe one Zig-derived behavioral claim.
- State the exact input pattern or precondition.
- State the expected observable result or state relation.
- State why the Zig source implies the claim.
- Include no-flag cases explicitly, not just flag cases.
- If a behavior depends on multiple branches, split it into separate theorems unless the branches are truly inseparable.
- Do not include proof steps or Dafny details beyond what is needed to express the claim.

Output format:
- Produce a numbered list of theorem packets.
- Each packet must include:
  - `theorem_id`
  - `source_file`
  - `source_reference`
  - `statement`
  - `preconditions`
  - `expected_behavior`
  - `edge_cases_covered`
  - `why_this_is_Zig_derived`
  - `ambiguities_or_assumptions`
- Keep the packets concise and machine-readable.

Short principle:
- Read Zig, enumerate the behavior space, and hand off precise theorem packets for later proof against the fixed Dafny model.
