10. `theorem_id`: `LF_010_ensure_unused_capacity`
    - `source_file`: `src/collections/linear_fifo.zig`
    - `source_reference`: `lines 142-147`
    - `statement`: `ensureUnusedCapacity(size)` succeeds without mutation if current writable length is enough; otherwise it requires total capacity `count + size`.
    - `preconditions`: Valid FIFO; `count + size` does not overflow, or overflow is treated as `OutOfMemory`.
    - `expected_behavior`: If `writableLength() >= size`, success no-op. Else delegates to `ensureTotalCapacity(count + size)`.
    - `edge_cases_covered`: `size == 0`, exact writable boundary, arithmetic overflow.
    - `why_this_is_Zig_derived`: Function checks writable length then calls `math.add`.
    - `ambiguities_or_assumptions`: Overflow produces `error.OutOfMemory`.