29. `theorem_id`: `TOML_ALLOW_DOUBLE_BRACKET_TRUE_TOKENIZES_DOUBLE_BRACKETS`
    - `source_file`: `src/parsers/toml/lexer.zig`, `src/parsers/toml.zig`
    - `source_reference`: lexer lines 535-556; parser lines 172-195, 241, 315, 353
    - `statement`: When `allow_double_bracket == true`, `[[` and `]]` tokenize as double-bracket table-array delimiters.
    - `preconditions`: Lexer sees adjacent brackets and `allow_double_bracket == true`.
    - `expected_behavior`: `[[` token is `t_open_bracket_double`; `]]` token is `t_close_bracket_double`; parser can enter array-table header branch.
    - `edge_cases_covered`: Valid internal flag combination; table-array header.
    - `why_this_is_Zig_derived`: Lexer only emits double bracket tokens under `allow_double_bracket`.
    - `ambiguities_or_assumptions`: This is an internal parser flag, not a public option.