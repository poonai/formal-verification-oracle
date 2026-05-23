Proved `LF_004_init_dynamic_empty_zero_capacity`.

What I investigated:
- The theorem packet first.
- Zig `src/collections/linear_fifo.zig` lines 72-79: confirmed `initDynamic` sets:
  - `.buf = &[_]T{}`
  - `.head = 0`
  - `.count = 0`
- Nearby Zig also confirms `.Dynamic => true` for `powers_of_two`.
- Dafny model constructor `LinearFifo.Init(capacity, dynamic_, powers_of_two_)`.

Added to `src/collections/linear_fifo.dfy`:
- Zig-derived helper spec constants:
  - `ZigInitDynamicBufLen() == 0`
  - `ZigInitDynamicHead() == 0`
  - `ZigInitDynamicCount() == 0`
  - `ZigDynamicPowersOfTwo() == true`
- Edge-case witness:
  - `LF_004_edge_initial_zero_capacity_dynamic_FIFO`
- Main theorem:
  - `LF_004_init_dynamic_empty_zero_capacity`

Verification result:

```text
Dafny program verifier finished with 61 verified, 0 errors
```

No Dafny method bodies were changed.
