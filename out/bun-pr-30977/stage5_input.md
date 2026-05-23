dataset_id: bun-pr-30977
expected_bug_slug: assert_side_effect_lost_in_debug_assert
expected_stage3_label: intended bug found
bug_summary: A side-effecting Zig assert(...) became debug_assert!(...), so release builds skipped the side effect and broke dev-server initialization.
rust_selector: @src/runtime/bake/DevServer.rs::init
zig_semantic_anchor: init
notes: PR 30977 hoists a side effect out of debug_assert inside init.

theorem_packet:
25. `theorem_id`: `parsehex_valid_exact_length_returns_bitcast`
    - `source_file`: `src/runtime/bake/DevServer.zig`
    - `source_reference`: `parseHexToInt`
    - `statement`: A valid hex string of exactly `2 * @sizeOf(T)` characters decodes to bytes and returns `@bitCast(out)`.
    - `preconditions`: `slice` is valid hex; decoded byte count is `@sizeOf(T)`.
    - `expected_behavior`: Returns non-null integer value represented by decoded bytes.
    - `edge_cases_covered`: Boundary exact length.
    - `why_this_is_Zig_derived`: Calls `std.fmt.hexToBytes(&out, slice)` and returns `@bitCast(out)`.
    - `ambiguities_or_assumptions`: Endianness follows Zig memory representation via `@bitCast`.

proof_output:
Proved.

Investigated:
- Read theorem packet first.
- Confirmed Zig source for `parseHexToInt`:

```zig
pub fn parseHexToInt(comptime T: type, slice: []const u8) ?T {
    var out: [@sizeOf(T)]u8 = undefined;
    assert((std.fmt.hexToBytes(&out, slice) catch return null).len == @sizeOf(T));
    return @bitCast(out);
}
```

- Checked existing Dafny model: it had no `parseHexToInt` model, so I added a Zig-derived spec/helper rather than changing any existing method body.
- Verified existing model before and after with Dafny.

Added Dafny proof/spec material:
- `IsHexChar`
- `HexValue`
- `ValidHexString`
- `HexToBytes`
- abstract `BitCastBytesToInt`, to preserve Zig’s `@bitCast` / memory-representation ambiguity without inventing an endian rule
- `ParseHexToInt`
- Main lemma: `ParseHexValidExactLengthReturnsBitcast`
- Edge witnesses:
  - `ParseHexBoundaryExactLengthU64Witness`
  - `ParseHexBoundaryExactLengthOneByteWitness`

Verification result:

```text
Dafny program verifier finished with 36 verified, 0 errors
```

No Dafny method body was modified.