# Pipeline Report

datasetId: bun-pr-30977
rustTarget: /home/saint/bun/src/runtime/bake/DevServer.rs::init
zigReference: /home/saint/bun/src/runtime/bake/DevServer.zig (init)
stage1Selector: @src/runtime/bake/DevServer.rs::init
expectedBug: assert_side_effect_lost_in_debug_assert
expectedStage3Label: intended bug found

## Stage 1
transcript: /home/saint/proof-rewrite/.pi-sessions/bun-pr-30977/2026-05-22T10-36-53-887Z_019e4f42-6cff-7568-86f6-f5a09eef6800.jsonl

## Stage 2
transcript: /home/saint/proof-rewrite/.pi-sessions/bun-pr-30977/2026-05-22T10-43-13-374Z_019e4f48-375e-75fc-b561-5170b85c91b7.jsonl

## Stage 3
transcript: /home/saint/proof-rewrite/.pi-sessions/bun-pr-30977/2026-05-22T10-45-25-081Z_019e4f4a-39d9-7ac2-85a2-1ea87d50b76e.jsonl

### Selected Theorem
```text
25. `theorem_id`: `parsehex_valid_exact_length_returns_bitcast`
    - `source_file`: `src/runtime/bake/DevServer.zig`
    - `source_reference`: `parseHexToInt`
    - `statement`: A valid hex string of exactly `2 * @sizeOf(T)` characters decodes to bytes and returns `@bitCast(out)`.
    - `preconditions`: `slice` is valid hex; decoded byte count is `@sizeOf(T)`.
    - `expected_behavior`: Returns non-null integer value represented by decoded bytes.
    - `edge_cases_covered`: Boundary exact length.
    - `why_this_is_Zig_derived`: Calls `std.fmt.hexToBytes(&out, slice)` and returns `@bitCast(out)`.
    - `ambiguities_or_assumptions`: Endianness follows Zig memory representation via `@bitCast`.
```

## Stage 4
transcript: /home/saint/proof-rewrite/.pi-sessions/bun-pr-30977/2026-05-22T10-46-01-051Z_019e4f4a-c65b-7d54-81d5-4de8e9d705fb.jsonl

### Stage 4 Output
```text
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
```

## Stage 5
transcript: /home/saint/proof-rewrite/.pi-sessions/bun-pr-30977/2026-05-22T10-47-19-443Z_019e4f4b-f893-79e4-8c24-7ee0feb60ec7.jsonl
classification: no bug found

### Stage 5 Output
```text
no bug found

The proof only modeled and proved `parseHexToInt` valid-length behavior. It did not identify the intended release-build bug: a side-effecting `assert(...)` incorrectly ported to `debug_assert!(...)` in `DevServer::init`, causing the side effect to be skipped.
```