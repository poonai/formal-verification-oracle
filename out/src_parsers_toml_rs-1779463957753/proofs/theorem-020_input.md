20. `theorem_id`: `TOML_VALUE_BOOLEAN_LITERALS`
    - `source_file`: `src/parsers/toml.zig`
    - `source_reference`: `parseValue`, lines 243-256
    - `statement`: `false` and `true` as values parse to boolean false/true, not strings.
    - `preconditions`: Value token is `t_false` or `t_true`.
    - `expected_behavior`: Returned expression is `E.Boolean` with corresponding value; lexer advances once.
    - `edge_cases_covered`: Boolean values versus boolean key segments.
    - `why_this_is_Zig_derived`: `parseValue` has explicit boolean cases.
    - `ambiguities_or_assumptions`: Only lowercase exact identifiers become boolean tokens.