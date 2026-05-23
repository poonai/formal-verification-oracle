5. `theorem_id`: `LF_005_deinit_dynamic_only`
   - `source_file`: `src/collections/linear_fifo.zig`
   - `source_reference`: `lines 81-83`
   - `statement`: `deinit` frees storage only for dynamic FIFOs.
   - `preconditions`: FIFO previously initialized.
   - `expected_behavior`: Dynamic calls `allocator.free(self.buf)`; Static/Slice do nothing.
   - `edge_cases_covered`: zero-capacity dynamic buffer; non-owning Slice buffer.
   - `why_this_is_Zig_derived`: `if (buffer_type == .Dynamic)` guards the free.
   - `ambiguities_or_assumptions`: Dafny may not model allocator/free effects.