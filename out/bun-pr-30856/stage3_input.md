dataset_id: bun-pr-30856
expected_bug_slug: mysql_year_length_prefixed_overread
bug_summary: MySQL binary row decoding treated YEAR like a length-prefixed field, over-reading the packet and corrupting later columns.
rust_selector: @src/sql_jsc/mysql/protocol/DecodeBinaryValue.rs::decode_binary_value
zig_semantic_anchor: decodeBinaryValue
notes: Primary bug site from PR 30856; YEAR handling was added inside decode_binary_value.

theorem_packets:
1. `theorem_id`: `DBV_TINY_RAW`
   - `source_file`: `src/sql_jsc/mysql/protocol/DecodeBinaryValue.zig`
   - `source_reference`: `lines 9-14`
   - `statement`: `MYSQL_TYPE_TINY` with `raw == true` returns the next 1 byte as `SQLDataCell.raw`.
   - `preconditions`: `field_type == MYSQL_TYPE_TINY`; `raw == true`; reader can read 1 byte.
   - `expected_behavior`: Reads exactly 1 byte; returns tag `raw` with that byte slice.
   - `edge_cases_covered`: Ignores `unsigned`, `bigint`, `binary`, `character_set`, and `column_length`.
   - `why_this_is_Zig_derived`: Zig branches on `raw` before reading numeric value.
   - `ambiguities_or_assumptions`: `SQLDataCell.raw` stores the slice pointer/len; lifetime ownership is outside this theorem.

2. `theorem_id`: `DBV_TINY_UNSIGNED`
   - `source_file`: `src/sql_jsc/mysql/protocol/DecodeBinaryValue.zig`
   - `source_reference`: `lines 15-18`
   - `statement`: Non-raw unsigned `MYSQL_TYPE_TINY` returns a `uint4` equal to the byte value.
   - `preconditions`: `field_type == MYSQL_TYPE_TINY`; `raw == false`; `unsigned == true`; reader can read 1 byte.
   - `expected_behavior`: Reads 1 byte; returns `{ tag = uint4, value.uint4 = byte }`.
   - `edge_cases_covered`: Values `0..255`; `bigint` ignored.
   - `why_this_is_Zig_derived`: Zig calls `reader.byte()` and wraps it in `uint4`.
   - `ambiguities_or_assumptions`: None.

3. `theorem_id`: `DBV_TINY_SIGNED`
   - `source_file`: `src/sql_jsc/mysql/protocol/DecodeBinaryValue.zig`
   - `source_reference`: `lines 15-20`
   - `statement`: Non-raw signed `MYSQL_TYPE_TINY` bitcasts the byte to `i8` and returns it as `int4`.
   - `preconditions`: `field_type == MYSQL_TYPE_TINY`; `raw == false`; `unsigned == false`; reader can read 1 byte.
   - `expected_behavior`: Returns `{ tag = int4, value.int4 = bitcast_i8(byte) }`; bytes `0x80..0xff` become negative.
   - `edge_cases_covered`: `0x7f -> 127`; `0x80 -> -128`; `0xff -> -1`.
   - `why_this_is_Zig_derived`: Zig uses `const ival: i8 = @bitCast(val)`.
   - `ambiguities_or_assumptions`: None.

4. `theorem_id`: `DBV_FIXED_INT_RAW`
   - `source_file`: `src/sql_jsc/mysql/protocol/DecodeBinaryValue.zig`
   - `source_reference`: `lines 22-53`
   - `statement`: Raw fixed-width integer types return their raw byte widths.
   - `preconditions`: `field_type` is one of `SHORT`, `INT24`, `LONG`; `raw == true`; reader can read the required width.
   - `expected_behavior`: `SHORT` reads 2 bytes; `INT24` reads 3 bytes; `LONG` reads 4 bytes; returns tag `raw`.
   - `edge_cases_covered`: Other flags ignored.
   - `why_this_is_Zig_derived`: Each branch checks `raw` first and calls `reader.read(width)`.
   - `ambiguities_or_assumptions`: None.

