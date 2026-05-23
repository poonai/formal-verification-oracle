Not proved.

Classification: missing Dafny spec / model coverage.

What I investigated:
- Read theorem packet first.
- Confirmed Zig source at `src/parsers/toml/lexer.zig` lines 588-607:
  - `;` with `has_newline_before == true` is treated as a line comment.
  - `;` with `has_newline_before == false` calls `addDefaultError("Unexpected semicolon")`.
- Confirmed Rust port in `src/parsers/toml/lexer.rs` has the same branch and message.
- Inspected `src/parsers/toml.dfy`.

Concrete blocker:
- The Dafny model does not model this lexer behavior.
  - `datatype T` has no semicolon token.
  - `LexItem` contains only `(tok, text, num, loc, newlineBefore)`, no raw character/error/log info.
  - `Lexer.Next()` only advances through a pre-tokenized `stream`; it does not scan `source.contents`.
  - `AddDefaultError(...)` returns `false`, but there is no log state recording `"Unexpected semicolon"`.
- Therefore the theorem precondition “Lexer sees `;` with `has_newline_before == false`” is not expressible against the current Dafny model without adding new lexer/error-log semantics.

Verification attempt:
- Baseline `dafny verify src/parsers/toml.dfy --allow-warnings` verifies, but most relevant parser/lexer methods are `{:verify false}`.
- I created a temporary theorem attempt encoding the edge case `a=1;b=2` and a Zig-derived witness for `"Unexpected semicolon"`.
- The assertion that parse must fail could not be proved. The core reason is not a local proof gap; the model has no way to connect the raw semicolon in `source.contents` to lexer failure/logging.

Added specs/helper lemmas:
- None persisted to the Dafny model.
- Temporary-only helper: byte sequence witness for `"Unexpected semicolon"`.

Zig point confirmed:
- The Zig behavior is unambiguous: inline semicolon is an error via `addDefaultError("Unexpected semicolon")`; newline-boundary semicolon is skipped as a comment.

Conclusion:
- The theorem is faithful to Zig, but the current Dafny model lacks the lexer/error-log semantics needed to state or prove it. This is a missing Dafny spec/model coverage issue, and potentially a divergence signal if the Dafny model is intended to cover raw TOML lexing behavior.
