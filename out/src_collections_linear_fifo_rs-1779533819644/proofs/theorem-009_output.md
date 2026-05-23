Proved `LF_009_ensure_total_capacity_static_slice_fails_when_insufficient` against the existing Dafny model.

What I confirmed from Zig:
- In `linear_fifo.zig` lines 123-140, `ensureTotalCapacity` returns immediately if capacity is already enough.
- If not enough and `buffer_type == .Dynamic`, it reallocates.
- Otherwise it executes `return error.OutOfMemory;`.
- So for non-dynamic FIFOs with `buf.len < size`, failure is expected and state should remain unchanged.

What I added in Dafny:
- Failure postconditions on `ensure_total_capacity`:
  - if old `dynamic == false` and old capacity `< size`, then `ok == false`
  - on failure, `buf`, `head`, `dynamic`, `powers_of_two`, `fill`, `count`, and readable model are unchanged
- Small spec additions to `update` proving it does not change capacity/dynamic flags, needed for full-buffer edge witnesses.
- Main theorem method:
  - `LF_009_ensure_total_capacity_static_slice_fails_when_insufficient`
- Edge-case witnesses:
  - full non-dynamic FIFO
  - zero-capacity non-dynamic FIFO
  - separate “Static”/“Slice” witness names, though the Dafny model only represents both as `dynamic == false` and does not distinguish Static vs Slice directly.

Verification result:

```text
Dafny program verifier finished with 60 verified, 0 errors
```

No Dafny method body logic was changed.