5. `theorem_id`: `DBV_FIXED_INT_UNSIGNED`
   - `source_file`: `src/sql_jsc/mysql/protocol/DecodeBinaryValue.zig`
   - `source_reference`: `lines 28-52`
   - `statement`: Non-raw unsigned fixed-width integer types return `uint4`.
   - `preconditions`: `field_type` is `SHORT`, `INT24`, or `LONG`; `raw == false`; `unsigned == true`; reader has enough bytes.
   - `expected_behavior`: Reads little-endian `u16`, `u24`, or `u32`; returns `{ tag = uint4, value.uint4 = value }`.
   - `edge_cases_covered`: Maximum values `65535`, `16777215`, `4294967295`.
   - `why_this_is_Zig_derived`: Zig calls `reader.int(u16/u24/u32)` and stores in `uint4`.
   - `ambiguities_or_assumptions`: `reader.int` bitcasts little-endian host slice behavior from `NewReader.zig`.

6. `theorem_id`: `DBV_FIXED_INT_SIGNED`
   - `source_file`: `src/sql_jsc/mysql/protocol/DecodeBinaryValue.zig`
   - `source_reference`: `lines 31,42,53`
   - `statement`: Non-raw signed fixed-width integer types return `int4`.
   - `preconditions`: `field_type` is `SHORT`, `INT24`, or `LONG`; `raw == false`; `unsigned == false`; reader has enough bytes.
   - `expected_behavior`: Reads `i16`, `i24`, or `i32`; returns `{ tag = int4, value.int4 = value }`.
   - `edge_cases_covered`: Signed min/max for each width.
   - `why_this_is_Zig_derived`: Zig calls `reader.int(i16/i24/i32)` and stores in `int4`.
   - `ambiguities_or_assumptions`: None.

7. `theorem_id`: `DBV_LONGLONG_RAW`
   - `source_file`: `src/sql_jsc/mysql/protocol/DecodeBinaryValue.zig`
   - `source_reference`: `lines 55-58`
   - `statement`: Raw `MYSQL_TYPE_LONGLONG` returns the next 8 bytes as raw.
   - `preconditions`: `field_type == MYSQL_TYPE_LONGLONG`; `raw == true`; reader can read 8 bytes.
   - `expected_behavior`: Reads 8 bytes; returns tag `raw`.
   - `edge_cases_covered`: Ignores `unsigned` and `bigint`.
   - `why_this_is_Zig_derived`: Raw branch returns `SQLDataCell.raw(&try reader.read(8))`.
   - `ambiguities_or_assumptions`: Unlike other raw branches, the temporary `Data` is passed inline; theorem only describes observable tag/value.

8. `theorem_id`: `DBV_LONGLONG_UNSIGNED_U32_RANGE`
   - `source_file`: `src/sql_jsc/mysql/protocol/DecodeBinaryValue.zig`
   - `source_reference`: `lines 59-63`
   - `statement`: Unsigned non-raw `LONGLONG` values within `u32` range return `uint4`.
   - `preconditions`: `field_type == MYSQL_TYPE_LONGLONG`; `raw == false`; `unsigned == true`; decoded `u64 <= maxInt(u32)`.
   - `expected_behavior`: Returns `{ tag = uint4, value.uint4 = decoded_value }`.
   - `edge_cases_covered`: `0`; `4294967295`.
   - `why_this_is_Zig_derived`: Zig tests `val <= std.math.maxInt(u32)` before `bigint`.
   - `ambiguities_or_assumptions`: `bigint` is ignored for this range.

