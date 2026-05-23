Proved `LF_006_readable_and_writable_lengths` against the existing Dafny model.

What I changed:
- Added theorem method:
  - `LF_006_readable_and_writable_lengths`
- Added edge-case witnesses:
  - `LF_006_empty_fifo_witness`
  - `LF_006_full_fifo_witness`
  - `LF_006_zero_capacity_witness`
- Added one Dafny spec postcondition to `update`:
  - `ensures |buf| == old(|buf|)`
  - This was needed for the full-FIFO witness and matches the existing method body; no body logic was changed.

Verification:
- Ran: `dafny verify src/collections/linear_fifo.dfy`
- Result: `59 verified, 0 errors`

Zig confirmation:
- Confirmed source lines:
  - `readableLength()` returns `self.count`
  - `writableLength()` returns `self.buf.len - self.count`

No Dafny method bodies were modified. The theorem and all specified edge cases verified successfully.
