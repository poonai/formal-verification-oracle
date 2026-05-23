Proved `TOML_VALUE_IDENTIFIER_IS_STRING` against the Dafny model.

What I changed in `src/parsers/toml.dfy`:
- Added Zig-derived postconditions to:
  - `TOML.ParseValue`
  - `TOML.ParseValueInner`
  - `Lexer` constructor / `TOML` constructor, to expose initial token/identifier facts needed by callers.
- Added theorem/witness methods:
  - `Theorem_TOML_VALUE_IDENTIFIER_IS_STRING`
  - `Theorem_TOML_VALUE_IDENTIFIER_IS_STRING_BareString`
  - `Theorem_TOML_VALUE_IDENTIFIER_IS_STRING_WithHyphenAfterFirstChar`
  - `Theorem_TOML_VALUE_IDENTIFIER_IS_STRING_WithColonAfterFirstChar`

Verification:
- Ran: `dafny verify --allow-warnings src/parsers/toml.dfy`
- Result: `11 verified, 0 errors`
- Dafny emits existing warnings because much of the model already uses `{:verify false}`.

Zig confirmation:
- Confirmed `parseValue` maps `.t_identifier` directly to `E.String{ .data = p.lexer.identifier }` before advancing.
- Confirmed lexer recognizes `-` and `:` as identifier parts after the first character via `isIdentifierPart`.

No semantic divergence found for this theorem.
