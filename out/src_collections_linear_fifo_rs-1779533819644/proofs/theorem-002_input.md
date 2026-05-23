2. `theorem_id`: `LF_002_init_static_empty_state`
   - `source_file`: `src/collections/linear_fifo.zig`
   - `source_reference`: `lines 54-61`
   - `statement`: Static initialization starts empty with `head == 0` and `count == 0`.
   - `preconditions`: `buffer_type == Static(n)`.
   - `expected_behavior`: Buffer capacity is `n`; contents are undefined; readable length is zero.
   - `edge_cases_covered`: `n == 0`, singleton capacity, power-of-two and non-power-of-two capacities.
   - `why_this_is_Zig_derived`: `initStatic` sets `.head = 0`, `.count = 0`, `.buf = undefined`.
   - `ambiguities_or_assumptions`: Undefined unused contents are not observable unless read through invalid use.