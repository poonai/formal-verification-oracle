41. `theorem_id`: `TOML_DOT_TOKEN_VERSUS_DOT_NUMBER`
    - `source_file`: `src/parsers/toml/lexer.zig`
    - `source_reference`: `parseNumericLiteralOrDot`, lines 190-201
    - `statement`: `.` tokenizes as key separator unless followed by a digit, in which case it begins a numeric literal.
    - `preconditions`: Lexer sees `.`.
    - `expected_behavior`: If next code point is digit, token is numeric; otherwise token is `t_dot`.
    - `edge_cases_covered`: Dotted keys; `.5` numeric value; trailing key dot.
    - `why_this_is_Zig_derived`: Early check returns `T.t_dot` only when first `.` and next not digit.
    - `ambiguities_or_assumptions`: Numeric `.5` as a key segment becomes raw string key if parsed in key context.