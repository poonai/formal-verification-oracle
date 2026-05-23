8. `theorem_id`: `LF_008_ensure_total_capacity_dynamic_grows_and_realigns`
   - `source_file`: `src/collections/linear_fifo.zig`
   - `source_reference`: `lines 123-140`
   - `statement`: Dynamic `ensureTotalCapacity(size)` grows storage when needed and preserves readable contents.
   - `preconditions`: `buffer_type == Dynamic`, `buf.len < size`, allocation succeeds.
   - `expected_behavior`: Calls `realign`; allocates new capacity `ceilPowerOfTwo(size)` because dynamic uses `powers_of_two == true`; copies readable contents to index 0; frees old buffer; sets `head == 0`.
   - `edge_cases_covered`: empty dynamic FIFO, wrapped readable contents, singleton growth.
   - `why_this_is_Zig_derived`: Dynamic branch realigns, allocates `new_size`, copies `readableSlice(0)`, frees old buffer, resets head.
   - `ambiguities_or_assumptions`: Dafny may model capacity as exactly `size`; Zig rounds dynamic capacity to power of two.