33. `theorem_id`: `TOML_DOUBLE_QUOTED_STRINGS_DECODE_ESCAPES_WHEN_NEEDED`
    - `source_file`: `src/parsers/toml/lexer.zig`
    - `source_reference`: lexer lines 690-787; decode lines 812-1119
    - `statement`: Double-quoted strings without backslashes return raw content; with backslashes run escape decoding.
    - `preconditions`: Source contains valid `"..."` or `"""..."""`.
    - `expected_behavior`: Token is `t_string_literal`; if `needs_slow_pass`, decoded slice replaces raw slice and `string_literal_is_ascii` becomes false.
    - `edge_cases_covered`: Empty basic string; multiline basic string; escaped quote.
    - `why_this_is_Zig_derived`: Double-quote branch tracks `needs_slow_pass` and calls `decodeEscapeSequences`.
    - `ambiguities_or_assumptions`: `string_literal_is_ascii=false` is used as marker even for decoded ASCII output.