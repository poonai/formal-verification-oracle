40. `theorem_id`: `TOML_DECIMAL_FLOAT_EXPONENT_AND_UNDERSCORES`
    - `source_file`: `src/parsers/toml/lexer.zig`
    - `source_reference`: `parseNumericLiteralOrDot`, lines 341-486
    - `statement`: Decimal numbers may include fractional part, exponent, and underscores subject to placement checks; parsed value is f64.
    - `preconditions`: Lexer scans decimal/dot-start numeric literal.
    - `expected_behavior`: Valid integer under 10 source bytes without dot/exponent uses fast u32 path; otherwise underscores are removed and `parseFloat(f64)` is used; invalid underscore/exponent forms fail.
    - `edge_cases_covered`: `.5`; `1.`; `1_e2`; `1e+2`; `1e`; `1__2`.
    - `why_this_is_Zig_derived`: Decimal branch handles digits, fraction, exponent, underscore filtering, and parseFloat.
    - `ambiguities_or_assumptions`: A lone dot token is not numeric.