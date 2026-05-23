42. `theorem_id`: `TOML_INVALID_CHARACTER_IS_UNEXPECTED_SYNTAX_ERROR`
    - `source_file`: `src/parsers/toml/lexer.zig`
    - `source_reference`: `Lexer.next` lines 793-807; `unexpected` lines 1126-1138
    - `statement`: Any character not handled by lexer token cases is unexpected.
    - `preconditions`: Lexer current code point is not whitespace/comment, bracket, sign, brace, separator, quote, dot/digit, or identifier-start.
    - `expected_behavior`: Lexer logs `"Unexpected {raw}"` and returns syntax error.
    - `edge_cases_covered`: Unsupported punctuation; invalid leading identifier char.
    - `why_this_is_Zig_derived`: Final `else` in token switch calls `lexer.unexpected()`.
    - `ambiguities_or_assumptions`: Invalid UTF-8/WTF-8 bytes may decode to replacement behavior before this branch.