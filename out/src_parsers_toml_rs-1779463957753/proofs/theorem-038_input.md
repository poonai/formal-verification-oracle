38. `theorem_id`: `TOML_MULTILINE_ESCAPE_LINE_CONTINUATION_IGNORED`
    - `source_file`: `src/parsers/toml/lexer.zig`
    - `source_reference`: `decodeEscapeSequences`, lines 1079-1099
    - `statement`: Backslash followed by newline is an ignored line continuation in multiline strings, but invalid in non-multiline strings.
    - `preconditions`: Escape decoder sees `\` followed by CR/LF/LS/PS.
    - `expected_behavior`: If `allow_multiline == true`, no character is appended; if false, syntax error `"Unexpected end of line"`.
    - `edge_cases_covered`: CRLF; LF; Unicode line separators.
    - `why_this_is_Zig_derived`: Newline escape cases conditionally error only when `!allow_multiline`, then `continue`.
    - `ambiguities_or_assumptions`: CRLF handling indexes `iter.i + 1`; assume valid range in reachable inputs.