9. `theorem_id`: `DBV_LONGLONG_UNSIGNED_BIGINT`
   - `source_file`: `src/sql_jsc/mysql/protocol/DecodeBinaryValue.zig`
   - `source_reference`: `lines 64-66`
   - `statement`: Unsigned non-raw `LONGLONG` values above `u32` range return `uint8` when `bigint == true`.
   - `preconditions`: `field_type == MYSQL_TYPE_LONGLONG`; `raw == false`; `unsigned == true`; decoded `u64 > maxInt(u32)`; `bigint == true`.
   - `expected_behavior`: Returns `{ tag = uint8, value.uint8 = decoded_value }`.
   - `edge_cases_covered`: `4294967296`; `maxInt(u64)`.
   - `why_this_is_Zig_derived`: Zig branches to `uint8` only after the `u32` check.
   - `ambiguities_or_assumptions`: None.

10. `theorem_id`: `DBV_LONGLONG_UNSIGNED_STRING`
    - `source_file`: `src/sql_jsc/mysql/protocol/DecodeBinaryValue.zig`
    - `source_reference`: `lines 67-69`
    - `statement`: Unsigned non-raw `LONGLONG` values above `u32` range return a decimal string when `bigint == false`.
    - `preconditions`: `field_type == MYSQL_TYPE_LONGLONG`; `raw == false`; `unsigned == true`; decoded `u64 > maxInt(u32)`; `bigint == false`.
    - `expected_behavior`: Returns `{ tag = string, free_value = 1 }` whose content is base-10 decimal representation of the `u64`.
    - `edge_cases_covered`: `4294967296`; `18446744073709551615`.
    - `why_this_is_Zig_derived`: Zig formats with `std.fmt.bufPrint("{d}")` and clones UTF-8.
    - `ambiguities_or_assumptions`: String allocation failure behavior not modeled here.

11. `theorem_id`: `DBV_LONGLONG_SIGNED_I32_RANGE`
    - `source_file`: `src/sql_jsc/mysql/protocol/DecodeBinaryValue.zig`
    - `source_reference`: `lines 71-74`
    - `statement`: Signed non-raw `LONGLONG` values within `i32` range return `int4`.
    - `preconditions`: `field_type == MYSQL_TYPE_LONGLONG`; `raw == false`; `unsigned == false`; decoded `i64` in `[minInt(i32), maxInt(i32)]`.
    - `expected_behavior`: Returns `{ tag = int4, value.int4 = decoded_value }`.
    - `edge_cases_covered`: `-2147483648`; `2147483647`.
    - `why_this_is_Zig_derived`: Zig checks the `i32` range before `bigint`.
    - `ambiguities_or_assumptions`: `bigint` is ignored in this range.

12. `theorem_id`: `DBV_LONGLONG_SIGNED_BIGINT`
    - `source_file`: `src/sql_jsc/mysql/protocol/DecodeBinaryValue.zig`
    - `source_reference`: `lines 75-77`
    - `statement`: Signed non-raw `LONGLONG` outside `i32` range returns `int8` when `bigint == true`.
    - `preconditions`: `field_type == MYSQL_TYPE_LONGLONG`; `raw == false`; `unsigned == false`; decoded `i64` outside `i32` range; `bigint == true`.
    - `expected_behavior`: Returns `{ tag = int8, value.int8 = decoded_value }`.
    - `edge_cases_covered`: `-2147483649`; `2147483648`; `minInt(i64)`; `maxInt(i64)`.
    - `why_this_is_Zig_derived`: Zig branches to `int8` after range check.
    - `ambiguities_or_assumptions`: None.

13. `theorem_id`: `DBV_LONGLONG_SIGNED_STRING`
    - `source_file`: `src/sql_jsc/mysql/protocol/DecodeBinaryValue.zig`
    - `source_reference`: `lines 78-80`
    - `statement`: Signed non-raw `LONGLONG` outside `i32` range returns a decimal string when `bigint == false`.
    - `preconditions`: `field_type == MYSQL_TYPE_LONGLONG`; `raw == false`; `unsigned == false`; decoded `i64` outside `i32` range; `bigint == false`.
    - `expected_behavior`: Returns `{ tag = string, free_value = 1 }` containing base-10 signed decimal.
    - `edge_cases_covered`: Negative and positive out-of-`i32` values.
    - `why_this_is_Zig_derived`: Zig formats signed `i64` with `"{d}"`.
    - `ambiguities_or_assumptions`: None.

