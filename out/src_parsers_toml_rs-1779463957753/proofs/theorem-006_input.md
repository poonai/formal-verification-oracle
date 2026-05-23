6. `theorem_id`: `TOML_ASSIGNMENT_MISSING_SEPARATOR_IS_SYNTAX_ERROR`
   - `source_file`: `src/parsers/toml.zig`, `src/parsers/toml/lexer.zig`
   - `source_reference`: `parseAssignment` lines 205-215; `expectAssignment` lines 501-509
   - `statement`: A valid key not followed by `=` or `:` fails.
   - `preconditions`: `parseAssignment` consumes a key and next token is neither `t_equal` nor `t_colon`.
   - `expected_behavior`: Parser terminates with expected-token syntax error for `t_equal`.
   - `edge_cases_covered`: Missing separator; newline after key; EOF after key.
   - `why_this_is_Zig_derived`: `expectAssignment` calls `expected(T.t_equal)` for all other tokens.
   - `ambiguities_or_assumptions`: Error text says expected `t_equal`, even though colon would also be accepted.