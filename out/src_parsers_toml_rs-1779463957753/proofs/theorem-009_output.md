Proved: `TOML_DOTTED_KEY_STOPS_ON_MISSING_SEGMENT`

Verification command:

```bash
dafny verify --allow-warnings /home/saint/bun/src/parsers/toml.dfy
```

Result:

```text
Dafny program verifier finished with 10 verified, 0 errors
```

Notes:
- `--allow-warnings` is needed because the existing model already uses many `{:verify false}` methods.
- I did not modify the Dafny `ParseKey` body.

What I investigated:
- Zig `parseKey` at `src/parsers/toml.zig`, lines 114-118:
  - After `t_dot`, Zig calls `lexer.next()`.
  - Then `rope.append((try p.parseKeySegment()) orelse break, allocator)`.
  - If the next token is not a valid key segment, `parseKeySegment()` returns `null`, the loop breaks, and the invalid token remains current.
- Dafny `ParseKey` body matches this structure:
  - consumes dot via `lexer.Next()`
  - calls `ParseKeySegment()`
  - breaks on `seg == null`

Added proof/spec structure:
- Zig-derived helpers:
  - `IsValidKeySegmentToken`
  - `ZigKeySegmentBytes`
  - `StreamTokenAtOrEof`
- Constructor postconditions for `Lexer` and `TOML` so theorem witnesses can reason about initial stream/index state.
- A targeted `ParseKey` postcondition for the packet condition:
  - valid first segment
  - followed by dot
  - followed by invalid segment or EOF
  - ensures success, one-segment rope, and invalid/EOF token remains current.
- Edge-case witness:
  - `TOML_DOTTED_KEY_TRAILING_DOT_WITNESS`
  - verifies `a.` returns rope for `a` and leaves lexer at EOF.

Classification: proved. No divergence found.
