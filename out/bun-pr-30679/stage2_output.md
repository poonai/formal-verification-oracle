1. **theorem packet**
   - `theorem_id`: `LEX_INIT_EMPTY_SOURCE_EOF`
   - `source_file`: `src/js_parser/lexer.zig`
   - `source_reference`: `init`, `initJSON`, `step`, `next`
   - `statement`: Initializing a lexer on an empty source yields `t_end_of_file`.
   - `preconditions`: `source.contents.len == 0`.
   - `expected_behavior`: `step()` sets `code_point = -1`; first `next()` sets `token = t_end_of_file`, `start = 0`, `end = 0`.
   - `edge_cases_covered`: empty input.
   - `why_this_is_Zig_derived`: `nextCodepoint` returns `-1` when `current >= len`; `next` maps `-1` to EOF.
   - `ambiguities_or_assumptions`: None.

2. **theorem packet**
   - `theorem_id`: `LEX_INIT_SINGLE_ASCII_IDENTIFIER`
   - `source_file`: `src/js_parser/lexer.zig`
   - `source_reference`: `next`, identifier branch
   - `statement`: A single ASCII identifier-start character lexes as an identifier unless it is a keyword.
   - `preconditions`: Source is one ASCII character in `_`, `$`, `a-z`, or `A-Z`.
   - `expected_behavior`: Token is `Keywords.get(raw)` if present, otherwise `t_identifier`; `identifier == raw`.
   - `edge_cases_covered`: singleton identifier input.
   - `why_this_is_Zig_derived`: ASCII identifier branch computes `latin1IdentifierContinueLength`, then assigns keyword-or-identifier.
   - `ambiguities_or_assumptions`: Keyword set comes from `lexer_tables.zig`.

3. **theorem packet**
   - `theorem_id`: `LEX_WHITESPACE_SKIPPED`
   - `source_file`: `src/js_parser/lexer.zig`
   - `source_reference`: `next`, whitespace branches; `isWhitespace`
   - `statement`: Horizontal and unusual whitespace are skipped before tokenization.
   - `preconditions`: Input begins with spaces, tabs, or code points accepted by `isWhitespace`.
   - `expected_behavior`: Lexer advances past them and returns the next non-whitespace token or EOF.
   - `edge_cases_covered`: leading whitespace, unusual Unicode whitespace.
   - `why_this_is_Zig_derived`: `next` continues after `'\t'`, `' '`, and `isWhitespace(code_point)`.
   - `ambiguities_or_assumptions`: Newline whitespace has additional newline-state behavior covered separately.

4. **theorem packet**
   - `theorem_id`: `LEX_NEWLINE_SKIPPED_AND_FLAGGED`
   - `source_file`: `src/js_parser/lexer.zig`
   - `source_reference`: `next`, newline branch; `step`
   - `statement`: Line terminators are skipped and set `has_newline_before = true`.
   - `preconditions`: Input before next token contains `\r`, `\n`, U+2028, or U+2029.
   - `expected_behavior`: Lexer skips the line terminator and reports the next token with `has_newline_before == true`.
   - `edge_cases_covered`: CR, LF, Unicode line separators.
   - `why_this_is_Zig_derived`: Newline branch sets `has_newline_before = true` and continues.
   - `ambiguities_or_assumptions`: `approximate_newline_count` only counts `\n`.

5. **theorem packet**
   - `theorem_id`: `LEX_PUNCTUATION_SINGLE_CHAR_TOKENS`
   - `source_file`: `src/js_parser/lexer.zig`
   - `source_reference`: `next`
   - `statement`: Single-character punctuation maps to its corresponding token.
   - `preconditions`: Current code point is one of `(`, `)`, `[`, `]`, `{`, `}`, `,`, `:`.
   - `expected_behavior`: Lexer consumes one code point and emits the corresponding token.
   - `edge_cases_covered`: singleton punctuation inputs.
   - `why_this_is_Zig_derived`: Each punctuation case calls `step()` and assigns the fixed token.
   - `ambiguities_or_assumptions`: JSON mode permits these tokens too.

6. **theorem packet**
   - `theorem_id`: `LEX_JSON_REJECTS_PRIVATE_IDENTIFIER`
   - `source_file`: `src/js_parser/lexer.zig`
   - `source_reference`: `next`, `'#'` branch
   - `statement`: In JSON mode, `#` causes an unsupported-syntax error.
   - `preconditions`: `is_json == true`, current code point is `#`.
   - `expected_behavior`: Returns syntax error with message “Private identifiers are not allowed in JSON”.
   - `edge_cases_covered`: JSON invalid token.
   - `why_this_is_Zig_derived`: JSON branch returns `addUnsupportedSyntaxError`.
   - `ambiguities_or_assumptions`: Exact observable error type is `Error.SyntaxError`.

7. **theorem packet**
   - `theorem_id`: `LEX_HASHBANG_AT_START`
   - `source_file`: `src/js_parser/lexer.zig`
   - `source_reference`: `next`, `'#'` branch
   - `statement`: `#!` at byte 0 lexes as a hashbang token through the end of the line or EOF.
   - `preconditions`: `is_json == false`, `start == 0`, source begins with `#!`.
   - `expected_behavior`: Token is `t_hashbang`; raw text spans from `#` through before newline/EOF.
   - `edge_cases_covered`: hashbang at EOF, hashbang before newline.
   - `why_this_is_Zig_derived`: Hashbang loop advances until line terminator or `-1`.
   - `ambiguities_or_assumptions`: Hashbang away from byte 0 is not treated as hashbang.

8. **theorem packet**
   - `theorem_id`: `LEX_PRIVATE_IDENTIFIER_VALID`
   - `source_file`: `src/js_parser/lexer.zig`
   - `source_reference`: `next`, `scanIdentifierWithEscapes`
   - `statement`: `#` followed by a valid identifier start/continue sequence lexes as `t_private_identifier`.
   - `preconditions`: `is_json == false`, current char is `#`, following text is valid identifier text or valid escaped identifier text.
   - `expected_behavior`: Token is `t_private_identifier`; `identifier` is the raw or decoded identifier contents.
   - `edge_cases_covered`: private identifier with escapes.
   - `why_this_is_Zig_derived`: Private branch validates start, scans continuation, then assigns token.
   - `ambiguities_or_assumptions`: For escaped private identifiers, decoded `identifier` may include leading `#` in `result.contents`; validation uses slice after `#`.

