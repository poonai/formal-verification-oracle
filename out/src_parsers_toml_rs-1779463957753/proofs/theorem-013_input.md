13. `theorem_id`: `TOML_TABLE_HEADER_REQUIRES_LINE_BREAK_AFTER_CLOSE`
    - `source_file`: `src/parsers/toml.zig`
    - `source_reference`: `runParser`, lines 155-158
    - `statement`: A single-bracket table header must be followed by a newline or EOF-like newline boundary before the next token.
    - `preconditions`: Parser consumed `]` for a table header and lexer’s next token has `has_newline_before == false`.
    - `expected_behavior`: Parser emits expected `"line break"` syntax error.
    - `edge_cases_covered`: `[a] b=1`; table header with inline trailing token.
    - `why_this_is_Zig_derived`: Zig checks `if (!p.lexer.has_newline_before) expectedString("line break")`.
    - `ambiguities_or_assumptions`: EOF handling depends on lexer setting `has_newline_before`.