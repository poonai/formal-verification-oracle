13. `theorem_id`: `LF_013_shrink_static_slice_noop`
    - `source_file`: `src/collections/linear_fifo.zig`
    - `source_reference`: `lines 109-118`
    - `statement`: `shrink` does nothing for Static and Slice FIFOs after checking `size >= count`.
    - `preconditions`: `buffer_type != Dynamic`, `size >= count`.
    - `expected_behavior`: Capacity, head, count, and readable sequence unchanged.
    - `edge_cases_covered`: size smaller than capacity but at least count.
    - `why_this_is_Zig_derived`: Only dynamic branch mutates.
    - `ambiguities_or_assumptions`: `size < count` is assertion failure, not normal behavior.