9. **theorem packet**
   - `theorem_id`: `LEX_PRIVATE_IDENTIFIER_INVALID_START`
   - `source_file`: `src/js_parser/lexer.zig`
   - `source_reference`: `next`, `'#'` branch
   - `statement`: `#` not followed by a valid identifier start causes syntax error.
   - `preconditions`: `is_json == false`, not hashbang, following code point is not identifier start and not escape sequence leading to valid identifier.
   - `expected_behavior`: Lexer returns `Error.SyntaxError`.
   - `edge_cases_covered`: bare `#`, `#1`, `#-`.
   - `why_this_is_Zig_derived`: Branch calls `syntaxError()` when `!isIdentifierStart`.
   - `ambiguities_or_assumptions`: Exact error message may be generic “Syntax Error”.

10. **theorem packet**
    - `theorem_id`: `LEX_JSON_REJECTS_SEMICOLON_DECORATOR_TILDE_OPERATORS`
    - `source_file`: `src/js_parser/lexer.zig`
    - `source_reference`: `next`
    - `statement`: JSON mode rejects semicolons, decorators, `~`, and most operators.
    - `preconditions`: `is_json == true`, current code point is `;`, `@`, `~`, `%`, `&`, `|`, `^`, `+`, compound `-`, `=`, `<`, `>`, or `!`.
    - `expected_behavior`: Lexer returns `Error.SyntaxError` via `addUnsupportedSyntaxError`.
    - `edge_cases_covered`: JSON invalid operators and syntax.
    - `why_this_is_Zig_derived`: Each listed branch has a JSON guard returning unsupported syntax.
    - `ambiguities_or_assumptions`: Plain `-` is not rejected here because JSON numbers may start with minus at parser level.

11. **theorem packet**
    - `theorem_id`: `LEX_QUESTION_FAMILY`
    - `source_file`: `src/js_parser/lexer.zig`
    - `source_reference`: `next`, `'?'` branch
    - `statement`: `?`, `??`, `??=`, and `?.` tokenize distinctly, with `?.` suppressed before decimal digits.
    - `preconditions`: Current code point is `?`.
    - `expected_behavior`: Emits `t_question`, `t_question_question`, `t_question_question_equals`, or `t_question_dot`; `?.` before digit remains `t_question`.
    - `edge_cases_covered`: `a?.1:b` disambiguation.
    - `why_this_is_Zig_derived`: Branch checks `?`, `=`, and lookahead after `.` to avoid numeric ambiguity.
    - `ambiguities_or_assumptions`: Parser later interprets the remaining `.`/digit.

12. **theorem packet**
    - `theorem_id`: `LEX_OPERATOR_COMPOUND_TOKENS`
    - `source_file`: `src/js_parser/lexer.zig`
    - `source_reference`: `next`
    - `statement`: JavaScript operator prefixes greedily produce their longest recognized token.
    - `preconditions`: `is_json == false`; current code point starts `%`, `&`, `|`, `^`, `+`, `-`, `*`, `/`, `=`, `<`, `>`, `!`.
    - `expected_behavior`: Emits corresponding single, assignment, doubled, tripled, or arrow/equality token as implemented.
    - `edge_cases_covered`: `&&=`, `||=`, `**=`, `===`, `!==`, `>>>=`, `<<=`.
    - `why_this_is_Zig_derived`: Nested switches consume additional characters before assigning token.
    - `ambiguities_or_assumptions`: Legacy HTML comment handling is split separately.

13. **theorem packet**
    - `theorem_id`: `LEX_HTML_CLOSE_COMMENT_AFTER_NEWLINE`
    - `source_file`: `src/js_parser/lexer.zig`
    - `source_reference`: `next`, `'-'` branch
    - `statement`: `-->` after a newline is treated as a legacy HTML single-line comment.
    - `preconditions`: `is_json == false`, current text is `-->`, `has_newline_before == true`.
    - `expected_behavior`: Lexer emits a warning, skips until line terminator or EOF, and continues scanning.
    - `edge_cases_covered`: comment to EOF, comment before newline.
    - `why_this_is_Zig_derived`: `--` branch checks `>` and `has_newline_before`, warns, then scans to line end.
    - `ambiguities_or_assumptions`: `-->` without `has_newline_before` lexes as `--` then `>`.

14. **theorem packet**
    - `theorem_id`: `LEX_HTML_OPEN_COMMENT_UNIMPLEMENTED`
    - `source_file`: `src/js_parser/lexer.zig`
    - `source_reference`: `next`, `'<'` branch
    - `statement`: `<!--` is recognized but terminates with unsupported-syntax error.
    - `preconditions`: `is_json == false`, current text begins `<!--`.
    - `expected_behavior`: Returns `Error.SyntaxError` with “Legacy HTML comments not implemented yet!”.
    - `edge_cases_covered`: unsupported legacy HTML open comment.
    - `why_this_is_Zig_derived`: `<` branch checks `!` plus `peek("--")`, then calls `addUnsupportedSyntaxError`.
    - `ambiguities_or_assumptions`: Unlike HTML close comment, this is not skipped.

15. **theorem packet**
    - `theorem_id`: `LEX_SINGLE_LINE_COMMENT_SKIPPED`
    - `source_file`: `src/js_parser/lexer.zig`
    - `source_reference`: `next`, `'/'` branch; `scanSingleLineComment`
    - `statement`: JavaScript single-line comments are skipped and do not emit tokens.
    - `preconditions`: `is_json == false`, current text begins `//`.
    - `expected_behavior`: Lexer advances to line terminator or EOF, scans comment annotations, then continues to next token.
    - `edge_cases_covered`: comment at EOF, comment before newline.
    - `why_this_is_Zig_derived`: `//` branch calls `scanSingleLineComment`, `scanCommentText(false)`, then `continue`.
    - `ambiguities_or_assumptions`: Comment preservation depends on flags covered separately.

16. **theorem packet**
    - `theorem_id`: `LEX_JSON_COMMENTS_FLAG`
    - `source_file`: `src/js_parser/lexer.zig`
    - `source_reference`: `next`, comment branches
    - `statement`: JSON comments are allowed only when `allow_comments == true`.
    - `preconditions`: `is_json == true`, current text begins `//` or `/*`.
    - `expected_behavior`: If `allow_comments == false`, add range error “JSON does not support comments” and return; otherwise skip comment and continue.
    - `edge_cases_covered`: JSON with comments, tsconfig-style comments.
    - `why_this_is_Zig_derived`: Comment branches check `if (!json.allow_comments)` after scanning.
    - `ambiguities_or_assumptions`: Error occurs after the comment body is scanned.