14. `theorem_id`: `DBV_FLOAT_DOUBLE_RAW`
    - `source_file`: `src/sql_jsc/mysql/protocol/DecodeBinaryValue.zig`
    - `source_reference`: `lines 82-96`
    - `statement`: Raw float/double return raw fixed-width bytes.
    - `preconditions`: `field_type == MYSQL_TYPE_FLOAT` or `MYSQL_TYPE_DOUBLE`; `raw == true`; reader has 4 or 8 bytes.
    - `expected_behavior`: `FLOAT` reads 4 bytes raw; `DOUBLE` reads 8 bytes raw.
    - `edge_cases_covered`: Other flags ignored.
    - `why_this_is_Zig_derived`: Raw branch precedes bitcast float conversion.
    - `ambiguities_or_assumptions`: None.

15. `theorem_id`: `DBV_FLOAT_DOUBLE_DECODE`
    - `source_file`: `src/sql_jsc/mysql/protocol/DecodeBinaryValue.zig`
    - `source_reference`: `lines 88,96`
    - `statement`: Non-raw float/double return `float8` using bit reinterpretation.
    - `preconditions`: `raw == false`; `field_type == MYSQL_TYPE_FLOAT` with 4 bytes or `MYSQL_TYPE_DOUBLE` with 8 bytes.
    - `expected_behavior`: `FLOAT` reads `u32`, bitcasts to `f32`, stores as `float8`; `DOUBLE` reads `u64`, bitcasts to `f64`, stores as `float8`.
    - `edge_cases_covered`: NaN/infinity/subnormal bit patterns are preserved by bitcast.
    - `why_this_is_Zig_derived`: Zig uses `@bitCast` for both conversions.
    - `ambiguities_or_assumptions`: Exact NaN payload observability depends on downstream JS representation.

16. `theorem_id`: `DBV_TIME_ZERO_LENGTH`
    - `source_file`: `src/sql_jsc/mysql/protocol/DecodeBinaryValue.zig`
    - `source_reference`: `lines 98-103`
    - `statement`: `MYSQL_TYPE_TIME` with length byte `0` returns string `"00:00:00"`.
    - `preconditions`: `field_type == MYSQL_TYPE_TIME`; next byte is `0`.
    - `expected_behavior`: Returns `{ tag = string, free_value = 1 }` containing `"00:00:00"`.
    - `edge_cases_covered`: `raw`, `bigint`, `unsigned`, `binary`, `character_set`, and `column_length` ignored.
    - `why_this_is_Zig_derived`: Time branch switches on length byte and directly returns that literal.
    - `ambiguities_or_assumptions`: None.

17. `theorem_id`: `DBV_TIME_FORMAT_8_OR_12`
    - `source_file`: `src/sql_jsc/mysql/protocol/DecodeBinaryValue.zig`; `src/sql_jsc/mysql/MySQLValue.zig`
    - `source_reference`: `DecodeBinaryValue.zig lines 104-121`; `MySQLValue.zig lines 480-501`
    - `statement`: `MYSQL_TYPE_TIME` with length byte `8` or `12` returns a formatted time string.
    - `preconditions`: `field_type == MYSQL_TYPE_TIME`; length byte is `8` or `12`; reader can read that many bytes.
    - `expected_behavior`: Parses negative flag, days, hours, minutes, seconds; computes `total_hours = hours + days * 24`; returns `[-]HH:MM:SS` if `total_hours <= 99`, else `[-]HHH:MM:SS` with at least 3 hour digits.
    - `edge_cases_covered`: Negative times; days contributing to hours; microseconds ignored for string output.
    - `why_this_is_Zig_derived`: Zig parses `Time.fromData`, computes `total_hours`, chooses two format strings.
    - `ambiguities_or_assumptions`: Values are not range-validated beyond byte parsing.

