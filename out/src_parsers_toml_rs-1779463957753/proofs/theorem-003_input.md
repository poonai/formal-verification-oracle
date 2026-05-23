3. `theorem_id`: `TOML_SEMICOLON_COMMENT_ONLY_AT_LINE_START_IS_SKIPPED`
   - `source_file`: `src/parsers/toml/lexer.zig`
   - `source_reference`: `Lexer.next`, lines 588-607
   - `statement`: A semicolon starts a comment only when `has_newline_before` is true.
   - `preconditions`: Current token scan sees `;` and `has_newline_before == true`.
   - `expected_behavior`: Lexer skips until line break or EOF and continues scanning.
   - `edge_cases_covered`: File begins with semicolon; semicolon after newline.
   - `why_this_is_Zig_derived`: Zig checks `if (lexer.has_newline_before)` before skipping a semicolon comment.
   - `ambiguities_or_assumptions`: `has_newline_before` at file start is true because `lexer.end == 0`.