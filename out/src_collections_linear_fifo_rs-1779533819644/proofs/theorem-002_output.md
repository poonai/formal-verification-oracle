Proved `LF_002_init_static_empty_state`.

What I did:
- Confirmed Zig `initStatic` (`linear_fifo.zig` lines 54-61) returns:
  - `.buf = undefined`
  - `.head = 0`
  - `.count = 0`
- Checked surrounding Zig static behavior for `powers_of_two`.
- Checked the Rust static init mirrors this with `MaybeUninit`, `head: 0`, `count: 0`.
- Kept the Dafny FIFO implementation bodies fixed.

Added to `src/collections/linear_fifo.dfy`:
- `ZigLinearFifoBufferType`
- `ZigIsPowerOfTwo`
- Main theorem method:
  - `LF_002_init_static_empty_state`
- Edge-case witnesses:
  - `LF_002_edge_zero_capacity`
  - `LF_002_edge_singleton_capacity`
  - `LF_002_edge_power_of_two_capacity`
  - `LF_002_edge_non_power_of_two_capacity`

Verified with:

```bash
dafny verify src/collections/linear_fifo.dfy
```

Result:

```text
Dafny program verifier finished with 61 verified, 0 errors
```

Classification: proved. No divergence found.
