7. `theorem_id`: `TOML_KEY_SEGMENT_TYPES`
   - `source_file`: `src/parsers/toml.zig`
   - `source_reference`: `parseKeySegment`, lines 61-101
   - `statement`: A key segment may be a string literal, identifier, `true`, `false`, or numeric literal; all become string keys.
   - `preconditions`: Current token is one of those token kinds.
   - `expected_behavior`: Segment expression has string data: literal string contents for quoted string; identifier bytes for identifier; `"true"`/`"false"` for booleans; raw source bytes for numeric literal.
   - `edge_cases_covered`: Boolean-like keys; numeric-looking keys; quoted keys.
   - `why_this_is_Zig_derived`: `parseKeySegment` converts each accepted token to `E.String`.
   - `ambiguities_or_assumptions`: Numeric key uses raw lexeme, not numeric value.