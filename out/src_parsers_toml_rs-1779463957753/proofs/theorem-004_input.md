4. `theorem_id`: `TOML_SEMICOLON_INLINE_IS_SYNTAX_ERROR`
   - `source_file`: `src/parsers/toml/lexer.zig`
   - `source_reference`: `Lexer.next`, lines 588-607
   - `statement`: A semicolon not preceded by a newline boundary is invalid.
   - `preconditions`: Lexer sees `;` with `has_newline_before == false`.
   - `expected_behavior`: Parser terminates with `SyntaxError`; log receives `"Unexpected semicolon"`.
   - `edge_cases_covered`: Inline semicolon after assignment/value.
   - `why_this_is_Zig_derived`: Zig calls `addDefaultError("Unexpected semicolon")` in the non-newline branch.
   - `ambiguities_or_assumptions`: Exact propagation type may be modeled generically as parse failure.