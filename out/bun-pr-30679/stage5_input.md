dataset_id: bun-pr-30679
expected_bug_slug: json_lexer_define_fallback_blocked
expected_stage3_label: intended bug found
bug_summary: JSON lexer rejected ?, *, (, ) too early, so the Zig fallback that auto-quotes non-JSON define values never ran.
rust_selector: @src/parsers/json_lexer.rs::next
zig_semantic_anchor: next on the JSON lexer path
notes: There is no standalone json_lexer.zig; JSON mode lives in js_parser/lexer.zig.

theorem_packet:
11. **theorem packet**
    - `theorem_id`: `LEX_QUESTION_FAMILY`
    - `source_file`: `src/js_parser/lexer.zig`
    - `source_reference`: `next`, `'?'` branch
    - `statement`: `?`, `??`, `??=`, and `?.` tokenize distinctly, with `?.` suppressed before decimal digits.
    - `preconditions`: Current code point is `?`.
    - `expected_behavior`: Emits `t_question`, `t_question_question`, `t_question_question_equals`, or `t_question_dot`; `?.` before digit remains `t_question`.
    - `edge_cases_covered`: `a?.1:b` disambiguation.
    - `why_this_is_Zig_derived`: Branch checks `?`, `=`, and lookahead after `.` to avoid numeric ambiguity.
    - `ambiguities_or_assumptions`: Parser later interprets the remaining `.`/digit.

proof_output:
Theorem packet `LEX_QUESTION_FAMILY` was **not proved**.

Failure classification: **likely bug / divergence**.

What I investigated:
- Read Zig source `src/js_parser/lexer.zig`, `next`, `?` branch.
- Read existing Dafny model `src/parsers/json_lexer.dfy`.
- Checked Rust sliced port `src/parsers/json_lexer.rs::next`.
- Ran Dafny verification before and after adding the Zig-derived obligation.

Zig confirmation:
- Zig’s `?` branch has no JSON rejection guard.
- It tokenizes:
  - `?` → `t_question`
  - `??` → `t_question_question`
  - `??=` → `t_question_question_equals`
  - `?.` → `t_question_dot`
  - but `?.` before decimal digit remains `t_question`, preserving `a?.1:b` disambiguation.

Dafny/model blocker:
- The Dafny token datatype has no question-family tokens.
- More importantly, the modeled `Next()` body rejects `?` immediately here:

```dafny
} else if code_point == 63 || ... {
  r := AddUnsupportedSyntaxError("Operators are not allowed in JSON");
  return;
}
```

Added proof/spec attempt:
- Added a minimal Zig-derived postcondition to `Next()`:

```dafny
ensures old(code_point) == 63 ==> r == Ok
```

- Added an explicit edge witness for `?.` before a digit:

```dafny
ensures old(code_point) == 63 &&
        0 <= old(current) &&
        old(current) < |old(source)| &&
        old(source)[old(current)] == 46 &&
        old(current) + 1 < |old(source)| &&
        48 <= old(source)[old(current) + 1] <= 57
        ==> r == Ok
```

- Added only ghost/invariant proof scaffolding to avoid unrelated proof noise.

Verification result:
- Baseline Dafny file verified: `19 verified, 0 errors`.
- With the Zig-derived obligation, verification fails at the `?` unsupported-operator return path:

```text
src/parsers/json_lexer.dfy(424,10): Error: a postcondition could not be proved on this return path
src/parsers/json_lexer.dfy(246,42): Related location: this is the postcondition that could not be proved
```

Conclusion:
- This is not just a proof gap.
- The existing Dafny/Rust JSON lexer model rejects `?` before the Zig fallback/token-family behavior can occur.
- That matches the expected bug signal: JSON lexer rejects `?` too early, blocking the fallback that should auto-quote non-JSON define values.