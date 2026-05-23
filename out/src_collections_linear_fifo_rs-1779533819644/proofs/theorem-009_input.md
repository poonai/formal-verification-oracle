9. `theorem_id`: `LF_009_ensure_total_capacity_static_slice_fails_when_insufficient`
   - `source_file`: `src/collections/linear_fifo.zig`
   - `source_reference`: `lines 123-140`
   - `statement`: Non-dynamic FIFOs cannot grow.
   - `preconditions`: `buffer_type != Dynamic`, `buf.len < size`.
   - `expected_behavior`: Returns `error.OutOfMemory`; state unchanged.
   - `edge_cases_covered`: full Static/Slice FIFO, zero-capacity Slice/Static.
   - `why_this_is_Zig_derived`: Else branch returns `error.OutOfMemory`.
   - `ambiguities_or_assumptions`: Zig error union maps to boolean/error result in model.