# Pipeline Report

datasetId: bun-pr-30856
rustTarget: /home/saint/bun/src/sql_jsc/mysql/protocol/DecodeBinaryValue.rs::decode_binary_value
zigReference: /home/saint/bun/src/sql_jsc/mysql/protocol/DecodeBinaryValue.zig (decodeBinaryValue)
stage1Selector: @src/sql_jsc/mysql/protocol/DecodeBinaryValue.rs::decode_binary_value
expectedBug: mysql_year_length_prefixed_overread
expectedStage3Label: intended bug found

## Stage 1
transcript: /home/saint/proof-rewrite/.pi-sessions/bun-pr-30856/2026-05-22T10-25-43-978Z_019e4f38-342a-7ab6-af89-2982135c0af9.jsonl

## Stage 2
transcript: /home/saint/proof-rewrite/.pi-sessions/bun-pr-30856/2026-05-22T10-32-09-244Z_019e4f3e-151c-7003-9323-7f1a20580762.jsonl

## Stage 3
transcript: /home/saint/proof-rewrite/.pi-sessions/bun-pr-30856/2026-05-22T10-34-52-707Z_019e4f40-93a3-7b21-8d17-f9d1b19dcdef.jsonl

### Selected Theorem
```text
29. `theorem_id`: `DBV_FALLBACK_UNKNOWN_TYPES`
    - `source_file`: `src/sql_jsc/mysql/protocol/DecodeBinaryValue.zig`; `src/sql/mysql/MySQLTypes.zig`
    - `source_reference`: `DecodeBinaryValue.zig lines 194-198`; `MySQLTypes.zig lines 240-273`
    - `statement`: Any field type not matched by earlier cases reads `column_length` bytes and returns raw.
    - `preconditions`: `field_type` is unmatched, e.g. `DECIMAL`, `NULL`, `YEAR`, `NEWDATE`, `TIMESTAMP2`, `DATETIME2`, `TIME2`, or enum wildcard; reader can read `column_length` bytes.
    - `expected_behavior`: Reads exactly `column_length`; returns tag `raw`.
    - `edge_cases_covered`: `column_length == 0`; unknown enum values; all flags ignored.
    - `why_this_is_Zig_derived`: Final `else` branch reads `column_length` and returns raw.
    - `ambiguities_or_assumptions`: Whether `MYSQL_TYPE_NULL` should appear on wire is outside this function.
```

## Stage 4
transcript: /home/saint/proof-rewrite/.pi-sessions/bun-pr-30856/2026-05-22T10-35-05-041Z_019e4f40-c3d1-7bf8-af26-853bc3e1dc71.jsonl

### Stage 4 Output
```text
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
```

## Stage 5
transcript: /home/saint/proof-rewrite/.pi-sessions/bun-pr-30856/2026-05-22T10-36-37-058Z_019e4f42-2b42-79de-ba51-b7897427c699.jsonl
classification: no bug found

### Stage 5 Output
```text
no bug found

The proof result reports a missing Dafny spec/model limitation, not the MySQL YEAR over-read bug. It only proves fallback behavior for `MYSQL_TYPE_OTHER` and cannot express `MYSQL_TYPE_YEAR`, so it does not actually target or demonstrate the intended YEAR length-prefixed overread.
```