18. `theorem_id`: `DBV_TIME_INVALID_LENGTH`
    - `source_file`: `src/sql_jsc/mysql/protocol/DecodeBinaryValue.zig`
    - `source_reference`: `lines 98-124`
    - `statement`: `MYSQL_TYPE_TIME` rejects any length byte other than `0`, `8`, or `12`.
    - `preconditions`: `field_type == MYSQL_TYPE_TIME`; next byte not in `{0,8,12}`.
    - `expected_behavior`: Returns/throws `error.InvalidBinaryValue`.
    - `edge_cases_covered`: Lengths `1..7`, `9..11`, `13..255`.
    - `why_this_is_Zig_derived`: Switch `else` returns `error.InvalidBinaryValue`.
    - `ambiguities_or_assumptions`: Reader short-read before the length byte propagates reader error instead.

19. `theorem_id`: `DBV_DATE_TIME_ZERO_LENGTH`
    - `source_file`: `src/sql_jsc/mysql/protocol/DecodeBinaryValue.zig`
    - `source_reference`: `lines 126-129`
    - `statement`: Date-like types with length byte `0` return date value `0`.
    - `preconditions`: `field_type` is `MYSQL_TYPE_DATE`, `MYSQL_TYPE_TIMESTAMP`, or `MYSQL_TYPE_DATETIME`; next byte is `0`.
    - `expected_behavior`: Returns `{ tag = date, value.date = 0 }`.
    - `edge_cases_covered`: All flags ignored.
    - `why_this_is_Zig_derived`: Date-like switch maps `0` directly to date `0`.
    - `ambiguities_or_assumptions`: Meaning of timestamp `0` in JS is downstream behavior.

20. `theorem_id`: `DBV_DATE_TIME_VALID_LENGTHS`
    - `source_file`: `src/sql_jsc/mysql/protocol/DecodeBinaryValue.zig`; `src/sql_jsc/mysql/MySQLValue.zig`
    - `source_reference`: `DecodeBinaryValue.zig lines 130-135`; `MySQLValue.zig lines 283-376`
    - `statement`: Date-like types with length byte `4`, `7`, or `11` parse date fields and return JS timestamp.
    - `preconditions`: `field_type` is `DATE`, `TIMESTAMP`, or `DATETIME`; length byte in `{4,7,11}`; reader can read that many bytes; `globalObject` can convert Gregorian date-time.
    - `expected_behavior`: Length 4 parses year/month/day; length 7 also parses hour/minute/second; length 11 also parses microseconds and converts floor microseconds/1000 to milliseconds; returns tag `date`.
    - `edge_cases_covered`: Date-only; datetime without microseconds; datetime with microseconds.
    - `why_this_is_Zig_derived`: Zig delegates to `DateTime.fromData` then `toJSTimestamp(globalObject)`.
    - `ambiguities_or_assumptions`: Calendar validation behavior belongs to `globalObject.gregorianDateTimeToMS`.

21. `theorem_id`: `DBV_DATE_TIME_INVALID_LENGTH`
    - `source_file`: `src/sql_jsc/mysql/protocol/DecodeBinaryValue.zig`
    - `source_reference`: `lines 126-137`
    - `statement`: Date-like types reject any length byte other than `0`, `4`, `7`, or `11`.
    - `preconditions`: `field_type` is `DATE`, `TIMESTAMP`, or `DATETIME`; next byte not in `{0,4,7,11}`.
    - `expected_behavior`: Returns/throws `error.InvalidBinaryValue`.
    - `edge_cases_covered`: Lengths `1..3`, `5..6`, `8..10`, `12..255`.
    - `why_this_is_Zig_derived`: Switch `else` yields `error.InvalidBinaryValue`.
    - `ambiguities_or_assumptions`: None.

