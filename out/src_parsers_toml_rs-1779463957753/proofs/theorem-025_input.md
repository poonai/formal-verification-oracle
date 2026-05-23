25. `theorem_id`: `TOML_INLINE_OBJECT_COMMA_RULES`
    - `source_file`: `src/parsers/toml.zig`
    - `source_reference`: `parseValue` lines 295-307; `parseMaybeTrailingComma` lines 364-371
    - `statement`: In inline objects, every property after the first requires a comma; a comma immediately before `}` is accepted as trailing and stops the loop.
    - `preconditions`: Parsing inline object after at least one property.
    - `expected_behavior`: Missing comma causes expected-comma syntax error; comma followed by `}` ends object without requiring another assignment.
    - `edge_cases_covered`: Trailing comma; missing comma; singleton object.
    - `why_this_is_Zig_derived`: For `obj.properties.len > 0`, parser calls `parseMaybeTrailingComma(.t_close_brace)`.
    - `ambiguities_or_assumptions`: Duplicate keys inside inline object follow normal `setRope` clobber behavior.