17. **theorem packet**
    - `theorem_id`: `LEX_MULTILINE_COMMENT_TERMINATION`
    - `source_file`: `src/js_parser/lexer.zig`
    - `source_reference`: `next`, multiline comment branch
    - `statement`: Multiline comments must terminate with `*/`.
    - `preconditions`: Current text begins `/*`.
    - `expected_behavior`: Lexer scans until `*/`; if EOF occurs first, returns syntax error “Expected \"*/\" to terminate multi-line comment”.
    - `edge_cases_covered`: unterminated block comment, newline inside block comment.
    - `why_this_is_Zig_derived`: Multiline loop errors on `-1` and sets newline flag on line terminators.
    - `ambiguities_or_assumptions`: SIMD skip path preserves same observable behavior.

18. **theorem packet**
    - `theorem_id`: `LEX_COMMENT_PRESERVATION`
    - `source_file`: `src/js_parser/lexer.zig`
    - `source_reference`: `scanCommentText`
    - `statement`: Legal annotation comments or preserve-all mode append comments to `comments_to_preserve_before`.
    - `preconditions`: Scanned comment text length > 2 with third byte `!`, or `preserve_all_comments_before == true`.
    - `expected_behavior`: Appends `js_ast.G.Comment{text, loc}`.
    - `edge_cases_covered`: `//!`, `/*!`, preserve-all comments.
    - `why_this_is_Zig_derived`: `scanCommentText` computes `has_legal_annotation` and appends under that condition.
    - `ambiguities_or_assumptions`: Multiline indentation removal is currently no-op.

19. **theorem packet**
    - `theorem_id`: `LEX_TRACK_COMMENTS_RECORDS_RANGES`
    - `source_file`: `src/js_parser/lexer.zig`
    - `source_reference`: `scanCommentText`
    - `statement`: When `track_comments` is enabled, every scanned comment range is recorded.
    - `preconditions`: `track_comments == true`, a comment was scanned.
    - `expected_behavior`: `all_comments` receives `lexer.range()`.
    - `edge_cases_covered`: single-line and multiline comments.
    - `why_this_is_Zig_derived`: First side effect in `scanCommentText` appends range when tracking.
    - `ambiguities_or_assumptions`: Allocation failure is treated as unreachable.

20. **theorem packet**
    - `theorem_id`: `LEX_PRAGMA_PURE`
    - `source_file`: `src/js_parser/lexer.zig`
    - `source_reference`: `scanPragma`, `scanCommentText`, `scanSingleLineComment`
    - `statement`: `@__PURE__` or `#__PURE__` with word boundary marks `has_pure_comment_before`.
    - `preconditions`: Non-JSON comment scanning reaches `@` or `#` followed by `__PURE__` with word boundary.
    - `expected_behavior`: `has_pure_comment_before == true`; consumed pragma length is `len("__PURE__")`.
    - `edge_cases_covered`: pragma in single-line or multiline comments.
    - `why_this_is_Zig_derived`: `scanPragma` checks `hasPrefixWithWordBoundary("__PURE__")`.
    - `ambiguities_or_assumptions`: Exact marker position depends on comment scanning.

21. **theorem packet**
    - `theorem_id`: `LEX_JSX_PRAGMA_SCAN`
    - `source_file`: `src/js_parser/lexer.zig`
    - `source_reference`: `scanPragma`, `PragmaArg.scan`
    - `statement`: JSX pragmas assign spans for `jsx`, `jsxFrag`, `jsxRuntime`, and `jsxImportSource`.
    - `preconditions`: Non-JSON comment contains `@jsx`, `@jsxFrag`, `@jsxRuntime`, or `@jsxImportSource` followed by whitespace and an argument.
    - `expected_behavior`: Corresponding field in `jsx_pragma` is set to scanned span text/range.
    - `edge_cases_covered`: comment pragmas with whitespace-delimited arguments.
    - `why_this_is_Zig_derived`: `scanPragma` delegates to `PragmaArg.scan(.skip_space_first, ...)`.
    - `ambiguities_or_assumptions`: `allow_newline` differs for single-line pragma scan vs multiline/full comment scan.

22. **theorem packet**
    - `theorem_id`: `LEX_SOURCE_MAPPING_URL_PRAGMA`
    - `source_file`: `src/js_parser/lexer.zig`
    - `source_reference`: `scanPragma`, `PragmaArg.scanSourceMappingURLValue`
    - `statement`: ` sourceMappingURL=` pragmas assign `source_mapping_url` to the following non-space/non-newline URL.
    - `preconditions`: Comment chunk starts with exact prefix `" sourceMappingURL="` and has at least one URL byte.
    - `expected_behavior`: `source_mapping_url` span text is bytes after prefix until first space/newline/non-ASCII delimiter or chunk end.
    - `edge_cases_covered`: source map URL at EOF, URL followed by whitespace.
    - `why_this_is_Zig_derived`: `scanSourceMappingURLValue` slices after prefix and stops at delimiter.
    - `ambiguities_or_assumptions`: Prefix includes a leading space.

23. **theorem packet**
    - `theorem_id`: `LEX_STRING_BASIC_QUOTES`
    - `source_file`: `src/js_parser/lexer.zig`
    - `source_reference`: `parseStringLiteral`, `parseStringLiteralInner`
    - `statement`: Single-quoted and double-quoted JavaScript strings lex as `t_string_literal`.
    - `preconditions`: Current code point is `'` or `"`, string terminates with matching quote.
    - `expected_behavior`: Token is `t_string_literal`; raw content excludes surrounding quotes.
    - `edge_cases_covered`: empty string `""` or `''`.
    - `why_this_is_Zig_derived`: `parseStringLiteral` sets token and computes `base = start + 1`, suffix length 1.
    - `ambiguities_or_assumptions`: Decoded value is produced later by `toEString`.

24. **theorem packet**
    - `theorem_id`: `LEX_STRING_UNTERMINATED`
    - `source_file`: `src/js_parser/lexer.zig`
    - `source_reference`: `parseStringLiteralInner`
    - `statement`: Quoted strings must terminate before EOF or unescaped newline.
    - `preconditions`: Quote is `'` or `"`, scan reaches EOF or line terminator before closing quote.
    - `expected_behavior`: Returns syntax error “Unterminated string literal”.
    - `edge_cases_covered`: EOF inside string, newline inside string.
    - `why_this_is_Zig_derived`: `-1`, `\r`, and `\n` branches error for non-template quotes.
    - `ambiguities_or_assumptions`: Backslash line continuations are allowed outside JSON.

