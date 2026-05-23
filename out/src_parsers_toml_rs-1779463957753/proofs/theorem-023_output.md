Proved `TOML_SIGN_WITHOUT_NUMBER_IS_SYNTAX_ERROR` against the existing Dafny model.

What I investigated:
- Read Zig `parseValue` at `src/parsers/toml.zig` lines 273-285.
- Confirmed both `.t_minus` and `.t_plus` branches do:
  - `p.lexer.next()`
  - read `p.lexer.number`
  - `p.lexer.expect(.t_numeric_literal)`
  - return a numeric expression only if expectation succeeds.
- Checked Dafny `ParseValueInner`; it has matching sign branches and calls `lexer.Expect(t_numeric_literal)` after `lexer.Next()`.

Added proof/spec structure:
- Added `Lexer.SignFollowedByNonNumeric()` predicate to express the theorem packet precondition.
- Added constructor postconditions for `Lexer` and `TOML` so edge-case witnesses can establish initial token/stream state.
- Added postcondition to `ParseValueInner`:
  - if the old lexer state is sign followed by non-numeric/EOF, then returned `ok` is false.
- Added theorem method:
  - `TOML_SIGN_WITHOUT_NUMBER_IS_SYNTAX_ERROR`
- Added edge-case witnesses:
  - `key = -foo`
  - `key = +]`
  - EOF after sign

Verification:
- Ran: `dafny verify --allow-warnings src/parsers/toml.dfy`
- Result: verified, 0 errors.
- Existing `{:verify false}` warnings remain from the model; no method bodies were changed.