22. `theorem_id`: `DBV_STRINGLIKE_RAW`
    - `source_file`: `src/sql_jsc/mysql/protocol/DecodeBinaryValue.zig`
    - `source_reference`: `lines 139-156`
    - `statement`: Raw string-like/blob/decimal/geometry types return the length-encoded string payload as raw.
    - `preconditions`: `field_type` in `{ENUM, SET, GEOMETRY, NEWDECIMAL, STRING, VARCHAR, VAR_STRING, TINY_BLOB, MEDIUM_BLOB, LONG_BLOB, BLOB}`; `raw == true`; valid length-encoded payload present.
    - `expected_behavior`: Decodes length-encoded string; returns tag `raw` with payload bytes.
    - `edge_cases_covered`: Empty length-encoded payload returns raw length `0`; `binary` and `character_set` ignored under raw.
    - `why_this_is_Zig_derived`: Zig calls `reader.encodeLenString()` and returns `SQLDataCell.raw`.
    - `ambiguities_or_assumptions`: Invalid length encoding propagates `InvalidEncodedLength` from `NewReader`.

23. `theorem_id`: `DBV_STRINGLIKE_BINARY_CHARSET_RAW_RESULT`
    - `source_file`: `src/sql_jsc/mysql/protocol/DecodeBinaryValue.zig`
    - `source_reference`: `lines 157-165`; `lines 1-4`
    - `statement`: Non-raw string-like values return raw bytes only when both `binary == true` and `character_set == 63`.
    - `preconditions`: String-like field set from theorem `DBV_STRINGLIKE_RAW`; `raw == false`; `binary == true`; `character_set == binary_charset`.
    - `expected_behavior`: Decodes length-encoded payload and returns `SQLDataCell.raw`.
    - `edge_cases_covered`: True MySQL binary charset; empty binary payload.
    - `why_this_is_Zig_derived`: Zig explicitly checks `binary and character_set == binary_charset`.
    - `ambiguities_or_assumptions`: `binary_charset` constant is `63`.

24. `theorem_id`: `DBV_STRINGLIKE_NON_BINARY_STRING`
    - `source_file`: `src/sql_jsc/mysql/protocol/DecodeBinaryValue.zig`
    - `source_reference`: `lines 157-168`
    - `statement`: Non-raw string-like values return strings unless both binary flag and binary charset are present.
    - `preconditions`: String-like field set from theorem `DBV_STRINGLIKE_RAW`; `raw == false`; not(`binary == true && character_set == 63`).
    - `expected_behavior`: Decodes length-encoded payload; returns `{ tag = string, free_value = 1 }`; empty payload stores null string pointer.
    - `edge_cases_covered`: `binary == false`; `binary == true` with `_bin` collation charset such as `46`; empty string.
    - `why_this_is_Zig_derived`: Zig comments and condition reject BINARY flag alone.
    - `ambiguities_or_assumptions`: UTF-8 cloning behavior for invalid UTF-8 bytes is delegated to Bun string code.

25. `theorem_id`: `DBV_JSON_RAW`
    - `source_file`: `src/sql_jsc/mysql/protocol/DecodeBinaryValue.zig`
    - `source_reference`: `lines 170-175`
    - `statement`: Raw JSON returns length-encoded payload as raw.
    - `preconditions`: `field_type == MYSQL_TYPE_JSON`; `raw == true`; valid length-encoded payload.
    - `expected_behavior`: Returns tag `raw` with payload bytes.
    - `edge_cases_covered`: Empty payload; other flags ignored.
    - `why_this_is_Zig_derived`: JSON raw branch calls `encodeLenString` then `SQLDataCell.raw`.
    - `ambiguities_or_assumptions`: None.

26. `theorem_id`: `DBV_JSON_NON_RAW`
    - `source_file`: `src/sql_jsc/mysql/protocol/DecodeBinaryValue.zig`
    - `source_reference`: `lines 176-179`
    - `statement`: Non-raw JSON returns tag `json` with cloned string payload.
    - `preconditions`: `field_type == MYSQL_TYPE_JSON`; `raw == false`; valid length-encoded payload.
    - `expected_behavior`: Returns `{ tag = json, free_value = 1 }`; empty payload stores null JSON string pointer.
    - `edge_cases_covered`: Empty JSON payload; `binary` and `character_set` ignored.
    - `why_this_is_Zig_derived`: Zig always returns `.tag = .json` in non-raw JSON branch.
    - `ambiguities_or_assumptions`: No JSON parsing/validation occurs in this function.

