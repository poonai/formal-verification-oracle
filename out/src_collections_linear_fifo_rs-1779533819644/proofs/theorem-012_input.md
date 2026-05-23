12. `theorem_id`: `LF_012_shrink_dynamic`
    - `source_file`: `src/collections/linear_fifo.zig`
    - `source_reference`: `lines 109-118`
    - `statement`: Dynamic `shrink(size)` attempts to reduce capacity while preserving readable contents.
    - `preconditions`: `buffer_type == Dynamic`, `size >= count`.
    - `expected_behavior`: Calls `realign`; attempts `realloc` to `size`; on success capacity becomes `size`; on OOM capacity remains valid and contents preserved.
    - `edge_cases_covered`: shrink to `count`, shrink to zero when empty.
    - `why_this_is_Zig_derived`: `assert(size >= count)`, dynamic branch realigns and catches `OutOfMemory` by returning.
    - `ambiguities_or_assumptions`: OOM nondeterminism may need separate theorem if allocator failures are modeled.