9. `theorem_id`: `TOML_DOTTED_KEY_STOPS_ON_MISSING_SEGMENT`
   - `source_file`: `src/parsers/toml.zig`
   - `source_reference`: `parseKey`, lines 114-118
   - `statement`: After a dot in a key, if no valid segment follows, dotted-key parsing stops without immediately raising from `parseKey`.
   - `preconditions`: Key has at least one valid segment, then `.` token, then invalid segment token.
   - `expected_behavior`: `parseKey` returns rope built so far; the invalid token remains for subsequent parser expectation to handle.
   - `edge_cases_covered`: Trailing dot in key/table header.
   - `why_this_is_Zig_derived`: `rope.append((try p.parseKeySegment()) orelse break, allocator)` breaks on missing segment.
   - `ambiguities_or_assumptions`: Later error depends on context (`expectAssignment`, `expect(close bracket)`, etc.).