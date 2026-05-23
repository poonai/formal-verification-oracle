10. `theorem_id`: `TOML_DOTTED_ASSIGNMENT_CREATES_NESTED_OBJECTS`
    - `source_file`: `src/parsers/toml.zig`, `src/ast/e.zig`
    - `source_reference`: `parseAssignment` lines 205-231; `Object.setRope` lines 573-619
    - `statement`: Assigning `a.b.c = value` creates nested object properties along the rope when absent.
    - `preconditions`: Current object lacks the path prefix.
    - `expected_behavior`: Current object gets `a` object containing `b` object containing `c: value`.
    - `edge_cases_covered`: Multi-segment keys; absent parent objects.
    - `why_this_is_Zig_derived`: `setRope` recursively creates `E.Object` when `rope.next` exists.
    - `ambiguities_or_assumptions`: Property ordering follows append order if modeled.