dataset_id: bun-pr-30856
expected_bug_slug: mysql_year_length_prefixed_overread
expected_stage3_label: intended bug found
bug_summary: MySQL binary row decoding treated YEAR like a length-prefixed field, over-reading the packet and corrupting later columns.
rust_selector: @src/sql_jsc/mysql/protocol/DecodeBinaryValue.rs::decode_binary_value
zig_semantic_anchor: decodeBinaryValue
notes: Primary bug site from PR 30856; YEAR handling was added inside decode_binary_value.

theorem_packet:
29. `theorem_id`: `DBV_FALLBACK_UNKNOWN_TYPES`
    - `source_file`: `src/sql_jsc/mysql/protocol/DecodeBinaryValue.zig`; `src/sql/mysql/MySQLTypes.zig`
    - `source_reference`: `DecodeBinaryValue.zig lines 194-198`; `MySQLTypes.zig lines 240-273`
    - `statement`: Any field type not matched by earlier cases reads `column_length` bytes and returns raw.
    - `preconditions`: `field_type` is unmatched, e.g. `DECIMAL`, `NULL`, `YEAR`, `NEWDATE`, `TIMESTAMP2`, `DATETIME2`, `TIME2`, or enum wildcard; reader can read `column_length` bytes.
    - `expected_behavior`: Reads exactly `column_length`; returns tag `raw`.
    - `edge_cases_covered`: `column_length == 0`; unknown enum values; all flags ignored.
    - `why_this_is_Zig_derived`: Final `else` branch reads `column_length` and returns raw.
    - `ambiguities_or_assumptions`: Whether `MYSQL_TYPE_NULL` should appear on wire is outside this function.

proof_output:
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