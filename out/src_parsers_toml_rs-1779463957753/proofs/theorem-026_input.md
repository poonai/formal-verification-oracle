26. `theorem_id`: `TOML_ARRAY_EMPTY_AND_NONEMPTY`
    - `source_file`: `src/parsers/toml.zig`, `src/parsers/toml/lexer.zig`
    - `source_reference`: `parseValue` lines 319-355; lexer `[]` lines 535-547
    - `statement`: `[]` parses as empty array; `[v1, v2, ...]` parses each value and pushes it into array.
    - `preconditions`: Value token is `t_empty_array` or `t_open_bracket`.
    - `expected_behavior`: Empty array returns array with no items; nonempty array returns array with items in source order.
    - `edge_cases_covered`: Empty array special token; singleton array; multiple elements.
    - `why_this_is_Zig_derived`: `t_empty_array` branch returns `E.Array{}`; `t_open_bracket` branch loops and pushes parsed values.
    - `ambiguities_or_assumptions`: Array push uses `catch unreachable` for allocation failure.