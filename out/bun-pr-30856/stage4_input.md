29. `theorem_id`: `DBV_FALLBACK_UNKNOWN_TYPES`
    - `source_file`: `src/sql_jsc/mysql/protocol/DecodeBinaryValue.zig`; `src/sql/mysql/MySQLTypes.zig`
    - `source_reference`: `DecodeBinaryValue.zig lines 194-198`; `MySQLTypes.zig lines 240-273`
    - `statement`: Any field type not matched by earlier cases reads `column_length` bytes and returns raw.
    - `preconditions`: `field_type` is unmatched, e.g. `DECIMAL`, `NULL`, `YEAR`, `NEWDATE`, `TIMESTAMP2`, `DATETIME2`, `TIME2`, or enum wildcard; reader can read `column_length` bytes.
    - `expected_behavior`: Reads exactly `column_length`; returns tag `raw`.
    - `edge_cases_covered`: `column_length == 0`; unknown enum values; all flags ignored.
    - `why_this_is_Zig_derived`: Final `else` branch reads `column_length` and returns raw.
    - `ambiguities_or_assumptions`: Whether `MYSQL_TYPE_NULL` should appear on wire is outside this function.
