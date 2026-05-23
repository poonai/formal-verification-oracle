37. `theorem_id`: `TOML_ESCAPE_UNICODE_FIXED_AND_VARIABLE`
    - `source_file`: `src/parsers/toml/lexer.zig`
    - `source_reference`: `decodeEscapeSequences`, lines 988-1078
    - `statement`: `\uXXXX` and `\u{...}` decode Unicode code points; invalid digits/empty braces/out-of-range variable value fail.
    - `preconditions`: Escape decoder sees `\u`.
    - `expected_behavior`: Fixed form consumes four hex digits; variable form consumes one or more hex digits until `}` and rejects values above `0x10FFFF`.
    - `edge_cases_covered`: Empty `\u{}`; non-hex char; out-of-range code point.
    - `why_this_is_Zig_derived`: Zig implements separate fixed and brace-form branches with range check.
    - `ambiguities_or_assumptions`: Fixed form truncates to `CodePoint` after accumulation.