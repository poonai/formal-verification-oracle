31. `theorem_id`: `EXP_BRACE_THEN_GLOB_TRANSITIONS_TO_GLOB`
   - `source_file`: `/home/saint/bun/src/runtime/shell/states/Expansion.zig`
   - `source_reference`: `next`, lines 280-284
   - `statement`: If a node has both brace and glob expansion flags, the expansion state moves to glob after pushing brace results.
   - `preconditions`: State is `.braces`; `node.has_glob_expansion() == true`.
   - `expected_behavior`: `state == glob` after brace results are pushed.
   - `edge_cases_covered`: Combined brace/glob expansion.
   - `why_this_is_Zig_derived`: Final conditional in braces branch.
   - `ambiguities_or_assumptions`: The glob pattern used is still `current_out`; comments note brace + command substitution has unsupported weird behavior.
