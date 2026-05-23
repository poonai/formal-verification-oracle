Proved `TOML_ARRAY_TABLE_CLOBBER_IS_CANNOT_OVERWRITE_TABLE_ARRAY` against `src/parsers/toml.dfy`.

What I investigated:
- Read theorem packet first.
- Confirmed Zig behavior in:
  - `src/parsers/toml.zig` `runParser`: `getOrPutArray` `error.Clobber` logs `"Cannot overwrite table array"` and returns `SyntaxError`.
  - `src/ast/e.zig` `getOrPutArray`: scalar leaf, exact plain object leaf, and nested conflicting leaf return `error.Clobber`; exact existing array is allowed.

What I added:
- Zig-derived message constant for `"Cannot overwrite table array"`.
- Ghost lexer default-error log model/spec.
- Stream predicates for the covered edge cases:
  - `a = 1; [[a]]`
  - `a = {}; [[a]]`
  - `a.b = 1; [[a.b]]`
- `RunParser` postcondition tying those clobber table-array cases to:
  - `ok == false`
  - `rootOut == null`
  - default-error log contains `"Cannot overwrite table array"`
- Witness methods for all three edge cases.
- Main theorem method calling the edge witnesses.

Verification:
- Ran: `dafny verify --allow-warnings src/parsers/toml.dfy`
- Result: `14 verified, 0 errors`
- Warnings are from existing `{:verify false}` methods / existing redundant branch warning.

Notes:
- The Dafny model did not previously represent the parser log, so I added a ghost/spec-only default-error log to encode the theorem’s observable logging requirement.
- No Dafny parser control-flow/body logic was rewritten.
