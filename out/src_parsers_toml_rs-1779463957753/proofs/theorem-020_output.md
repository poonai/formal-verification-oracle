Proved `TOML_VALUE_BOOLEAN_LITERALS` against the existing Dafny model.

What I investigated:
- Read theorem packet first.
- Confirmed Zig `parseValue` at `src/parsers/toml.zig:243-256` has explicit `.t_false` / `.t_true` cases returning `E.Boolean{ value = false/true }` after one lexer advance.
- Confirmed edge-case behavior in Zig `parseKeySegment`: `.t_false` / `.t_true` key segments become string keys `"false"` / `"true"`, not booleans.

Dafny work added:
- Added Zig-derived postconditions to:
  - `ParseValue`
  - `ParseValueInner`
  - `ParseKeySegment`
- Added constructor postconditions needed for local witnesses.
- Added four witness methods:
  - `TOML_VALUE_BOOLEAN_LITERALS_false_value_witness`
  - `TOML_VALUE_BOOLEAN_LITERALS_true_value_witness`
  - `TOML_VALUE_BOOLEAN_LITERALS_false_key_segment_edge_witness`
  - `TOML_VALUE_BOOLEAN_LITERALS_true_key_segment_edge_witness`

Verification:
- Ran: `dafny verify --allow-warnings src/parsers/toml.dfy`
- Result: `11 verified, 0 errors`
- Existing `{:verify false}` warnings remain; no method bodies were changed.
