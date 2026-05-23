35. `theorem_id`: `TOML_ESCAPE_SPECIAL_SINGLE_CHAR_MAPPINGS`
    - `source_file`: `src/parsers/toml/lexer.zig`
    - `source_reference`: `decodeEscapeSequences`, lines 839-870
    - `statement`: Escape sequences map `\b,\f,\n,\v,\t,\r` to byte values 8,9,10,11,12,13 respectively.
    - `preconditions`: Decoding a double-quoted string containing these escapes.
    - `expected_behavior`: Output buffer receives the corresponding control byte.
    - `edge_cases_covered`: Vertical tab accepted; tab maps to 12 in Zig; form-feed maps to 9 in Zig.
    - `why_this_is_Zig_derived`: Zig appends those numeric constants in each escape case.
    - `ambiguities_or_assumptions`: These mappings may differ from standard expectations; do not repair.