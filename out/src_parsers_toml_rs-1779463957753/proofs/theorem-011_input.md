11. `theorem_id`: `TOML_REDEFINE_SCALAR_KEY_IS_SYNTAX_ERROR`
    - `source_file`: `src/parsers/toml.zig`, `src/ast/e.zig`
    - `source_reference`: `parseAssignment` lines 217-225; `Object.setRope` lines 573-604
    - `statement`: Assigning a key path that clobbers an existing scalar/object leaf is invalid.
    - `preconditions`: Current object already has same leaf key, or a path segment resolves to non-object/non-array where nesting is required.
    - `expected_behavior`: Parser terminates with syntax error and log message `"Cannot redefine key '...'"`.
    - `edge_cases_covered`: Duplicate simple key; scalar used as parent; object overwritten by scalar.
    - `why_this_is_Zig_derived`: `setRope` returns `error.Clobber`; `parseAssignment` maps it to a redefine-key syntax error.
    - `ambiguities_or_assumptions`: Zig asserts `loc.start > 0` when constructing key name.