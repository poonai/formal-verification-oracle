Created and verified:

- `/home/saint/bun/src/collections/linear_fifo.dfy`

Verification run:

```bash
dafny verify /home/saint/bun/src/collections/linear_fifo.dfy
```

Result: `54 verified, 0 errors`

Non-operational deviations called out in-file:
- Rust `MaybeUninit`, allocator-backed storage, and slice borrowing are represented with a Dafny `seq<T>` buffer.
- Writable slice APIs are adapted mechanically because Dafny cannot return Rust-style mutable borrowed slices.
- A `model` sequence is maintained as verification scaffolding for observable FIFO contents while preserving the circular-buffer state fields (`buf`, `head`, `count`).
