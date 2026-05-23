Proved `LF_007_ensure_total_capacity_noop_when_enough`.

What I changed:
- Added postconditions to `ensure_total_capacity` for the Zig first-branch case:
  - if `old(|buf|) >= size`, then `ok`
  - `buf` unchanged
  - `head` unchanged
- Added theorem method:
  - `LF_007_ensure_total_capacity_noop_when_enough`
- Added edge-case witnesses:
  - `LF_007_edge_size_zero`
  - `LF_007_edge_exact_capacity`

Verification:
- Ran:

```bash
dafny verify src/collections/linear_fifo.dfy
```

Result:

```text
Dafny program verifier finished with 60 verified, 0 errors
```

Zig confirmation:
- Confirmed `src/collections/linear_fifo.zig` lines 122-124:

```zig
pub fn ensureTotalCapacity(self: *Self, size: usize) !void {
    if (self.buf.len >= size) return;
```

This directly supports the no-op success theorem when current capacity is already enough.

No Dafny method body was changed. The proof used only strengthened specifications and theorem/witness methods.
