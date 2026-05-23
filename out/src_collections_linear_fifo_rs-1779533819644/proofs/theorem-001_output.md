Theorem `LF_001_buffer_type_cases_only` was **not proved** against the existing Dafny model.

Classification: **likely bug / divergence** in the Dafny model relative to Zig.

What I investigated:
- Read Zig `src/collections/linear_fifo.zig` lines 7–52.
  - `LinearFifoBufferType` is a `union(enum)` with exactly:
    - `.Static: usize`
    - `.Slice`
    - `.Dynamic`
  - `BufferType` maps `.Static` to inline `[size]T`, otherwise `[]T`.
  - `init` dispatches by `switch (buffer_type)` only over those three cases.
- Read Dafny `src/collections/linear_fifo.dfy`.
  - The Dafny constructor is:

    ```dafny
    constructor Init(capacity: nat, dynamic_: bool, powers_of_two_: bool)
    ```

  - It stores `dynamic` and `powers_of_two` as independent runtime booleans.
  - There is no Dafny datatype corresponding to the Zig `union(enum)`.
  - There is no precondition tying `dynamic_` / `powers_of_two_` to one of the three Zig modes.
- Checked Rust `src/collections/linear_fifo.rs`.
  - Rust agrees with Zig structurally: it has `LinearFifoBufferType::{Static, Slice, Dynamic}` and separate `StaticBuffer`, `SliceBuffer`, `DynamicBuffer` impls.
  - The Rust trait constants derive `DYNAMIC` / `POWERS_OF_TWO` from the buffer type, not arbitrary runtime flags.

Concrete blocker:
- The Dafny model allows states that Zig cannot construct, for example:

  ```dafny
  var fifo := new LinearFifo<int>.Init(3, false, true);
  ```

  This creates a valid Dafny FIFO with:
  - capacity `3`
  - `dynamic == false`
  - `powers_of_two == true`

  But no Zig mode corresponds to that:
  - `Static(3)` has `powers_of_two == false`
  - `Slice` has `powers_of_two == false`
  - `Dynamic` has `dynamic == true`

Verification work done:
- Created scratch Dafny proof files in `/tmp`, not modifying the model.
- Added Zig-derived helper spec:
  - `datatype ZigBufferType = Static(size) | Slice | Dynamic`
  - `IsPowerOfTwo`
  - `ZigDynamicFlag`
  - `ZigPowersOfTwoConst`
  - mapping predicate from Dafny state to Zig mode
- Verified a counterexample lemma showing the existing Dafny model admits an invalid runtime flag combination that no Zig buffer mode can represent.

Result:
- Existing Dafny model verifies on its own.
- The Zig-derived theorem fails because the Dafny abstraction exposes independent runtime flags where Zig has a compile-time tagged union.
- I did **not** change the Dafny method body or repair the model.
