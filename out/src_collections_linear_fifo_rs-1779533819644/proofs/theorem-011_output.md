Proved `LF_011_realign_preserves_read_order` against the Dafny model.

What I investigated:
- Read theorem packet first.
- Confirmed Zig `realign` at `src/collections/linear_fifo.zig` lines 85-107:
  - contiguous branch copies readable range to `buf[0..count]`
  - wrapped branch rotates until `head == 0`
  - unused region is overwritten with `undefined`
- Inspected Dafny `realign` and related readable-buffer helpers.
- Ran Dafny verification.

Added proof/spec structure:
- Added `BufferReadableModel()` to express the circular-buffer readable sequence from `buf`, `head`, and `count`.
- Added helper lemma `ReadableFromHeadZeroPrefix`.
- Strengthened `realign` postconditions to prove:
  - `head == 0`
  - `count` unchanged
  - capacity unchanged
  - observable `ReadableModel()` unchanged
  - post-realign buffer-readable sequence equals the old logical model
- Added theorem method:
  - `LF_011_realign_preserves_read_order`
- Added edge-case witnesses:
  - `LF_011_edge_contiguous_readable_region`
  - `LF_011_edge_wrapped_readable_region`
  - `LF_011_edge_empty_fifo`

Verification result:

```text
Dafny program verifier finished with 62 verified, 0 errors
```

Caveat:
- The existing Dafny `Valid()` predicate does not relate `model` to the physical circular-buffer contents. So the general theorem is proved for the model’s observable logical sequence, `ReadableModel()`. The edge witnesses additionally confirm the Zig-derived physical-buffer behavior for contiguous, wrapped, and empty cases.
