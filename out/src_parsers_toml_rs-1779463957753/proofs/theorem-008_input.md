8. `theorem_id`: `TOML_KEY_FIRST_SEGMENT_REQUIRED`
   - `source_file`: `src/parsers/toml.zig`
   - `source_reference`: `parseKey`, lines 104-120
   - `statement`: A key must start with a valid key segment.
   - `preconditions`: `parseKey` is called and current token is not accepted by `parseKeySegment`.
   - `expected_behavior`: Parser terminates with syntax error `"Expected key but found ..."` via `expectedString("key")`.
   - `edge_cases_covered`: Empty table header `[]`; assignment starting with punctuation; EOF where key expected.
   - `why_this_is_Zig_derived`: First segment is required with `orelse expectedString("key")`.
   - `ambiguities_or_assumptions`: Exact log formatting may vary.