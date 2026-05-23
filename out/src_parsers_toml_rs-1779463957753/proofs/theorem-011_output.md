Not fully proved.

Classification: missing Dafny spec, with a possible Dafny-model divergence around the error message.

What I investigated:
- Read theorem packet first.
- Confirmed Zig behavior in:
  - `src/parsers/toml.zig` `parseAssignment`: `error.Clobber` becomes `SyntaxError` and logs `"Cannot redefine key '{s}'"`.
  - `src/ast/e.zig` `Object.setRope`: duplicate/non-container/object-overwrite cases return `error.Clobber`.
- Checked Rust port: it matches Zig’s dynamic message behavior.
- Inspected Dafny model `src/parsers/toml.dfy`.

What was proved:
- Added Zig-derived `SetRope` specs for:
  - duplicate simple non-array leaf ⇒ `!ok && err == Clobber`
  - scalar used as parent ⇒ `!ok && err == Clobber`
- Added verified edge-case witnesses:
  - `Toml_Redefine_DuplicateSimpleKey_Witness`
  - `Toml_Redefine_ScalarUsedAsParent_Witness`
  - `Toml_Redefine_ObjectOverwrittenByScalar_Witness`
- Verification command succeeded:
  - `dafny verify --allow-warnings /home/saint/bun/src/parsers/toml.dfy`
  - Result: `17 verified, 0 errors`

Blocker for full theorem:
- The Dafny model does not model parser error logs as observable state.
- `Lexer.AddError` is a stub returning `false` and records no message.
- `ParseAssignment` in Dafny calls `AddError(loc.start, "Cannot redefine key")`, not the Zig/Rust dynamic `"Cannot redefine key '...'"`.
- Therefore the theorem’s expected behavior “terminates with syntax error and log message `"Cannot redefine key '...'"`” cannot be fully expressed/proved against the fixed Dafny model without extending the logging model and likely correcting the modeled message construction.

Zig point confirmed:
- Zig assumes `loc.start > 0` before slicing the key name; the Dafny model does not encode this assertion/precondition.
