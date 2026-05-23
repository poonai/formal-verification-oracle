14. `theorem_id`: `TOML_TABLE_HEADER_CLOBBER_IS_TABLE_ALREADY_DEFINED`
    - `source_file`: `src/parsers/toml.zig`, `src/ast/e.zig`
    - `source_reference`: `runParser` lines 160-165; `getOrPutObject` lines 621-648
    - `statement`: A table header whose path conflicts with an array/scalar or invalid array element fails as `"Table already defined"`.
    - `preconditions`: `getOrPutObject` returns `error.Clobber`.
    - `expected_behavior`: Parser terminates with `SyntaxError`; log receives `"Table already defined"`.
    - `edge_cases_covered`: `[a]` when `a` scalar; `[arr]` when `arr` table array; nested conflict.
    - `why_this_is_Zig_derived`: `runParser` catches `Clobber` from `getOrPutObject` and adds that default error.
    - `ambiguities_or_assumptions`: Exact conflicting shapes are governed by `getOrPutObject`.