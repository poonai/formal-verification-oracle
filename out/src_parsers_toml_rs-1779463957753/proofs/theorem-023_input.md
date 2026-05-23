23. `theorem_id`: `TOML_SIGN_WITHOUT_NUMBER_IS_SYNTAX_ERROR`
    - `source_file`: `src/parsers/toml.zig`
    - `source_reference`: `parseValue`, lines 273-285
    - `statement`: A `+` or `-` value token must be followed by a numeric literal.
    - `preconditions`: Value token is `t_plus` or `t_minus`; after `next()`, token is not `t_numeric_literal`.
    - `expected_behavior`: Parser terminates via `expect(.t_numeric_literal)` error.
    - `edge_cases_covered`: `key = -foo`; `key = +]`; EOF after sign.
    - `why_this_is_Zig_derived`: Sign branches call `p.lexer.expect(.t_numeric_literal)`.
    - `ambiguities_or_assumptions`: Whitespace is skipped by lexer before expectation.