25. **theorem packet**
    - `theorem_id`: `LEX_TEMPLATE_LITERAL_TOKENS`
    - `source_file`: `src/js_parser/lexer.zig`
    - `source_reference`: `parseStringLiteral`, `parseStringLiteralInner`, `rescanCloseBraceAsTemplateToken`
    - `statement`: Template literals produce no-substitution, head, middle, or tail tokens depending on `${` and rescan state.
    - `preconditions`: Current code point is backtick or `rescan_close_brace_as_template_token == true`.
    - `expected_behavior`: No `${` yields `t_no_substitution_template_literal`; `${` yields `t_template_head` or `t_template_middle`; rescan tail yields `t_template_tail`.
    - `edge_cases_covered`: empty template, template interpolation, close-brace rescan.
    - `why_this_is_Zig_derived`: Template branch sets token by `rescan_close_brace_as_template_token`; `${` updates suffix length and token.
    - `ambiguities_or_assumptions`: Parser controls when `rescanCloseBraceAsTemplateToken` is called.

26. **theorem packet**
    - `theorem_id`: `LEX_JSON_SINGLE_QUOTES_CONDITIONAL_ERROR`
    - `source_file`: `src/js_parser/lexer.zig`
    - `source_reference`: `parseStringLiteral`
    - `statement`: JSON single-quoted strings are rejected when `FeatureFlags.allow_json_single_quotes` is false.
    - `preconditions`: `is_json == true`, quote is `'`, feature flag disabled.
    - `expected_behavior`: Adds range error “JSON strings must use double quotes”.
    - `edge_cases_covered`: JSON single-quote string.
    - `why_this_is_Zig_derived`: `parseStringLiteral` checks quote and feature flag after parsing.
    - `ambiguities_or_assumptions`: Behavior changes if compile-time feature flag is enabled.

27. **theorem packet**
    - `theorem_id`: `LEX_JSON_STRING_CONTROL_CHAR_ERROR`
    - `source_file`: `src/js_parser/lexer.zig`
    - `source_reference`: `parseStringLiteralInner`
    - `statement`: JSON strings reject unescaped control characters below U+0020.
    - `preconditions`: `is_json == true`, string body contains raw code point `< 0x20`.
    - `expected_behavior`: Returns syntax error.
    - `edge_cases_covered`: NUL/control characters in JSON strings.
    - `why_this_is_Zig_derived`: String inner loop checks `is_json and code_point < 0x20`.
    - `ambiguities_or_assumptions`: Newline-specific errors may be “Unterminated string literal”.

28. **theorem packet**
    - `theorem_id`: `LEX_ESCAPE_STANDARD_SINGLE_CHAR`
    - `source_file`: `src/js_parser/lexer.zig`
    - `source_reference`: `decodeEscapeSequences`
    - `statement`: Standard escapes decode to their fixed UTF-16 code units.
    - `preconditions`: Decoding string content contains `\b`, `\f`, `\n`, `\v`, `\t`, or `\r`.
    - `expected_behavior`: Appends `0x08`, `0x0C`, `0x0A`, `0x0B`, `0x09`, or `0x0D` respectively.
    - `edge_cases_covered`: vertical tab allowed even though invalid JSON comment notes.
    - `why_this_is_Zig_derived`: Escape switch appends corresponding values.
    - `ambiguities_or_assumptions`: JSON mode currently allows `\v` because JSON error code is commented out.

29. **theorem packet**
    - `theorem_id`: `LEX_ESCAPE_LINE_CONTINUATION`
    - `source_file`: `src/js_parser/lexer.zig`
    - `source_reference`: `decodeEscapeSequences`, `parseStringLiteralInner`
    - `statement`: JavaScript backslash-newline line continuations are ignored, with CRLF treated as one newline.
    - `preconditions`: `is_json == false`, decoded content contains backslash followed by `\r`, `\r\n`, `\n`, U+2028, or U+2029.
    - `expected_behavior`: No code unit is appended for the continuation.
    - `edge_cases_covered`: Windows CRLF continuation.
    - `why_this_is_Zig_derived`: Escape newline branches `continue` without appending; CR branch consumes optional LF.
    - `ambiguities_or_assumptions`: JSON mode errors on these continuations.

30. **theorem packet**
    - `theorem_id`: `LEX_ESCAPE_HEX_FIXED`
    - `source_file`: `src/js_parser/lexer.zig`
    - `source_reference`: `decodeEscapeSequences`
    - `statement`: `\xHH` escapes require exactly two hex digits and decode to one code unit.
    - `preconditions`: Decoding encounters `\x`.
    - `expected_behavior`: If two hex digits follow, append decoded value; otherwise syntax error at invalid digit/EOF.
    - `edge_cases_covered`: incomplete hex escape, invalid hex digit.
    - `why_this_is_Zig_derived`: Two sequential hex parses return `syntaxError()` on failure.
    - `ambiguities_or_assumptions`: None.

31. **theorem packet**
    - `theorem_id`: `LEX_ESCAPE_UNICODE_FIXED`
    - `source_file`: `src/js_parser/lexer.zig`
    - `source_reference`: `decodeEscapeSequences`
    - `statement`: `\uHHHH` escapes require four hex digits and decode to one code unit.
    - `preconditions`: Decoding encounters `\u` not followed by `{`.
    - `expected_behavior`: Four valid hex digits produce truncated code point as UTF-16; invalid/missing digit returns syntax error.
    - `edge_cases_covered`: incomplete Unicode escape.
    - `why_this_is_Zig_derived`: Fixed-length loop runs exactly four hex digit checks.
    - `ambiguities_or_assumptions`: Surrogate validation is not performed here.

32. **theorem packet**
    - `theorem_id`: `LEX_ESCAPE_UNICODE_VARIABLE`
    - `source_file`: `src/js_parser/lexer.zig`
    - `source_reference`: `decodeEscapeSequences`
    - `statement`: `\u{...}` escapes decode variable-length hex code points outside JSON.
    - `preconditions`: `is_json == false`, escape is `\u{hex+}`.
    - `expected_behavior`: Valid non-empty hex ending in `}` decodes to one UTF-16 code unit or surrogate pair; empty, invalid, unterminated, or > U+10FFFF errors.
    - `edge_cases_covered`: empty braces, out-of-range code point, astral code point.
    - `why_this_is_Zig_derived`: Variable-length branch tracks `is_first`, invalid chars, and `is_out_of_range`.
    - `ambiguities_or_assumptions`: In JSON mode this path first raises syntax error.

