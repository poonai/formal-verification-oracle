25. `theorem_id`: `parsehex_valid_exact_length_returns_bitcast`
    - `source_file`: `src/runtime/bake/DevServer.zig`
    - `source_reference`: `parseHexToInt`
    - `statement`: A valid hex string of exactly `2 * @sizeOf(T)` characters decodes to bytes and returns `@bitCast(out)`.
    - `preconditions`: `slice` is valid hex; decoded byte count is `@sizeOf(T)`.
    - `expected_behavior`: Returns non-null integer value represented by decoded bytes.
    - `edge_cases_covered`: Boundary exact length.
    - `why_this_is_Zig_derived`: Calls `std.fmt.hexToBytes(&out, slice)` and returns `@bitCast(out)`.
    - `ambiguities_or_assumptions`: Endianness follows Zig memory representation via `@bitCast`.
