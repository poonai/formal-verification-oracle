Theorem `TOML_TABLE_HEADER_REQUIRES_LINE_BREAK_AFTER_CLOSE` was **not proved**.

Classification: **likely bug / divergence** in the Dafny model relative to Zig/Rust behavior.

Investigated:
- Read Zig `src/parsers/toml.zig` `runParser` table-header branch:
  - After `expect(.t_close_bracket)`, Zig does:
    - `if (!p.lexer.has_newline_before) try p.lexer.expectedString("line break");`
  - Because of `try`, the parser returns a syntax error immediately.
- Read Rust `src/parsers/toml.rs`; it matches Zig:
  - `if !self.lexer.has_newline_before { self.lexer.expected_string(b"line break")?; }`
- Read Dafny `src/parsers/toml.dfy` `RunParser`.
  - Dafny has the check:
    ```dafny
    if !lexer.has_newline_before {
      var _ := lexer.ExpectedString([108, 105, 110, 101, 32, 98, 114, 101, 97, 107]);
    }
    ```
  - But it **ignores** the returned `false` from `ExpectedString` and continues parsing.

Concrete blocker:
- In the Dafny model, `ExpectedString(...)` returns `false`, but `RunParser` does not assign it to `ok` or return.
- Therefore the edge case `[a] b=1` is not rejected at the table-header boundary in the model; parsing can continue into `b=1`.
- This contradicts the Zig-derived theorem, where `expectedString("line break")` is propagated as a syntax error.

Zig point confirmed:
- The relevant Zig behavior is exactly the theorem packet’s source: after consuming `]`, `has_newline_before == false` triggers `try p.lexer.expectedString("line break")`.

Added specs/helper lemmas:
- None were added. The failure is not a proof gap; the modeled control flow omits the error propagation needed for the theorem.
