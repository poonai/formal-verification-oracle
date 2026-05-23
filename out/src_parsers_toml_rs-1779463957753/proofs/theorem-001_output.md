Proved: `TOML_EMPTY_SOURCE_RETURNS_EMPTY_OBJECT`.

Verification run:
- `dafny verify --allow-warnings src/parsers/toml.dfy`
- Result: `14 verified, 0 errors`
- Warnings remain from existing `{:verify false}` methods.

Investigated:
- Zig `TOML.parse` lines 123-128: confirmed explicit `source_.contents.len == 0` early return before `TOML.init`.
- Rust `TOML::parse`: confirmed it preserves the same early return before lexer/parser initialization.
- Dafny `TOML.Parse`: already had matching early-return body; I kept the body logic fixed.

Added proof/spec structure:
- Constructor postconditions for `Loc`, `Source`, `Expr`, and `Object`, so the empty object result is observable.
- Postconditions on `TOML.Parse` for empty source:
  - `ok`
  - non-null expression
  - `loc.start == 0`
  - expression data is `DObject`
  - object has zero properties
- The theorem method:
  - `TOML_EMPTY_SOURCE_RETURNS_EMPTY_OBJECT`
- Edge-case witnesses:
  - `EmptySourceIgnoresLexerStreamWitness`: arbitrary lexer stream is ignored for empty input.
  - `EmptySourceRedactFlagIrrelevantWitness`: records that `redact_logs` is irrelevant; the Dafny model has no redact/log/allocator parameters, matching the early-return observability.

Classification: proved, no divergence found.
