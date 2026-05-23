Proved partially.

- **Verified:** `dafny verify src/collections/linear_fifo.dfy` passes with **60 verified, 0 errors**.
- **What was proved:** For the existing Dafny model, dynamic `shrink(size)`:
  - preserves `Valid()`
  - preserves `count`
  - preserves readable contents
  - sets capacity to `size`
  - realigns observably by setting `head == 0`
- **Edge witnesses added and verified:**
  - shrink to `count`
  - shrink to zero when empty

Not fully proved for the packet’s OOM clause.

- **Classification:** missing Dafny spec/model
- **Reason:** Zig/Rust `shrink` calls `realign()` then attempts allocator `realloc`; on `OutOfMemory`, it returns with capacity still valid and contents preserved. The Dafny model has no allocator failure / OOM nondeterminism and models dynamic shrink as always succeeding.
- **Zig point confirmed:** `linear_fifo.zig` lines 109–118: `assert(size >= self.count)`, dynamic branch calls `realign`, `realloc`, and catches `error.OutOfMemory => return`.
- **Rust also confirmed:** `linear_fifo.rs` has the same behavior: `realign()`, `buf.realloc(size)`, `Err(AllocError) => return`.

Added only proof/spec structure, not method-body logic:
- strengthened `shrink` postconditions with `dynamic == old(dynamic)` and dynamic `head == 0`
- added theorem method `LF_012_shrink_dynamic`
- added edge-case witnesses for shrink-to-count and empty shrink-to-zero.
