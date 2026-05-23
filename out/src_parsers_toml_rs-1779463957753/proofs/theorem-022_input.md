22. `theorem_id`: `TOML_VALUE_NUMERIC_AND_SIGNED_NUMERIC`
    - `source_file`: `src/parsers/toml.zig`
    - `source_reference`: `parseValue`, lines 268-285
    - `statement`: Numeric values parse to `E.Number`; leading `-` negates next numeric literal and leading `+` preserves it.
    - `preconditions`: Value token is numeric literal, or `-`/`+` followed by numeric literal.
    - `expected_behavior`: Returned number is lexer number, `-lexer.number`, or `+lexer.number`; sign requires immediate numeric token after lexer skipping whitespace.
    - `edge_cases_covered`: Positive sign; negative number; sign not followed by number.
    - `why_this_is_Zig_derived`: `parseValue` explicitly handles `t_numeric_literal`, `t_minus`, and `t_plus`.
    - `ambiguities_or_assumptions`: Numeric lexing behavior is separately packetized.