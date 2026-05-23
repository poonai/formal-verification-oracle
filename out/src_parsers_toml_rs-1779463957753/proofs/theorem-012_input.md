12. `theorem_id`: `TOML_TABLE_HEADER_CREATES_OR_SELECTS_OBJECT`
    - `source_file`: `src/parsers/toml.zig`, `src/ast/e.zig`
    - `source_reference`: `runParser` lines 150-170; `getOrPutObject` lines 621-668
    - `statement`: `[table.path]` creates missing nested objects or selects an existing object at that path as subsequent assignment target.
    - `preconditions`: Header syntax is valid and path does not clobber scalar/table-array leaf.
    - `expected_behavior`: `head` becomes the object at the header path; following bare assignments go into that object.
    - `edge_cases_covered`: New table; reopening existing object table; nested table path.
    - `why_this_is_Zig_derived`: `runParser` calls `root.getOrPutObject` and assigns `head`.
    - `ambiguities_or_assumptions`: Zig permits selecting an existing object table; duplicate-table rejection only occurs on `Clobber`.