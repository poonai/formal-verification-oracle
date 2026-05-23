27. `theorem_id`: `TOML_ARRAY_COMMA_RULES`
    - `source_file`: `src/parsers/toml.zig`
    - `source_reference`: `parseValue` lines 332-347; `parseMaybeTrailingComma` lines 364-371
    - `statement`: In arrays, every element after the first requires a comma; a comma immediately before `]` is accepted as trailing and stops the loop.
    - `preconditions`: Parsing array after at least one item.
    - `expected_behavior`: Missing comma causes expected-comma syntax error; trailing comma before `]` is accepted.
    - `edge_cases_covered`: `[1,]`; `[1 2]`; singleton array.
    - `why_this_is_Zig_derived`: For `array.items.len > 0`, parser calls `parseMaybeTrailingComma(.t_close_bracket)`.
    - `ambiguities_or_assumptions`: Newlines are tracked but not rejected.