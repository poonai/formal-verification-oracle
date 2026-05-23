15. `theorem_id`: `TOML_ARRAY_TABLE_HEADER_APPENDS_NEW_OBJECT`
    - `source_file`: `src/parsers/toml.zig`, `src/ast/e.zig`
    - `source_reference`: `runParser` lines 172-195; `getOrPutArray` lines 671-717
    - `statement`: `[[table.path]]` creates or selects an array at the path, appends a new object to it, and makes that object the current assignment target.
    - `preconditions`: Double-bracket header syntax is valid and path does not clobber.
    - `expected_behavior`: Array at path exists; its length increases by one; appended element is an object; `head` points to appended object.
    - `edge_cases_covered`: First array table; repeated array table; nested array table.
    - `why_this_is_Zig_derived`: `runParser` calls `getOrPutArray`, constructs `new_head`, pushes it, and assigns `head`.
    - `ambiguities_or_assumptions`: Object identity may need modeling by state relation rather than pointer equality.