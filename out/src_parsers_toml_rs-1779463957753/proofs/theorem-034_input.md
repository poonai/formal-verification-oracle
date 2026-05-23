34. `theorem_id`: `TOML_STRING_UNTERMINATED_ERRORS`
    - `source_file`: `src/parsers/toml/lexer.zig`
    - `source_reference`: single quote lines 648-676; double quote lines 711-749
    - `statement`: Unterminated string literals terminate parsing with syntax errors.
    - `preconditions`: Lexer enters string branch and reaches EOF or forbidden newline before closing delimiter.
    - `expected_behavior`: Single-line single quote newline => `"Unterminated string literal (single-line)"`; EOF single quote => `"Unterminated string literal"`; single-line double quote newline => `"Unterminated basic string (single-line)"`; EOF double quote => `"Unterminated basic string"`.
    - `edge_cases_covered`: EOF; newline in single-line strings; multiline missing delimiter.
    - `why_this_is_Zig_derived`: Lexer calls `addDefaultError` at these cases.
    - `ambiguities_or_assumptions`: Exact user-facing diagnostic may be redacted by flag.