27. `theorem_id`: `DBV_BIT_ONE_BOOL`
    - `source_file`: `src/sql_jsc/mysql/protocol/DecodeBinaryValue.zig`
    - `source_reference`: `lines 181-188`
    - `statement`: `MYSQL_TYPE_BIT` with `column_length == 1` returns a boolean cell.
    - `preconditions`: `field_type == MYSQL_TYPE_BIT`; `column_length == 1`; valid length-encoded payload.
    - `expected_behavior`: Decodes payload; returns `{ tag = bool, value.bool = 1 }` iff payload length > 0 and first payload byte equals `1`; otherwise returns bool `0`.
    - `edge_cases_covered`: Empty payload -> false; first byte `0` -> false; first byte `2` -> false; raw flag ignored.
    - `why_this_is_Zig_derived`: Zig special-cases `column_length == 1` before raw handling and tests `slice[0] == 1`.
    - `ambiguities_or_assumptions`: `column_length` is interpreted as BIT width, not payload byte length.

28. `theorem_id`: `DBV_BIT_NON_ONE_RAW`
    - `source_file`: `src/sql_jsc/mysql/protocol/DecodeBinaryValue.zig`
    - `source_reference`: `lines 188-192`
    - `statement`: `MYSQL_TYPE_BIT` with `column_length != 1` returns raw length-encoded payload.
    - `preconditions`: `field_type == MYSQL_TYPE_BIT`; `column_length != 1`; valid length-encoded payload.
    - `expected_behavior`: Returns tag `raw` with payload bytes.
    - `edge_cases_covered`: `column_length == 0`; `column_length > 1`; `raw` flag ignored.
    - `why_this_is_Zig_derived`: Else branch always returns `SQLDataCell.raw`.
    - `ambiguities_or_assumptions`: None.

29. `theorem_id`: `DBV_FALLBACK_UNKNOWN_TYPES`
    - `source_file`: `src/sql_jsc/mysql/protocol/DecodeBinaryValue.zig`; `src/sql/mysql/MySQLTypes.zig`
    - `source_reference`: `DecodeBinaryValue.zig lines 194-198`; `MySQLTypes.zig lines 240-273`
    - `statement`: Any field type not matched by earlier cases reads `column_length` bytes and returns raw.
    - `preconditions`: `field_type` is unmatched, e.g. `DECIMAL`, `NULL`, `YEAR`, `NEWDATE`, `TIMESTAMP2`, `DATETIME2`, `TIME2`, or enum wildcard; reader can read `column_length` bytes.
    - `expected_behavior`: Reads exactly `column_length`; returns tag `raw`.
    - `edge_cases_covered`: `column_length == 0`; unknown enum values; all flags ignored.
    - `why_this_is_Zig_derived`: Final `else` branch reads `column_length` and returns raw.
    - `ambiguities_or_assumptions`: Whether `MYSQL_TYPE_NULL` should appear on wire is outside this function.

30. `theorem_id`: `DBV_NO_FLAG_BASELINE`
    - `source_file`: `src/sql_jsc/mysql/protocol/DecodeBinaryValue.zig`
    - `source_reference`: `lines 9-198`
    - `statement`: With all flags false, each type follows its non-raw, signed, non-bigint, non-binary default path.
    - `preconditions`: `raw == false`; `bigint == false`; `unsigned == false`; `binary == false`.
    - `expected_behavior`: Tiny/short/int24/long return signed `int4`; longlong returns `int4` if in `i32` range else decimal string; float/double return `float8`; time/date decode structured values; string-like returns `string`; JSON returns `json`; BIT follows column-length rule; fallback returns raw.
    - `edge_cases_covered`: Explicit no-flag behavior across all branches.
    - `why_this_is_Zig_derived`: Flags are tested only at the branch points listed above.
    - `ambiguities_or_assumptions`: None.

