Not fully proved.

Classification: missing Dafny spec.

What I verified:
- Added Zig-derived specs to:
  - `Lexer.ExpectAssignment`: in the current Dafny model, any non-`t_equal` token makes it fail.
  - `TOML.ParseAssignment`: for a simple valid key, if the following token is not `t_equal`, `ParseAssignment` returns `ok == false`.
- Added edge-case witnesses:
  - missing separator: `a b`
  - newline after key: `a\nb`
  - EOF after key: `a`
- Ran:

```bash
dafny verify --allow-warnings src/parsers/toml.dfy
```

Result: verification succeeded with 0 errors.

Blocker for the full theorem:
- Zig/Rust `expectAssignment` accepts both `t_equal` and `t_colon`, but reports `expected(T.t_equal)` for all other tokens.
- The Dafny model currently has no `t_colon` token.
- The Dafny model also has no error-log / expected-token state, only `ok: bool`.

So I could prove the boolean failure part: “valid key not followed by `=` fails”, including the named edge cases. I could not honestly prove the full expected-token syntax error for `t_equal`, because that diagnostic is not represented in the Dafny model.

Zig point confirmed:
- `src/parsers/toml/lexer.zig` `expectAssignment` accepts `.t_equal, .t_colon`, otherwise calls `expected(T.t_equal)`.
- Rust matches this behavior in `src/parsers/toml/lexer.rs`.

Added proof material:
- Constructor postconditions for lexer/parser setup.
- Postconditions on `Expect`, `ExpectAssignment`, and `ParseAssignment`.
- Four theorem/witness methods for the packet and edge cases.
