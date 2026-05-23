36. `theorem_id`: `TOML_ESCAPE_HEX_INVALID_IN_MULTILINE`
    - `source_file`: `src/parsers/toml/lexer.zig`
    - `source_reference`: `decodeEscapeSequences`, lines 937-987
    - `statement`: `\xHH` is accepted only for non-multiline decoded strings and rejected in multiline decoded strings.
    - `preconditions`: Escape decoder sees `\x`; `allow_multiline` parameter true or false.
    - `expected_behavior`: If `allow_multiline == true`, syntax error; otherwise exactly two hex digits are required and decoded to one code point.
    - `edge_cases_covered`: Invalid hex digit; EOF after `\x`; multiline `\x`.
    - `why_this_is_Zig_derived`: `if (comptime allow_multiline)` triggers syntax error before hex parsing.
    - `ambiguities_or_assumptions`: “multiline” here means decoder parameter, not source merely containing newline.