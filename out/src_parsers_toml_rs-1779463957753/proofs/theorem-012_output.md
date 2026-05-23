Proved: `TOML_TABLE_HEADER_CREATES_OR_SELECTS_OBJECT`

Verification command:

```sh
cd /home/saint/bun
dafny verify --allow-warnings src/parsers/toml.dfy
```

Result: `13 verified, 0 errors`.

Notes:
- `--allow-warnings` is needed because the existing model already contains many `{:verify false}` methods, which Dafny reports as warnings.
- I did not change Dafny parser control flow or method bodies.

Investigated:
- Zig `runParser` table-header branch: confirms `[table.path]` calls `root.data.e_object.getOrPutObject(...)` and assigns `head = parent_object.data.e_object`.
- Zig `getOrPutObject`: confirms:
  - missing path creates nested `Object`s,
  - existing object leaf is returned,
  - scalar/table-array leaf clobbers with `error.Clobber`.

Added proof/spec structure:
- Zig-derived helper predicates:
  - `RopePathIs`
  - `HasPropertyValue`
  - `ObjectAtPath`
- Constructor postconditions for `Expr`, `Rope`, and `Object`.
- Postconditions on `GetOrPutObject` and `SetRope` expressing the Zig behavior needed for this theorem.
- Edge-case witnesses:
  - `TOML_TABLE_HEADER_NewTable_Witness`
  - `TOML_TABLE_HEADER_ReopenExistingObject_Witness`
  - `TOML_TABLE_HEADER_NestedPath_Witness`
- Main theorem method:
  - `TOML_TABLE_HEADER_CREATES_OR_SELECTS_OBJECT`

Caveat: because `GetOrPutObject`/`SetRope` are existing `{:verify false}` methods, their added postconditions are trusted by Dafny rather than body-verified. The theorem is proved against those Zig-derived specs without altering the implementation bodies.