33. **theorem packet**
    - `theorem_id`: `LEX_ESCAPE_LEGACY_OCTAL`
    - `source_file`: `src/js_parser/lexer.zig`
    - `source_reference`: `decodeEscapeSequences`
    - `statement`: Legacy octal escapes decode 1–3 octal digits outside JSON, with invalid `8`/`9` continuation reporting range error.
    - `preconditions`: `is_json == false`, escape begins `\0` through `\7`.
    - `expected_behavior`: Decodes value under 256; invalid continuation adds “Invalid legacy octal literal”.
    - `edge_cases_covered`: `\0`, three-digit octal, out-of-range third digit.
    - `why_this_is_Zig_derived`: Octal branch accumulates up to three digits and records `is_bad`.
    - `ambiguities_or_assumptions`: JSON mode errors immediately.

34. **theorem packet**
    - `theorem_id`: `LEX_JSON_ESCAPE_RESTRICTIONS`
    - `source_file`: `src/js_parser/lexer.zig`
    - `source_reference`: `decodeEscapeSequences`
    - `statement`: JSON mode only accepts unrecognized escape fallthrough for `"`, `\`, and `/`; other fallthrough escapes error.
    - `preconditions`: `is_json == true`, escape does not match known JSON-compatible branches.
    - `expected_behavior`: `"`, `\`, `/` decode to themselves; other escaped characters cause syntax error.
    - `edge_cases_covered`: `\/`, invalid JSON escape.
    - `why_this_is_Zig_derived`: Final escape `else` switch permits only `"`, `\\`, `/` in JSON.
    - `ambiguities_or_assumptions`: Some non-standard escapes have earlier branches.

