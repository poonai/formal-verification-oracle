21. `theorem_id`: `TOML_VALUE_IDENTIFIER_IS_STRING`
    - `source_file`: `src/parsers/toml.zig`
    - `source_reference`: `parseValue`, lines 262-267
    - `statement`: An unquoted identifier value other than exact `true`/`false` parses as a string.
    - `preconditions`: Value token is `t_identifier`.
    - `expected_behavior`: Returned expression is `E.String` containing lexer identifier bytes.
    - `edge_cases_covered`: Bare string values; identifiers containing `-` or `:` after first char.
    - `why_this_is_Zig_derived`: `parseValue` maps `.t_identifier` to `E.String`.
    - `ambiguities_or_assumptions`: First character constraints come from lexer.