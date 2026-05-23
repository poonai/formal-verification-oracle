Proved `TOML_KEY_FIRST_SEGMENT_REQUIRED` against the Dafny model, with one modeling caveat.

What I investigated:
- Read theorem packet first.
- Checked Zig `parseKey` lines 104–120: first segment is required via:
  `parseKeySegment() orelse { expectedString("key"); return error.SyntaxError; }`
- Inspected Dafny `ParseKey`, `ParseKeySegment`, `Lexer.ExpectedString`, and parser token model.

What I added to `src/parsers/toml.dfy`:
- Zig-derived predicate:
  `ValidKeySegmentToken(tok)`
  accepting exactly:
  - `t_string_literal`
  - `t_identifier`
  - `t_false`
  - `t_true`
  - `t_numeric_literal`
- Specs for:
  - `Lexer` constructor token initialization
  - `TOML` constructor token initialization
  - `ParseKeySegment` validity relation
  - `ExpectedString` returning `false`
  - `ParseKey`: if initial token is not a valid key segment, then `ok == false && out == null`
- Witness theorem methods for edge cases:
  - empty table header `[]` → `t_close_bracket`
  - assignment/punctuation start → `t_equal`, `t_dot`
  - EOF where key expected → `t_end_of_file`

Verification:
- Ran:

```sh
dafny verify --allow-warnings /home/saint/bun/src/parsers/toml.dfy
```

- Result: `11 verified, 0 errors`.

Caveat:
- The Dafny model does not represent diagnostic log text, so the exact `"Expected key but found ..."` message is not directly provable.
- I encoded the observable modeled behavior as syntax failure through `ExpectedString("key")` / `ok == false`.
- No Dafny method body logic was changed.
