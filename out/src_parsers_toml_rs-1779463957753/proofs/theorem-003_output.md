Not proved.

Classification: missing Dafny spec.

What I investigated:
- Read theorem packet first.
- Confirmed Zig behavior in `src/parsers/toml/lexer.zig`:
  - `Lexer.next` sets `has_newline_before = lexer.end == 0` at line 513.
  - On `;`, it skips a single-line comment only under `if (lexer.has_newline_before)` at lines 588–607.
- Confirmed Rust matches Zig in `src/parsers/toml/lexer.rs`:
  - `self.has_newline_before = self.end == 0`
  - same guarded semicolon-comment skip.
- Inspected Dafny model `src/parsers/toml.dfy`:
  - `Lexer` is modeled as an arbitrary pre-tokenized `stream: seq<LexItem>`.
  - `Lexer.Next()` only advances through that stream.
  - There is no raw character scanner, no `code_point`, no semicolon token, and no invariant tying `Source.contents` to `stream`.

Concrete blocker:
- The Zig theorem is about raw lexing behavior: when the scanner sees `;` and `has_newline_before == true`, it skips until newline/EOF and continues scanning.
- The Dafny model has already abstracted lexing away into arbitrary `LexItem`s. Since the stream is unconstrained, Dafny can represent impossible lexer outputs, e.g. a token located at a semicolon comment position.
- Therefore the theorem cannot be proved against the fixed model without adding a source-to-token-stream well-formedness/spec relation or implementing/specifying the raw lexer.

Edge-case witnesses attempted:
- File begins with semicolon.
- Semicolon after newline.

Both fail in the current model because arbitrary streams can put a token at the semicolon location.

Verification status:
- Existing model verifies with `dafny verify --allow-warnings src/parsers/toml.dfy`.
- A temporary theorem witness asserting semicolon-comment skipping fails, confirming this is not just a local proof gap.

Zig point confirmed:
- The packet’s assumption is correct: `has_newline_before` is true at file start because Zig sets it from `lexer.end == 0`.

Added specs/helper lemmas:
- None committed. Adding a faithful proof would require a new lexer well-formedness/spec layer connecting `Source.contents` to `LexItem` streams.
