1. `theorem_id`: `LF_001_buffer_type_cases_only`
   - `source_file`: `src/collections/linear_fifo.zig`
   - `source_reference`: `lines 7-32, 48-52`
   - `statement`: `LinearFifo` has exactly three compile-time buffer modes: `Static(size)`, `Slice`, and `Dynamic`.
   - `preconditions`: `buffer_type` is one of the Zig union enum cases.
   - `expected_behavior`: `Static` stores an inline `[size]T`; `Slice` stores caller-provided `[]T`; `Dynamic` stores allocator-managed `[]T`. There are no runtime flag combinations.
   - `edge_cases_covered`: no-flag behavior; invalid flag combinations are compile-time-unrepresentable.
   - `why_this_is_Zig_derived`: The Zig `union(enum)` defines only these cases and `init` dispatches by `switch`.
   - `ambiguities_or_assumptions`: Treat “invalid flags” as not applicable except malformed compile-time construction.