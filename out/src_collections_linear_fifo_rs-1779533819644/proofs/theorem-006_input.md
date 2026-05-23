6. `theorem_id`: `LF_006_readable_and_writable_lengths`
   - `source_file`: `src/collections/linear_fifo.zig`
   - `source_reference`: `lines 149-151, 238-240`
   - `statement`: Readable length equals `count`; writable length equals `buf.len - count`.
   - `preconditions`: Valid FIFO state with `count <= buf.len`.
   - `expected_behavior`: `readableLength() == count`; `writableLength() == capacity - count`.
   - `edge_cases_covered`: empty FIFO, full FIFO, zero capacity.
   - `why_this_is_Zig_derived`: Both functions directly return those expressions.
   - `ambiguities_or_assumptions`: If `count > buf.len`, writable length would underflow; Zig validity relies on caller-maintained invariants.