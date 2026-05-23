Implemented the Dafny port at:

`src/sql_jsc/mysql/protocol/DecodeBinaryValue.dfy`

Validation run:

```sh
dafny verify /home/saint/bun/src/sql_jsc/mysql/protocol/DecodeBinaryValue.dfy
```

Result: `30 verified, 0 errors`

Notes:
- Preserved the Rust branch behavior and reader-consuming structure with narrow Dafny helpers for Rust/MySQL primitives.
- Added one isolated sanity assertion for `MYSQL_TYPE_TINY`.
- Non-operational modeling deviation: floating values are represented as raw bit payloads (`Float8Bits`) because Dafny does not directly model Rust `f32::from_bits` / `f64::from_bits` runtime floating conversion.
