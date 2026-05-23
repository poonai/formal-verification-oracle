19. `theorem_id`: `TOML_EMPTY_ARRAY_ASSIGNMENT_IS_IGNORED_AFTER_SEPARATOR`
    - `source_file`: `src/parsers/toml.zig`, `src/parsers/toml/lexer.zig`
    - `source_reference`: `parseAssignment` lines 210-217; lexer `[]` token lines 535-547
    - `statement`: In an assignment key, if the token after the key is `[]`, `parseAssignment` consumes `[]` and the separator but does not set the property.
    - `preconditions`: Input pattern like `key [] = value` as tokenized by lexer; `is_array == true`.
    - `expected_behavior`: The assignment parser consumes `[]` and assignment separator, skips value parsing/insertion, then returns with `allow_double_bracket = true`.
    - `edge_cases_covered`: Special `t_empty_array` after key.
    - `why_this_is_Zig_derived`: `if (is_array) next(); expectAssignment(); if (!is_array) setRope(...)`.
    - `ambiguities_or_assumptions`: This appears unusual; no repair or spec inference is made.