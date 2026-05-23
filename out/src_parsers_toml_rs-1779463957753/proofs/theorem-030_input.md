30. `theorem_id`: `TOML_ALLOW_DOUBLE_BRACKET_FALSE_PREVENTS_DOUBLE_BRACKET_TOKENS`
    - `source_file`: `src/parsers/toml/lexer.zig`, `src/parsers/toml.zig`
    - `source_reference`: lexer lines 535-556; parser lines 205-207, 330
    - `statement`: When `allow_double_bracket == false`, adjacent brackets are not combined into double-bracket tokens.
    - `preconditions`: Lexer sees `[[` or `]]` while flag is false, such as during assignment key parsing or array parsing.
    - `expected_behavior`: First bracket is tokenized as single `[` or `]`; subsequent bracket remains for later scanning, often causing context-specific syntax error.
    - `edge_cases_covered`: Invalid internal flag combination for table-array syntax inside arrays/assignments.
    - `why_this_is_Zig_derived`: Lexer’s double-bracket token branches are guarded by `lexer.allow_double_bracket`.
    - `ambiguities_or_assumptions`: Exact later termination depends on context.