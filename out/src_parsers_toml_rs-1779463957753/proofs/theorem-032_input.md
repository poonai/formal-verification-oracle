32. `theorem_id`: `TOML_SINGLE_QUOTED_STRINGS_ARE_LITERAL`
    - `source_file`: `src/parsers/toml/lexer.zig`
    - `source_reference`: lexer lines 627-688
    - `statement`: Single-quoted strings return their contents literally without escape decoding.
    - `preconditions`: Source contains valid `'...'`, `''`, or `'''...'''` string token.
    - `expected_behavior`: Token is `t_string_literal`; `string_literal_slice` is source content between delimiters; backslashes are not decoded.
    - `edge_cases_covered`: Empty single-quoted string; multiline literal string; unterminated single-line literal.
    - `why_this_is_Zig_derived`: Single-quote branch never calls `decodeEscapeSequences`.
    - `ambiguities_or_assumptions`: Multiline slice starts at `start + 2`, matching Zig’s delimiter accounting.