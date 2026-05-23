17. `theorem_id`: `TOML_ARRAY_TABLE_CLOBBER_IS_CANNOT_OVERWRITE_TABLE_ARRAY`
    - `source_file`: `src/parsers/toml.zig`, `src/ast/e.zig`
    - `source_reference`: `runParser` lines 183-188; `getOrPutArray` lines 671-698
    - `statement`: A table-array header whose path conflicts with scalar/object leaf fails as `"Cannot overwrite table array"`.
    - `preconditions`: `getOrPutArray` returns `error.Clobber`.
    - `expected_behavior`: Parser terminates with `SyntaxError`; log receives `"Cannot overwrite table array"`.
    - `edge_cases_covered`: `[[a]]` when `a` scalar; `[[a]]` when `a` plain object; nested conflict.
    - `why_this_is_Zig_derived`: `runParser` catches `Clobber` from `getOrPutArray` and adds that default error.
    - `ambiguities_or_assumptions`: Existing array at exact path is allowed, not clobber.