intended bug found

The proof result identifies the JSON lexer rejecting `?` immediately as unsupported syntax, before Zig-style token/fallback behavior can run. That directly matches the benchmark bug: early rejection of non-JSON define characters blocks the auto-quoting fallback.
