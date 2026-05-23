31. `theorem_id`: `TOML_REDACT_LOGS_FLAG_ONLY_AFFECTS_ERROR_LOG_OPTIONS`
    - `source_file`: `src/parsers/toml.zig`, `src/parsers/toml/lexer.zig`
    - `source_reference`: `TOML.init` lines 37-43; `Lexer.init` lines 1159-1168; error logging lines 83-91, 116-122
    - `statement`: The `redact_logs` input flag is stored in the lexer and only passed to log error options.
    - `preconditions`: Same source/allocator/log except `redact_logs` differs.
    - `expected_behavior`: Successful parse result is identical; syntax success/failure control flow is identical; only error redaction metadata differs.
    - `edge_cases_covered`: No-flag behavior (`false`); redacted behavior (`true`); invalid source.
    - `why_this_is_Zig_derived`: `redact_logs` is assigned to `should_redact_logs` and referenced only in add-error option construction.
    - `ambiguities_or_assumptions`: “Identical” excludes diagnostic formatting/redaction side effects.