35. **theorem packet**
    - `theorem_id`: `LEX_JSON_IGNORE_LEADING_ESCAPE_SEQUENCES`
    - `source_file`: `src/js_parser/lexer.zig`
    - `source_reference`: `next`, `'\\'` branch
    - `statement`: JSON mode can skip leading escape sequences when configured.
    - `preconditions`: `is_json == true`, `ignore_leading_escape_sequences == true`, current char is `\`, and `start == 0` or `current == source.len - 1`.
    - `expected_behavior`: Lexer consumes the backslash and continues scanning instead of treating it as identifier escape.
    - `edge_cases_covered`: escaped JSON-in-JSON boundaries.
    - `why_this_is_Zig_derived`: Backslash branch has this compile-time JSON option guard.
    - `ambiguities_or_assumptions`: This is intended for unusual JSON-in-JSON parsing.

36. **theorem packet**
    - `theorem_id`: `LEX_JSON_IGNORE_TRAILING_ESCAPE_SEQUENCE_IN_STRING`
    - `source_file`: `src/js_parser/lexer.zig`
    - `source_reference`: `parseStringLiteralInner`
    - `statement`: JSON mode can treat a trailing escaped quote at EOF as string termination.
    - `preconditions`: `is_json == true`, `ignore_trailing_escape_sequences == true`, string sees `\` followed by the quote and `current >= source.len`.
    - `expected_behavior`: Lexer steps over quote and terminates string.
    - `edge_cases_covered`: JSON-in-JSON trailing escaped quote.
    - `why_this_is_Zig_derived`: Escape branch checks this option before normal escape handling.
    - `ambiguities_or_assumptions`: Applies only when quote matches the string delimiter.

37. **theorem packet**
    - `theorem_id`: `LEX_IDENTIFIER_ESCAPES_VALIDATION`
    - `source_file`: `src/js_parser/lexer.zig`
    - `source_reference`: `scanIdentifierWithEscapes`
    - `statement`: Identifier escape scanning only accepts Unicode escape sequences and validates decoded identifier text.
    - `preconditions`: Identifier scan enters escape path.
    - `expected_behavior`: Non-`\u` escape errors; malformed Unicode escape errors; decoded text not satisfying `isIdentifier` adds range error.
    - `edge_cases_covered`: escaped keyword, invalid escaped identifier, private escaped identifier.
    - `why_this_is_Zig_derived`: First pass requires `\u`; second pass decodes and validates identifier.
    - `ambiguities_or_assumptions`: Escaped keywords become `t_escaped_keyword`, not real keyword tokens.

38. **theorem packet**
    - `theorem_id`: `LEX_ESCAPED_KEYWORD_TOKEN`
    - `source_file`: `src/js_parser/lexer.zig`
    - `source_reference`: `scanIdentifierWithEscapes`
    - `statement`: Decoded escaped keywords lex as `t_escaped_keyword`.
    - `preconditions`: Escaped identifier decodes to text present in `Keywords`.
    - `expected_behavior`: `result.token == t_escaped_keyword`; `identifier == decoded contents`.
    - `edge_cases_covered`: `\u0076\u0061\u0072`.
    - `why_this_is_Zig_derived`: Final assignment checks `Keywords.has(result.contents)`.
    - `ambiguities_or_assumptions`: Parser decides where escaped keywords are allowed.

39. **theorem packet**
    - `theorem_id`: `LEX_DOT_AND_ELLIPSIS`
    - `source_file`: `src/js_parser/lexer.zig`
    - `source_reference`: `parseNumericLiteralOrDot`
    - `statement`: `.` not followed by a digit lexes as `t_dot`, except `...` lexes as `t_dot_dot_dot`.
    - `preconditions`: Current code point is `.` and next code point is not decimal digit.
    - `expected_behavior`: Emits `t_dot` or `t_dot_dot_dot`.
    - `edge_cases_covered`: singleton `.`, ellipsis.
    - `why_this_is_Zig_derived`: Dot branch checks next digit and two-dot lookahead.
    - `ambiguities_or_assumptions`: `.5` is numeric, covered separately.

40. **theorem packet**
    - `theorem_id`: `LEX_NUMERIC_DECIMAL_INTEGER_FAST_PATH`
    - `source_file`: `src/js_parser/lexer.zig`
    - `source_reference`: `parseNumericLiteralOrDot`
    - `statement`: Short decimal integer literals without dot/exponent parse to numeric token and exact f64 integer value.
    - `preconditions`: Decimal literal, no separators, no dot/exponent, raw length `< 10`.
    - `expected_behavior`: Token `t_numeric_literal`; `number` equals parsed unsigned 32-bit decimal value as f64.
    - `edge_cases_covered`: `0`, singleton digit, boundary length 9.
    - `why_this_is_Zig_derived`: Fast path loops over text into `u32`.
    - `ambiguities_or_assumptions`: Longer values use `bun.parseDouble`.

41. **theorem packet**
    - `theorem_id`: `LEX_NUMERIC_BASE_PREFIXES`
    - `source_file`: `src/js_parser/lexer.zig`
    - `source_reference`: `parseNumericLiteralOrDot`
    - `statement`: `0b`, `0o`, and `0x` parse binary, octal, and hexadecimal integer literals.
    - `preconditions`: Current literal begins with `0b/B`, `0o/O`, or `0x/X` and has valid digits.
    - `expected_behavior`: Token `t_numeric_literal`; `number` accumulates in base 2, 8, or 16.
    - `edge_cases_covered`: missing first digit after prefix, invalid digit for base.
    - `why_this_is_Zig_derived`: Base switch sets base and integer loop validates digits.
    - `ambiguities_or_assumptions`: Missing/invalid digit returns syntax error.

42. **theorem packet**
    - `theorem_id`: `LEX_NUMERIC_LEGACY_OCTAL`
    - `source_file`: `src/js_parser/lexer.zig`
    - `source_reference`: `parseNumericLiteralOrDot`
    - `statement`: Decimal-looking literals starting `0` followed by `0-7` or `_` are marked legacy octal.
    - `preconditions`: First char `0`, next char `0-7` or `_`.
    - `expected_behavior`: `is_legacy_octal_literal == true`, base 8 scan is used; invalid `8`/`9` later triggers decimal parse fallback path.
    - `edge_cases_covered`: `077`, `08`, `09`.
    - `why_this_is_Zig_derived`: Prefix switch sets base 8 and legacy flag.
    - `ambiguities_or_assumptions`: Strict-mode validity is likely enforced elsewhere.

43. **theorem packet**
    - `theorem_id`: `LEX_NUMERIC_SEPARATORS`
    - `source_file`: `src/js_parser/lexer.zig`
    - `source_reference`: `parseNumericLiteralOrDot`
    - `statement`: Numeric separators `_` are allowed only between digits in permitted positions.
    - `preconditions`: Numeric literal contains `_`.
    - `expected_behavior`: Consecutive underscores, leading underscore after base prefix/legacy octal, underscore immediately after decimal point, or trailing underscore cause syntax error.
    - `edge_cases_covered`: `1__2`, `1_`, `0x_1`, `1._2`.
    - `why_this_is_Zig_derived`: `lastUnderscoreEnd`, `isFirst`, and end checks enforce placement.
    - `ambiguities_or_assumptions`: Exact allowed positions differ by integer/fraction/exponent branches.

44. **theorem packet**
    - `theorem_id`: `LEX_NUMERIC_FLOAT_EXPONENT`
    - `source_file`: `src/js_parser/lexer.zig`
    - `source_reference`: `parseNumericLiteralOrDot`
    - `statement`: Decimal floats with dot or exponent parse as numeric literals and set `hasDotOrExponent`.
    - `preconditions`: Decimal literal contains fractional dot or `e/E` exponent.
    - `expected_behavior`: Token `t_numeric_literal`; numeric value parsed with `bun.parseDouble` after removing separators.
    - `edge_cases_covered`: `.5`, `1.`, `1e2`, `1e+2`, missing exponent digits.
    - `why_this_is_Zig_derived`: Floating branch scans fractional and exponent parts then parses double.
    - `ambiguities_or_assumptions`: `1e` and `1e+` are syntax errors.

45. **theorem packet**
    - `theorem_id`: `LEX_BIGINT_LITERAL`
    - `source_file`: `src/js_parser/lexer.zig`
    - `source_reference`: `parseNumericLiteralOrDot`
    - `statement`: Integer literals followed by `n` lex as `t_big_integer_literal`.
    - `preconditions`: Numeric literal has no dot or exponent and current code point after digits is `n`.
    - `expected_behavior`: Token becomes `t_big_integer_literal`; lexer consumes `n`; `identifier` stores raw bigint text before `n`.
    - `edge_cases_covered`: `0n`, `123n`, `0xFFn`.
    - `why_this_is_Zig_derived`: Final bigint handling checks `code_point == 'n' and !hasDotOrExponent`.
    - `ambiguities_or_assumptions`: Legacy octal bigint and leading-zero decimal bigint error earlier.

46. **theorem packet**
    - `theorem_id`: `LEX_NUMBER_FOLLOWED_BY_IDENTIFIER_ERROR`
    - `source_file`: `src/js_parser/lexer.zig`
    - `source_reference`: `parseNumericLiteralOrDot`
    - `statement`: Identifier starts cannot immediately follow numeric literals.
    - `preconditions`: After numeric literal scan, `isIdentifierStart(code_point) == true`.
    - `expected_behavior`: Returns syntax error.
    - `edge_cases_covered`: `123abc`, `1_2foo`.
    - `why_this_is_Zig_derived`: Final check calls `syntaxError()`.
    - `ambiguities_or_assumptions`: Bigint suffix `n` is handled before this check.

47. **theorem packet**
    - `theorem_id`: `LEX_REGEXP_VALID_FLAGS`
    - `source_file`: `src/js_parser/lexer.zig`
    - `source_reference`: `scanRegExp`
    - `statement`: Regular-expression flags may be `d`, `g`, `i`, `m`, `s`, `u`, `v`, or `y`.
    - `preconditions`: Non-JSON lexer scans a regexp and reaches closing `/` followed by identifier-continue flag chars.
    - `expected_behavior`: Valid flags are consumed; `regex_flags_start` is set to offset of first valid flag.
    - `edge_cases_covered`: no flags, single flag, multiple valid flags.
    - `why_this_is_Zig_derived`: Flag loop switch permits exactly those characters.
    - `ambiguities_or_assumptions`: Regex body syntax is only lightly validated here.

48. **theorem packet**
    - `theorem_id`: `LEX_REGEXP_INVALID_FLAG`
    - `source_file`: `src/js_parser/lexer.zig`
    - `source_reference`: `scanRegExp`
    - `statement`: Identifier-continue regexp flags outside the valid set add an invalid-flag error but are still consumed.
    - `preconditions`: Regexp flag loop sees identifier-continue char not in `dgimsuvy`.
    - `expected_behavior`: Adds error `Invalid flag "{u}" in regular expression`; advances over the flag.
    - `edge_cases_covered`: invalid flag termination behavior.
    - `why_this_is_Zig_derived`: Flag loop `else` branch calls `addError` then `step()`.
    - `ambiguities_or_assumptions`: Function does not immediately return error from `addError`.

49. **theorem packet**
    - `theorem_id`: `LEX_REGEXP_DUPLICATE_FLAG`
    - `source_file`: `src/js_parser/lexer.zig`
    - `source_reference`: `scanRegExp`
    - `statement`: Duplicate regexp flags add duplicate-flag errors.
    - `preconditions`: Valid regexp flag appears more than once.
    - `expected_behavior`: Adds error `Duplicate flag "{u}" in regular expression`; continues scanning.
    - `edge_cases_covered`: repeated valid flags.
    - `why_this_is_Zig_derived`: Bitset detects already-set flag and calls `addError`.
    - `ambiguities_or_assumptions`: Duplicate detection key uses computed bit index from flag char.

50. **theorem packet**
    - `theorem_id`: `LEX_REGEXP_BODY_TERMINATION`
    - `source_file`: `src/js_parser/lexer.zig`
    - `source_reference`: `scanRegExp`, `scanRegExpValidateAndStep`
    - `statement`: Regexp bodies terminate at unescaped `/`; newlines or EOF before termination are syntax errors.
    - `preconditions`: Non-JSON lexer is scanning regexp body.
    - `expected_behavior`: Escaped chars are skipped; character classes scan until `]`; newline/EOF causes syntax error.
    - `edge_cases_covered`: escaped slash, char class, unterminated regex, newline in regex.
    - `why_this_is_Zig_derived`: Main loop checks `/` and `[`, validator errors on line terminators and `-1`.
    - `ambiguities_or_assumptions`: Nested character class semantics are not fully parsed here.

51. **theorem packet**
    - `theorem_id`: `LEX_JSX_ELEMENT_BASIC_TOKENS`
    - `source_file`: `src/js_parser/lexer.zig`
    - `source_reference`: `nextInsideJSXElement`
    - `statement`: Inside JSX element tags, a restricted token set is recognized.
    - `preconditions`: Non-JSON lexer in JSX element tag context.
    - `expected_behavior`: Recognizes `.`, `=`, `{`, `}`, `<`, `>`, `/`, quoted strings, and identifiers; skips whitespace/comments.
    - `edge_cases_covered`: JSX tag syntax.
    - `why_this_is_Zig_derived`: `nextInsideJSXElement` has dedicated token switch.
    - `ambiguities_or_assumptions`: JSON mode compile-errors/unreachable via `assertNotJSON`.

52. **theorem packet**
    - `theorem_id`: `LEX_JSX_IDENTIFIER_HYPHEN_NAMESPACE`
    - `source_file`: `src/js_parser/lexer.zig`
    - `source_reference`: `nextInsideJSXElement`
    - `statement`: JSX identifiers may contain hyphens and optionally one namespace separator followed by another identifier.
    - `preconditions`: JSX tag scan starts at identifier start.
    - `expected_behavior`: Continues over identifier parts and `-`; if `:` appears, requires identifier start after it or errors.
    - `edge_cases_covered`: `foo-bar`, `ns:name`, `ns:`.
    - `why_this_is_Zig_derived`: JSX identifier loop includes `lexer.code_point == '-'`; namespace branch validates after `:`.
    - `ambiguities_or_assumptions`: Namespaced JSX names are represented as string identifiers.

53. **theorem packet**
    - `theorem_id`: `LEX_JSX_STRING_LITERAL`
    - `source_file`: `src/js_parser/lexer.zig`
    - `source_reference`: `parseJSXStringLiteral`
    - `statement`: JSX quoted attribute strings lex as `t_string_literal`, with entity/whitespace decoding when needed.
    - `preconditions`: JSX element context sees `'` or `"`.
    - `expected_behavior`: Token is `t_string_literal`; raw content excludes quotes; if content has `&`, selected backslash cases, or non-ASCII, output is UTF-16 decoded, otherwise ASCII raw.
    - `edge_cases_covered`: empty JSX string, entity string, non-ASCII string.
    - `why_this_is_Zig_derived`: `parseJSXStringLiteral` tracks `needs_decode` and calls `fixWhitespaceAndDecodeJSXEntities`.
    - `ambiguities_or_assumptions`: JSX backslashes do not perform normal JS escaping.

54. **theorem packet**
    - `theorem_id`: `LEX_JSX_BACKSLASH_QUOTE_RANGE`
    - `source_file`: `src/js_parser/lexer.zig`
    - `source_reference`: `parseJSXStringLiteral`
    - `statement`: A backslash before a JSX string quote records `previous_backslash_quote_in_jsx`.
    - `preconditions`: JSX string contains `\` immediately before the terminating quote.
    - `expected_behavior`: `previous_backslash_quote_in_jsx` is set to range covering backslash and quote.
    - `edge_cases_covered`: JSX escaped-looking quote.
    - `why_this_is_Zig_derived`: On quote, if `backslash.len > 0`, range length is incremented and stored.
    - `ambiguities_or_assumptions`: This records diagnostics state; it does not escape the quote.

55. **theorem packet**
    - `theorem_id`: `LEX_JSX_CHILD_TEXT`
    - `source_file`: `src/js_parser/lexer.zig`
    - `source_reference`: `nextJSXElementChild`
    - `statement`: JSX child text lexes as a string literal until `{`, `<`, or EOF/error.
    - `preconditions`: Non-JSON lexer in JSX child context, current code point is not `{` or `<`.
    - `expected_behavior`: Emits `t_string_literal`; raw span starts at original child start and ends before `{`/`<`.
    - `edge_cases_covered`: text child before expression, text child before nested element.
    - `why_this_is_Zig_derived`: Child scanner loops until `{` or `<`, then assigns string token.
    - `ambiguities_or_assumptions`: EOF inside child text causes syntax error.

56. **theorem packet**
    - `theorem_id`: `LEX_JSX_CHILD_WHITESPACE_ONLY_SKIPPED_AFTER_FIX`
    - `source_file`: `src/js_parser/lexer.zig`
    - `source_reference`: `nextJSXElementChild`, `fixWhitespaceAndDecodeJSXEntities`
    - `statement`: JSX child text that decodes to empty after whitespace fixing is skipped and marks newline-before.
    - `preconditions`: JSX child text requires fixing and decoded UTF-16 buffer ends empty.
    - `expected_behavior`: `has_newline_before = true`; scanner continues to next child token.
    - `edge_cases_covered`: whitespace-only JSX child lines.
    - `why_this_is_Zig_derived`: After fixing, if `temp_buffer_u16.items.len == 0`, branch sets newline flag and continues.
    - `ambiguities_or_assumptions`: Only applies when `needs_fixing == true`.

57. **theorem packet**
    - `theorem_id`: `LEX_JSX_ENTITY_NUMERIC`
    - `source_file`: `src/js_parser/lexer.zig`
    - `source_reference`: `maybeDecodeJSXEntity`, `decodeJSXEntities`
    - `statement`: JSX numeric entities decode decimal `&#...;` or lowercase-hex `&#x...;`.
    - `preconditions`: Text contains `&` followed before `;` by entity beginning `#`.
    - `expected_behavior`: Parsed integer replaces cursor code point; invalid or overflow records error and uses replacement char.
    - `edge_cases_covered`: decimal entity, hex entity, invalid numeric entity, overflow.
    - `why_this_is_Zig_derived`: Entity branch parses with base 10 or 16 and catches parse errors.
    - `ambiguities_or_assumptions`: Uppercase `X` is not accepted for hex.

58. **theorem packet**
    - `theorem_id`: `LEX_JSX_ENTITY_NAMED`
    - `source_file`: `src/js_parser/lexer.zig`
    - `source_reference`: `maybeDecodeJSXEntity`, `decodeJSXEntities`
    - `statement`: JSX named entities decode only if present in `tables.jsxEntity`.
    - `preconditions`: Text contains `&name;`.
    - `expected_behavior`: If table has `name`, append mapped code point; otherwise leaves `&` and following text to normal iteration.
    - `edge_cases_covered`: known entity, unknown entity.
    - `why_this_is_Zig_derived`: Named branch checks `tables.jsxEntity.get(entity)`.
    - `ambiguities_or_assumptions`: Exact entity set comes from `lexer_tables.zig`.

59. **theorem packet**
    - `theorem_id`: `LEX_RAW_TEMPLATE_CR_NORMALIZATION`
    - `source_file`: `src/js_parser/lexer.zig`
    - `source_reference`: `rawTemplateContents`
    - `statement`: Raw template contents normalize CR and CRLF to LF.
    - `preconditions`: Current token is template literal/head/middle/tail and raw slice contains `\r`.
    - `expected_behavior`: Returns a copied slice where `\r\n` and lone `\r` become `\n`.
    - `edge_cases_covered`: Windows newlines in template raw content.
    - `why_this_is_Zig_derived`: Loop consumes optional LF after CR and writes LF.
    - `ambiguities_or_assumptions`: If no CR exists, original slice is returned.

60. **theorem packet**
    - `theorem_id`: `LEX_EXPECT_LESS_THAN_SPLITS_COMPOUND`
    - `source_file`: `src/js_parser/lexer.zig`
    - `source_reference`: `expectLessThan`
    - `statement`: Expecting `<` can split compound less-than tokens by mutating current token/start.
    - `preconditions`: Current token is `t_less_than_equals`, `t_less_than_less_than`, or `t_less_than_less_than_equals`.
    - `expected_behavior`: Converts to remaining token after consuming one leading `<`: `=`, `<`, or `<=` respectively, with `start += 1`.
    - `edge_cases_covered`: parser-driven token splitting for TS/JSX ambiguity.
    - `why_this_is_Zig_derived`: `expectLessThan` explicitly rewrites tokens instead of advancing.
    - `ambiguities_or_assumptions`: Parser calls this in contexts expecting `<`.

61. **theorem packet**
    - `theorem_id`: `LEX_EXPECT_GREATER_THAN_SPLITS_COMPOUND`
    - `source_file`: `src/js_parser/lexer.zig`
    - `source_reference`: `expectGreaterThan`
    - `statement`: Expecting `>` can split compound greater-than tokens by mutating current token/start.
    - `preconditions`: Current token is `>=`, `>>=`, `>>>=`, `>>`, or `>>>`.
    - `expected_behavior`: Converts to remaining token after consuming one leading `>` with `start += 1`.
    - `edge_cases_covered`: nested generic/type closing ambiguity.
    - `why_this_is_Zig_derived`: `expectGreaterThan` explicitly rewrites tokens.
    - `ambiguities_or_assumptions`: Parser controls repeated splitting.

62. **theorem packet**
    - `theorem_id`: `LEX_RESTORE_PRESERVES_ALLOCATED_BUFFERS`
    - `source_file`: `src/js_parser/lexer.zig`
    - `source_reference`: `restore`
    - `statement`: Restoring lexer state copies scalar state but preserves current array-list backing storage.
    - `preconditions`: `this.restore(original)` called; both lexers have compatible comment/temp buffers.
    - `expected_behavior`: `this.*` equals `original.*` except `all_comments`, `comments_to_preserve_before`, and `temp_buffer_u16` keep `this`’s list objects with lengths reset to original lengths.
    - `edge_cases_covered`: parser backtracking state restore.
    - `why_this_is_Zig_derived`: Function saves lists, assigns `this.* = original.*`, then restores list fields and lengths.
    - `ambiguities_or_assumptions`: Debug assertions enforce capacity/empty temp buffer assumptions.

63. **theorem packet**
    - `theorem_id`: `LEX_ERROR_DEDUP_BY_LOCATION`
    - `source_file`: `src/js_parser/lexer.zig`
    - `source_reference`: `addError`, `addRangeError`, `addRangeErrorWithNotes`
    - `statement`: Repeated errors at the same location are suppressed.
    - `preconditions`: `prev_error_loc` equals the location of the new error/range.
    - `expected_behavior`: No new log entry is added.
    - `edge_cases_covered`: duplicate diagnostic prevention.
    - `why_this_is_Zig_derived`: Error helpers return early when locations match.
    - `ambiguities_or_assumptions`: Disabled logging also suppresses errors.

64. **theorem packet**
    - `theorem_id`: `LEX_LOG_DISABLED_SUPPRESSES_ERRORS`
    - `source_file`: `src/js_parser/lexer.zig`
    - `source_reference`: `addError`, `addRangeError`, `expected`
    - `statement`: When logging is disabled, diagnostic helpers do not add log entries, and `expected` returns backtrack.
    - `preconditions`: `is_log_disabled == true`.
    - `expected_behavior`: `addError`/range helpers return without logging; `expected` returns `error.Backtrack`.
    - `edge_cases_covered`: parser speculative parsing/backtracking.
    - `why_this_is_Zig_derived`: Guards at start of helpers check `is_log_disabled`.
    - `ambiguities_or_assumptions`: Other functions may still return syntax errors after suppressed logging.

65. **theorem packet**
    - `theorem_id`: `LEX_IDENTIFIER_HELPERS_EMPTY_FALSE`
    - `source_file`: `src/js_parser/lexer.zig`
    - `source_reference`: `isIdentifier`, `isIdentifierUTF16`, `isLatin1Identifier`
    - `statement`: Identifier helper predicates reject empty input.
    - `preconditions`: Input slice length is zero.
    - `expected_behavior`: Predicate returns `false`.
    - `edge_cases_covered`: empty identifier input.
    - `why_this_is_Zig_derived`: Each helper has an initial length-zero check.
    - `ambiguities_or_assumptions`: None.