31. `theorem_id`: `DBV_FLAG_VALIDITY_AND_IGNORED_FLAGS`
    - `source_file`: `src/sql_jsc/mysql/protocol/DecodeBinaryValue.zig`
    - `source_reference`: `function signature line 6; branch lines 9-198`
    - `statement`: All boolean flag combinations are accepted; unsupported combinations do not cause invalid-flag termination.
    - `preconditions`: Any values of `raw`, `bigint`, `unsigned`, `binary`; any `character_set`.
    - `expected_behavior`: No branch returns an error solely because of a flag combination. Flags are ignored outside their relevant branches: `bigint` only affects non-raw `LONGLONG` outside 32-bit range; `unsigned` only affects integer decoding; `binary`/`character_set` only affect non-raw string-like fields; `raw` is ignored for TIME, DATE-like, BIT, and fallback branches.
    - `edge_cases_covered`: “Invalid flag combination” space is empty in Zig.
    - `why_this_is_Zig_derived`: Zig contains no validation switch for flag combinations.
    - `ambiguities_or_assumptions`: Caller may impose external obligations not present in this function.

32. `theorem_id`: `DBV_ERROR_PROPAGATION_READER`
    - `source_file`: `src/sql_jsc/mysql/protocol/DecodeBinaryValue.zig`; `src/sql/mysql/protocol/NewReader.zig`
    - `source_reference`: `DecodeBinaryValue.zig all try reader.* calls; NewReader.zig lines 31-83`
    - `statement`: Reader failures propagate as function failures.
    - `preconditions`: Any branch requiring `reader.read`, `reader.byte`, `reader.int`, or `reader.encodeLenString`; reader operation fails.
    - `expected_behavior`: `decodeBinaryValue` returns the same error via `try`, except explicit `InvalidBinaryValue` branches.
    - `edge_cases_covered`: Short reads; invalid length-encoded strings; missing length byte.
    - `why_this_is_Zig_derived`: Zig uses `try` on reader operations.
    - `ambiguities_or_assumptions`: Exact error type depends on reader implementation.

33. `theorem_id`: `DBV_LENGTH_ENCODED_STRING_INVALID`
    - `source_file`: `src/sql/mysql/protocol/NewReader.zig`; `src/sql/mysql/protocol/EncodeInt.zig`
    - `source_reference`: `NewReader.zig lines 61-68`; `EncodeInt.zig lines 24-57`
    - `statement`: Branches using `encodeLenString` fail when the length-encoded integer prefix is absent or incomplete.
    - `preconditions`: Branch calls `reader.encodeLenString()`; `decodeLengthInt(reader.peek())` returns null.
    - `expected_behavior`: Returns `InvalidEncodedLength`.
    - `edge_cases_covered`: Empty input; `0xfc` with <3 bytes; `0xfd` with <4 bytes; `0xfe` with <9 bytes.
    - `why_this_is_Zig_derived`: `encodeLenString` maps null decode to `AnyMySQLError.Error.InvalidEncodedLength`.
    - `ambiguities_or_assumptions`: If prefix is valid but payload read is short, reader read error propagates instead.

34. `theorem_id`: `DBV_EMPTY_AND_BOUNDARY_INPUTS`
    - `source_file`: `src/sql_jsc/mysql/protocol/DecodeBinaryValue.zig`
    - `source_reference`: `lines 9-198`
    - `statement`: Empty input succeeds only for branches that read zero bytes after already satisfying required metadata, otherwise fails through reader.
    - `preconditions`: Reader has insufficient bytes for the selected branch.
    - `expected_behavior`: Fixed numeric/time/date length reads require their bytes; string-like/json/bit require at least a valid length prefix; fallback with `column_length == 0` can return empty raw; fallback with `column_length > 0` requires that many bytes.
    - `edge_cases_covered`: Empty reader; singleton reader; boundary `column_length == 0`.
    - `why_this_is_Zig_derived`: Every branch’s reads are explicit in Zig.
    - `ambiguities_or_assumptions`: Exact short-read error comes from concrete reader context.