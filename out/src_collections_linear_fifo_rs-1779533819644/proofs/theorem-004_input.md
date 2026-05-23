4. `theorem_id`: `LF_004_init_dynamic_empty_zero_capacity`
   - `source_file`: `src/collections/linear_fifo.zig`
   - `source_reference`: `lines 72-79`
   - `statement`: Dynamic initialization starts empty with zero capacity.
   - `preconditions`: `buffer_type == Dynamic`, valid allocator supplied.
   - `expected_behavior`: `buf.len == 0`, `head == 0`, `count == 0`.
   - `edge_cases_covered`: initial zero-capacity dynamic FIFO.
   - `why_this_is_Zig_derived`: `initDynamic` sets `.buf = &[_]T{}`.
   - `ambiguities_or_assumptions`: Allocator identity/lifetime is a caller obligation.