Theorem status: **not fully proved as stated**.

Classification: **missing Dafny spec**

What verified:
- I proved the theorem for the Dafny model’s only fallback representative: `MYSQL_TYPE_OTHER`.
- `dafny verify /home/saint/bun/src/sql_jsc/mysql/protocol/DecodeBinaryValue.dfy` passes: **37 verified, 0 errors**.

Blocker:
- The theorem packet names Zig/Rust field types such as `MYSQL_TYPE_DECIMAL`, `MYSQL_TYPE_NULL`, `MYSQL_TYPE_YEAR`, `MYSQL_TYPE_NEWDATE`, `MYSQL_TYPE_TIMESTAMP2`, `MYSQL_TYPE_DATETIME2`, and `MYSQL_TYPE_TIME2`.
- The existing Dafny `FieldType` datatype does **not** include those constructors. It collapses otherwise-unmatched cases into `MYSQL_TYPE_OTHER`.
- Therefore the theorem cannot be expressed/proved for the named Zig field types without extending the Dafny model’s type universe, which would be a model/spec change rather than a local proof.

Zig point confirmed:
- In `DecodeBinaryValue.zig`, the final `else` branch does:

```zig
var data = try reader.read(column_length);
return SQLDataCell.raw(&data);
```

- In `MySQLTypes.zig`, `FieldType` includes the named variants like `MYSQL_TYPE_YEAR` and also has Zig’s enum wildcard `_`.

Added verified proof artifacts:
- `DBV_FALLBACK_UNKNOWN_TYPES_other_reads_column_length`
- `DBV_FALLBACK_UNKNOWN_TYPES_zero_length_witness`
- `DBV_FALLBACK_UNKNOWN_TYPES_all_flags_ignored`
- `DBV_FALLBACK_UNKNOWN_TYPES_unknown_enum_value_witness`

These prove:
- fallback reads exactly `column_length`
- `column_length == 0` returns `raw([])` without advancing
- all flags are ignored
- unknown enum values are represented by `MYSQL_TYPE_OTHER` in this Dafny model

No Dafny method body logic was changed.
