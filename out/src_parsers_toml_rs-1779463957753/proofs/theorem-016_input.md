16. `theorem_id`: `TOML_ARRAY_TABLE_HEADER_REQUIRES_LINE_BREAK_AFTER_CLOSE`
    - `source_file`: `src/parsers/toml.zig`
    - `source_reference`: `runParser`, lines 178-181
    - `statement`: A double-bracket table-array header must be followed by newline boundary.
    - `preconditions`: Parser consumed `]]` and next token has `has_newline_before == false`.
    - `expected_behavior`: Parser emits expected `"line break"` syntax error.
    - `edge_cases_covered`: `[[a]] x=1` on same line.
    - `why_this_is_Zig_derived`: Same line-break check as single table header.
    - `ambiguities_or_assumptions`: EOF boundary depends on lexer.