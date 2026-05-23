1. `theorem_id`: `TOML_EMPTY_SOURCE_RETURNS_EMPTY_OBJECT`
   - `source_file`: `src/parsers/toml.zig`
   - `source_reference`: `TOML.parse`, lines 123-128
   - `statement`: Parsing an empty source returns an empty object expression without initializing the lexer.
   - `preconditions`: `source.contents.len == 0`; any allocator/log/redact flag.
   - `expected_behavior`: Result is `Expr` with object data and no properties; loc start is `0`; no syntax error is produced by parser control flow.
   - `edge_cases_covered`: Empty input; no-flag behavior; `redact_logs` true/false irrelevant.
   - `why_this_is_Zig_derived`: Zig has an explicit early return for zero-length contents.
   - `ambiguities_or_assumptions`: Assumes “empty object” is observable in the Dafny model.

2. `theorem_id`: `TOML_WHITESPACE_OR_COMMENTS_ONLY_RETURNS_EMPTY_OBJECT`
   - `source_file`: `src/parsers/toml.zig`, `src/parsers/toml/lexer.zig`
   - `source_reference`: `runParser` lines 137-149; `Lexer.next` lines 512-533, 609-624
   - `statement`: Parsing only whitespace/newlines and `#` comments returns an empty root object.
   - `preconditions`: Nonempty source contains only spaces, tabs, line terminators, and `#...` comments.
   - `expected_behavior`: Lexer reaches EOF; parser returns root object with no properties.
   - `edge_cases_covered`: Whitespace-only input; comments-only input; EOF after comment.
   - `why_this_is_Zig_derived`: Lexer skips whitespace/comments; parser returns root on `t_end_of_file`.
   - `ambiguities_or_assumptions`: Does not cover semicolon comments.

3. `theorem_id`: `TOML_SEMICOLON_COMMENT_ONLY_AT_LINE_START_IS_SKIPPED`
   - `source_file`: `src/parsers/toml/lexer.zig`
   - `source_reference`: `Lexer.next`, lines 588-607
   - `statement`: A semicolon starts a comment only when `has_newline_before` is true.
   - `preconditions`: Current token scan sees `;` and `has_newline_before == true`.
   - `expected_behavior`: Lexer skips until line break or EOF and continues scanning.
   - `edge_cases_covered`: File begins with semicolon; semicolon after newline.
   - `why_this_is_Zig_derived`: Zig checks `if (lexer.has_newline_before)` before skipping a semicolon comment.
   - `ambiguities_or_assumptions`: `has_newline_before` at file start is true because `lexer.end == 0`.

4. `theorem_id`: `TOML_SEMICOLON_INLINE_IS_SYNTAX_ERROR`
   - `source_file`: `src/parsers/toml/lexer.zig`
   - `source_reference`: `Lexer.next`, lines 588-607
   - `statement`: A semicolon not preceded by a newline boundary is invalid.
   - `preconditions`: Lexer sees `;` with `has_newline_before == false`.
   - `expected_behavior`: Parser terminates with `SyntaxError`; log receives `"Unexpected semicolon"`.
   - `edge_cases_covered`: Inline semicolon after assignment/value.
   - `why_this_is_Zig_derived`: Zig calls `addDefaultError("Unexpected semicolon")` in the non-newline branch.
   - `ambiguities_or_assumptions`: Exact propagation type may be modeled generically as parse failure.

5. `theorem_id`: `TOML_BARE_ASSIGNMENT_EQUAL_OR_COLON_ACCEPTED`
   - `source_file`: `src/parsers/toml.zig`, `src/parsers/toml/lexer.zig`
   - `source_reference`: `parseAssignment` lines 205-231; `expectAssignment` lines 501-509
   - `statement`: A key-value assignment may use either `=` or `:` between key and value.
   - `preconditions`: Input has valid key, then token `t_equal` or `t_colon`, then valid value.
   - `expected_behavior`: Property is inserted into current object with parsed value.
   - `edge_cases_covered`: Nonstandard colon separator; normal equals separator.
   - `why_this_is_Zig_derived`: `expectAssignment` accepts both `.t_equal` and `.t_colon`.
   - `ambiguities_or_assumptions`: TOML spec compatibility is irrelevant; Zig accepts colon.

6. `theorem_id`: `TOML_ASSIGNMENT_MISSING_SEPARATOR_IS_SYNTAX_ERROR`
   - `source_file`: `src/parsers/toml.zig`, `src/parsers/toml/lexer.zig`
   - `source_reference`: `parseAssignment` lines 205-215; `expectAssignment` lines 501-509
   - `statement`: A valid key not followed by `=` or `:` fails.
   - `preconditions`: `parseAssignment` consumes a key and next token is neither `t_equal` nor `t_colon`.
   - `expected_behavior`: Parser terminates with expected-token syntax error for `t_equal`.
   - `edge_cases_covered`: Missing separator; newline after key; EOF after key.
   - `why_this_is_Zig_derived`: `expectAssignment` calls `expected(T.t_equal)` for all other tokens.
   - `ambiguities_or_assumptions`: Error text says expected `t_equal`, even though colon would also be accepted.

7. `theorem_id`: `TOML_KEY_SEGMENT_TYPES`
   - `source_file`: `src/parsers/toml.zig`
   - `source_reference`: `parseKeySegment`, lines 61-101
   - `statement`: A key segment may be a string literal, identifier, `true`, `false`, or numeric literal; all become string keys.
   - `preconditions`: Current token is one of those token kinds.
   - `expected_behavior`: Segment expression has string data: literal string contents for quoted string; identifier bytes for identifier; `"true"`/`"false"` for booleans; raw source bytes for numeric literal.
   - `edge_cases_covered`: Boolean-like keys; numeric-looking keys; quoted keys.
   - `why_this_is_Zig_derived`: `parseKeySegment` converts each accepted token to `E.String`.
   - `ambiguities_or_assumptions`: Numeric key uses raw lexeme, not numeric value.

8. `theorem_id`: `TOML_KEY_FIRST_SEGMENT_REQUIRED`
   - `source_file`: `src/parsers/toml.zig`
   - `source_reference`: `parseKey`, lines 104-120
   - `statement`: A key must start with a valid key segment.
   - `preconditions`: `parseKey` is called and current token is not accepted by `parseKeySegment`.
   - `expected_behavior`: Parser terminates with syntax error `"Expected key but found ..."` via `expectedString("key")`.
   - `edge_cases_covered`: Empty table header `[]`; assignment starting with punctuation; EOF where key expected.
   - `why_this_is_Zig_derived`: First segment is required with `orelse expectedString("key")`.
   - `ambiguities_or_assumptions`: Exact log formatting may vary.

9. `theorem_id`: `TOML_DOTTED_KEY_STOPS_ON_MISSING_SEGMENT`
   - `source_file`: `src/parsers/toml.zig`
   - `source_reference`: `parseKey`, lines 114-118
   - `statement`: After a dot in a key, if no valid segment follows, dotted-key parsing stops without immediately raising from `parseKey`.
   - `preconditions`: Key has at least one valid segment, then `.` token, then invalid segment token.
   - `expected_behavior`: `parseKey` returns rope built so far; the invalid token remains for subsequent parser expectation to handle.
   - `edge_cases_covered`: Trailing dot in key/table header.
   - `why_this_is_Zig_derived`: `rope.append((try p.parseKeySegment()) orelse break, allocator)` breaks on missing segment.
   - `ambiguities_or_assumptions`: Later error depends on context (`expectAssignment`, `expect(close bracket)`, etc.).

10. `theorem_id`: `TOML_DOTTED_ASSIGNMENT_CREATES_NESTED_OBJECTS`
    - `source_file`: `src/parsers/toml.zig`, `src/ast/e.zig`
    - `source_reference`: `parseAssignment` lines 205-231; `Object.setRope` lines 573-619
    - `statement`: Assigning `a.b.c = value` creates nested object properties along the rope when absent.
    - `preconditions`: Current object lacks the path prefix.
    - `expected_behavior`: Current object gets `a` object containing `b` object containing `c: value`.
    - `edge_cases_covered`: Multi-segment keys; absent parent objects.
    - `why_this_is_Zig_derived`: `setRope` recursively creates `E.Object` when `rope.next` exists.
    - `ambiguities_or_assumptions`: Property ordering follows append order if modeled.

11. `theorem_id`: `TOML_REDEFINE_SCALAR_KEY_IS_SYNTAX_ERROR`
    - `source_file`: `src/parsers/toml.zig`, `src/ast/e.zig`
    - `source_reference`: `parseAssignment` lines 217-225; `Object.setRope` lines 573-604
    - `statement`: Assigning a key path that clobbers an existing scalar/object leaf is invalid.
    - `preconditions`: Current object already has same leaf key, or a path segment resolves to non-object/non-array where nesting is required.
    - `expected_behavior`: Parser terminates with syntax error and log message `"Cannot redefine key '...'"`.
    - `edge_cases_covered`: Duplicate simple key; scalar used as parent; object overwritten by scalar.
    - `why_this_is_Zig_derived`: `setRope` returns `error.Clobber`; `parseAssignment` maps it to a redefine-key syntax error.
    - `ambiguities_or_assumptions`: Zig asserts `loc.start > 0` when constructing key name.

12. `theorem_id`: `TOML_TABLE_HEADER_CREATES_OR_SELECTS_OBJECT`
    - `source_file`: `src/parsers/toml.zig`, `src/ast/e.zig`
    - `source_reference`: `runParser` lines 150-170; `getOrPutObject` lines 621-668
    - `statement`: `[table.path]` creates missing nested objects or selects an existing object at that path as subsequent assignment target.
    - `preconditions`: Header syntax is valid and path does not clobber scalar/table-array leaf.
    - `expected_behavior`: `head` becomes the object at the header path; following bare assignments go into that object.
    - `edge_cases_covered`: New table; reopening existing object table; nested table path.
    - `why_this_is_Zig_derived`: `runParser` calls `root.getOrPutObject` and assigns `head`.
    - `ambiguities_or_assumptions`: Zig permits selecting an existing object table; duplicate-table rejection only occurs on `Clobber`.

13. `theorem_id`: `TOML_TABLE_HEADER_REQUIRES_LINE_BREAK_AFTER_CLOSE`
    - `source_file`: `src/parsers/toml.zig`
    - `source_reference`: `runParser`, lines 155-158
    - `statement`: A single-bracket table header must be followed by a newline or EOF-like newline boundary before the next token.
    - `preconditions`: Parser consumed `]` for a table header and lexer’s next token has `has_newline_before == false`.
    - `expected_behavior`: Parser emits expected `"line break"` syntax error.
    - `edge_cases_covered`: `[a] b=1`; table header with inline trailing token.
    - `why_this_is_Zig_derived`: Zig checks `if (!p.lexer.has_newline_before) expectedString("line break")`.
    - `ambiguities_or_assumptions`: EOF handling depends on lexer setting `has_newline_before`.

14. `theorem_id`: `TOML_TABLE_HEADER_CLOBBER_IS_TABLE_ALREADY_DEFINED`
    - `source_file`: `src/parsers/toml.zig`, `src/ast/e.zig`
    - `source_reference`: `runParser` lines 160-165; `getOrPutObject` lines 621-648
    - `statement`: A table header whose path conflicts with an array/scalar or invalid array element fails as `"Table already defined"`.
    - `preconditions`: `getOrPutObject` returns `error.Clobber`.
    - `expected_behavior`: Parser terminates with `SyntaxError`; log receives `"Table already defined"`.
    - `edge_cases_covered`: `[a]` when `a` scalar; `[arr]` when `arr` table array; nested conflict.
    - `why_this_is_Zig_derived`: `runParser` catches `Clobber` from `getOrPutObject` and adds that default error.
    - `ambiguities_or_assumptions`: Exact conflicting shapes are governed by `getOrPutObject`.

15. `theorem_id`: `TOML_ARRAY_TABLE_HEADER_APPENDS_NEW_OBJECT`
    - `source_file`: `src/parsers/toml.zig`, `src/ast/e.zig`
    - `source_reference`: `runParser` lines 172-195; `getOrPutArray` lines 671-717
    - `statement`: `[[table.path]]` creates or selects an array at the path, appends a new object to it, and makes that object the current assignment target.
    - `preconditions`: Double-bracket header syntax is valid and path does not clobber.
    - `expected_behavior`: Array at path exists; its length increases by one; appended element is an object; `head` points to appended object.
    - `edge_cases_covered`: First array table; repeated array table; nested array table.
    - `why_this_is_Zig_derived`: `runParser` calls `getOrPutArray`, constructs `new_head`, pushes it, and assigns `head`.
    - `ambiguities_or_assumptions`: Object identity may need modeling by state relation rather than pointer equality.

16. `theorem_id`: `TOML_ARRAY_TABLE_HEADER_REQUIRES_LINE_BREAK_AFTER_CLOSE`
    - `source_file`: `src/parsers/toml.zig`
    - `source_reference`: `runParser`, lines 178-181
    - `statement`: A double-bracket table-array header must be followed by newline boundary.
    - `preconditions`: Parser consumed `]]` and next token has `has_newline_before == false`.
    - `expected_behavior`: Parser emits expected `"line break"` syntax error.
    - `edge_cases_covered`: `[[a]] x=1` on same line.
    - `why_this_is_Zig_derived`: Same line-break check as single table header.
    - `ambiguities_or_assumptions`: EOF boundary depends on lexer.

17. `theorem_id`: `TOML_ARRAY_TABLE_CLOBBER_IS_CANNOT_OVERWRITE_TABLE_ARRAY`
    - `source_file`: `src/parsers/toml.zig`, `src/ast/e.zig`
    - `source_reference`: `runParser` lines 183-188; `getOrPutArray` lines 671-698
    - `statement`: A table-array header whose path conflicts with scalar/object leaf fails as `"Cannot overwrite table array"`.
    - `preconditions`: `getOrPutArray` returns `error.Clobber`.
    - `expected_behavior`: Parser terminates with `SyntaxError`; log receives `"Cannot overwrite table array"`.
    - `edge_cases_covered`: `[[a]]` when `a` scalar; `[[a]]` when `a` plain object; nested conflict.
    - `why_this_is_Zig_derived`: `runParser` catches `Clobber` from `getOrPutArray` and adds that default error.
    - `ambiguities_or_assumptions`: Existing array at exact path is allowed, not clobber.

18. `theorem_id`: `TOML_ASSIGNMENT_TO_TABLE_ARRAY_APPENDS_TO_LAST_OBJECT`
    - `source_file`: `src/ast/e.zig`
    - `source_reference`: `Object.setRope`, lines 573-592
    - `statement`: Assigning into a path whose head is an existing array applies to the last object element when the rope has remaining segments.
    - `preconditions`: Existing property at rope head is array; `rope.next != null`; array has a last element and it is an object.
    - `expected_behavior`: Assignment recursively modifies the last object element.
    - `edge_cases_covered`: Assignments after `[[table]]`; nested keys inside current array-table object.
    - `why_this_is_Zig_derived`: `setRope` checks array last element and recurses into `last.data.e_object`.
    - `ambiguities_or_assumptions`: If array is empty, Zig pushes value directly for array head behavior; rarely reachable from TOML table arrays.

19. `theorem_id`: `TOML_EMPTY_ARRAY_ASSIGNMENT_IS_IGNORED_AFTER_SEPARATOR`
    - `source_file`: `src/parsers/toml.zig`, `src/parsers/toml/lexer.zig`
    - `source_reference`: `parseAssignment` lines 210-217; lexer `[]` token lines 535-547
    - `statement`: In an assignment key, if the token after the key is `[]`, `parseAssignment` consumes `[]` and the separator but does not set the property.
    - `preconditions`: Input pattern like `key [] = value` as tokenized by lexer; `is_array == true`.
    - `expected_behavior`: The assignment parser consumes `[]` and assignment separator, skips value parsing/insertion, then returns with `allow_double_bracket = true`.
    - `edge_cases_covered`: Special `t_empty_array` after key.
    - `why_this_is_Zig_derived`: `if (is_array) next(); expectAssignment(); if (!is_array) setRope(...)`.
    - `ambiguities_or_assumptions`: This appears unusual; no repair or spec inference is made.

20. `theorem_id`: `TOML_VALUE_BOOLEAN_LITERALS`
    - `source_file`: `src/parsers/toml.zig`
    - `source_reference`: `parseValue`, lines 243-256
    - `statement`: `false` and `true` as values parse to boolean false/true, not strings.
    - `preconditions`: Value token is `t_false` or `t_true`.
    - `expected_behavior`: Returned expression is `E.Boolean` with corresponding value; lexer advances once.
    - `edge_cases_covered`: Boolean values versus boolean key segments.
    - `why_this_is_Zig_derived`: `parseValue` has explicit boolean cases.
    - `ambiguities_or_assumptions`: Only lowercase exact identifiers become boolean tokens.

21. `theorem_id`: `TOML_VALUE_IDENTIFIER_IS_STRING`
    - `source_file`: `src/parsers/toml.zig`
    - `source_reference`: `parseValue`, lines 262-267
    - `statement`: An unquoted identifier value other than exact `true`/`false` parses as a string.
    - `preconditions`: Value token is `t_identifier`.
    - `expected_behavior`: Returned expression is `E.String` containing lexer identifier bytes.
    - `edge_cases_covered`: Bare string values; identifiers containing `-` or `:` after first char.
    - `why_this_is_Zig_derived`: `parseValue` maps `.t_identifier` to `E.String`.
    - `ambiguities_or_assumptions`: First character constraints come from lexer.

22. `theorem_id`: `TOML_VALUE_NUMERIC_AND_SIGNED_NUMERIC`
    - `source_file`: `src/parsers/toml.zig`
    - `source_reference`: `parseValue`, lines 268-285
    - `statement`: Numeric values parse to `E.Number`; leading `-` negates next numeric literal and leading `+` preserves it.
    - `preconditions`: Value token is numeric literal, or `-`/`+` followed by numeric literal.
    - `expected_behavior`: Returned number is lexer number, `-lexer.number`, or `+lexer.number`; sign requires immediate numeric token after lexer skipping whitespace.
    - `edge_cases_covered`: Positive sign; negative number; sign not followed by number.
    - `why_this_is_Zig_derived`: `parseValue` explicitly handles `t_numeric_literal`, `t_minus`, and `t_plus`.
    - `ambiguities_or_assumptions`: Numeric lexing behavior is separately packetized.

23. `theorem_id`: `TOML_SIGN_WITHOUT_NUMBER_IS_SYNTAX_ERROR`
    - `source_file`: `src/parsers/toml.zig`
    - `source_reference`: `parseValue`, lines 273-285
    - `statement`: A `+` or `-` value token must be followed by a numeric literal.
    - `preconditions`: Value token is `t_plus` or `t_minus`; after `next()`, token is not `t_numeric_literal`.
    - `expected_behavior`: Parser terminates via `expect(.t_numeric_literal)` error.
    - `edge_cases_covered`: `key = -foo`; `key = +]`; EOF after sign.
    - `why_this_is_Zig_derived`: Sign branches call `p.lexer.expect(.t_numeric_literal)`.
    - `ambiguities_or_assumptions`: Whitespace is skipped by lexer before expectation.

24. `theorem_id`: `TOML_INLINE_OBJECT_EMPTY_AND_NONEMPTY`
    - `source_file`: `src/parsers/toml.zig`
    - `source_reference`: `parseValue`, lines 287-317
    - `statement`: `{}` parses as empty object; `{key = value, ...}` parses assignments into that object.
    - `preconditions`: Value starts with `{`; contents are valid assignments separated by commas; closes with `}`.
    - `expected_behavior`: Returned expression is object; each parsed assignment inserts into that object; closing brace consumed.
    - `edge_cases_covered`: Empty inline object; one property; multiple properties.
    - `why_this_is_Zig_derived`: Object branch loops until `t_close_brace` and calls `parseAssignment`.
    - `ambiguities_or_assumptions`: `is_single_line` is tracked but not used in observable result.

25. `theorem_id`: `TOML_INLINE_OBJECT_COMMA_RULES`
    - `source_file`: `src/parsers/toml.zig`
    - `source_reference`: `parseValue` lines 295-307; `parseMaybeTrailingComma` lines 364-371
    - `statement`: In inline objects, every property after the first requires a comma; a comma immediately before `}` is accepted as trailing and stops the loop.
    - `preconditions`: Parsing inline object after at least one property.
    - `expected_behavior`: Missing comma causes expected-comma syntax error; comma followed by `}` ends object without requiring another assignment.
    - `edge_cases_covered`: Trailing comma; missing comma; singleton object.
    - `why_this_is_Zig_derived`: For `obj.properties.len > 0`, parser calls `parseMaybeTrailingComma(.t_close_brace)`.
    - `ambiguities_or_assumptions`: Duplicate keys inside inline object follow normal `setRope` clobber behavior.

26. `theorem_id`: `TOML_ARRAY_EMPTY_AND_NONEMPTY`
    - `source_file`: `src/parsers/toml.zig`, `src/parsers/toml/lexer.zig`
    - `source_reference`: `parseValue` lines 319-355; lexer `[]` lines 535-547
    - `statement`: `[]` parses as empty array; `[v1, v2, ...]` parses each value and pushes it into array.
    - `preconditions`: Value token is `t_empty_array` or `t_open_bracket`.
    - `expected_behavior`: Empty array returns array with no items; nonempty array returns array with items in source order.
    - `edge_cases_covered`: Empty array special token; singleton array; multiple elements.
    - `why_this_is_Zig_derived`: `t_empty_array` branch returns `E.Array{}`; `t_open_bracket` branch loops and pushes parsed values.
    - `ambiguities_or_assumptions`: Array push uses `catch unreachable` for allocation failure.

27. `theorem_id`: `TOML_ARRAY_COMMA_RULES`
    - `source_file`: `src/parsers/toml.zig`
    - `source_reference`: `parseValue` lines 332-347; `parseMaybeTrailingComma` lines 364-371
    - `statement`: In arrays, every element after the first requires a comma; a comma immediately before `]` is accepted as trailing and stops the loop.
    - `preconditions`: Parsing array after at least one item.
    - `expected_behavior`: Missing comma causes expected-comma syntax error; trailing comma before `]` is accepted.
    - `edge_cases_covered`: `[1,]`; `[1 2]`; singleton array.
    - `why_this_is_Zig_derived`: For `array.items.len > 0`, parser calls `parseMaybeTrailingComma(.t_close_bracket)`.
    - `ambiguities_or_assumptions`: Newlines are tracked but not rejected.

28. `theorem_id`: `TOML_UNEXPECTED_VALUE_TOKEN_IS_SYNTAX_ERROR`
    - `source_file`: `src/parsers/toml.zig`
    - `source_reference`: `parseValue`, lines 357-360
    - `statement`: Any token not handled as a value causes parse failure.
    - `preconditions`: `parseValue` current token is not boolean, string, identifier, numeric, sign, brace, or bracket/empty-array.
    - `expected_behavior`: Lexer logs unexpected token and parser returns `SyntaxError`.
    - `edge_cases_covered`: `key = }`; `key = ,`; EOF after separator.
    - `why_this_is_Zig_derived`: `else` branch calls `p.lexer.unexpected()` then returns `error.SyntaxError`.
    - `ambiguities_or_assumptions`: Some invalid tokens may fail earlier during lexing.

29. `theorem_id`: `TOML_ALLOW_DOUBLE_BRACKET_TRUE_TOKENIZES_DOUBLE_BRACKETS`
    - `source_file`: `src/parsers/toml/lexer.zig`, `src/parsers/toml.zig`
    - `source_reference`: lexer lines 535-556; parser lines 172-195, 241, 315, 353
    - `statement`: When `allow_double_bracket == true`, `[[` and `]]` tokenize as double-bracket table-array delimiters.
    - `preconditions`: Lexer sees adjacent brackets and `allow_double_bracket == true`.
    - `expected_behavior`: `[[` token is `t_open_bracket_double`; `]]` token is `t_close_bracket_double`; parser can enter array-table header branch.
    - `edge_cases_covered`: Valid internal flag combination; table-array header.
    - `why_this_is_Zig_derived`: Lexer only emits double bracket tokens under `allow_double_bracket`.
    - `ambiguities_or_assumptions`: This is an internal parser flag, not a public option.

30. `theorem_id`: `TOML_ALLOW_DOUBLE_BRACKET_FALSE_PREVENTS_DOUBLE_BRACKET_TOKENS`
    - `source_file`: `src/parsers/toml/lexer.zig`, `src/parsers/toml.zig`
    - `source_reference`: lexer lines 535-556; parser lines 205-207, 330
    - `statement`: When `allow_double_bracket == false`, adjacent brackets are not combined into double-bracket tokens.
    - `preconditions`: Lexer sees `[[` or `]]` while flag is false, such as during assignment key parsing or array parsing.
    - `expected_behavior`: First bracket is tokenized as single `[` or `]`; subsequent bracket remains for later scanning, often causing context-specific syntax error.
    - `edge_cases_covered`: Invalid internal flag combination for table-array syntax inside arrays/assignments.
    - `why_this_is_Zig_derived`: Lexer’s double-bracket token branches are guarded by `lexer.allow_double_bracket`.
    - `ambiguities_or_assumptions`: Exact later termination depends on context.

31. `theorem_id`: `TOML_REDACT_LOGS_FLAG_ONLY_AFFECTS_ERROR_LOG_OPTIONS`
    - `source_file`: `src/parsers/toml.zig`, `src/parsers/toml/lexer.zig`
    - `source_reference`: `TOML.init` lines 37-43; `Lexer.init` lines 1159-1168; error logging lines 83-91, 116-122
    - `statement`: The `redact_logs` input flag is stored in the lexer and only passed to log error options.
    - `preconditions`: Same source/allocator/log except `redact_logs` differs.
    - `expected_behavior`: Successful parse result is identical; syntax success/failure control flow is identical; only error redaction metadata differs.
    - `edge_cases_covered`: No-flag behavior (`false`); redacted behavior (`true`); invalid source.
    - `why_this_is_Zig_derived`: `redact_logs` is assigned to `should_redact_logs` and referenced only in add-error option construction.
    - `ambiguities_or_assumptions`: “Identical” excludes diagnostic formatting/redaction side effects.

32. `theorem_id`: `TOML_SINGLE_QUOTED_STRINGS_ARE_LITERAL`
    - `source_file`: `src/parsers/toml/lexer.zig`
    - `source_reference`: lexer lines 627-688
    - `statement`: Single-quoted strings return their contents literally without escape decoding.
    - `preconditions`: Source contains valid `'...'`, `''`, or `'''...'''` string token.
    - `expected_behavior`: Token is `t_string_literal`; `string_literal_slice` is source content between delimiters; backslashes are not decoded.
    - `edge_cases_covered`: Empty single-quoted string; multiline literal string; unterminated single-line literal.
    - `why_this_is_Zig_derived`: Single-quote branch never calls `decodeEscapeSequences`.
    - `ambiguities_or_assumptions`: Multiline slice starts at `start + 2`, matching Zig’s delimiter accounting.

33. `theorem_id`: `TOML_DOUBLE_QUOTED_STRINGS_DECODE_ESCAPES_WHEN_NEEDED`
    - `source_file`: `src/parsers/toml/lexer.zig`
    - `source_reference`: lexer lines 690-787; decode lines 812-1119
    - `statement`: Double-quoted strings without backslashes return raw content; with backslashes run escape decoding.
    - `preconditions`: Source contains valid `"..."` or `"""..."""`.
    - `expected_behavior`: Token is `t_string_literal`; if `needs_slow_pass`, decoded slice replaces raw slice and `string_literal_is_ascii` becomes false.
    - `edge_cases_covered`: Empty basic string; multiline basic string; escaped quote.
    - `why_this_is_Zig_derived`: Double-quote branch tracks `needs_slow_pass` and calls `decodeEscapeSequences`.
    - `ambiguities_or_assumptions`: `string_literal_is_ascii=false` is used as marker even for decoded ASCII output.

34. `theorem_id`: `TOML_STRING_UNTERMINATED_ERRORS`
    - `source_file`: `src/parsers/toml/lexer.zig`
    - `source_reference`: single quote lines 648-676; double quote lines 711-749
    - `statement`: Unterminated string literals terminate parsing with syntax errors.
    - `preconditions`: Lexer enters string branch and reaches EOF or forbidden newline before closing delimiter.
    - `expected_behavior`: Single-line single quote newline => `"Unterminated string literal (single-line)"`; EOF single quote => `"Unterminated string literal"`; single-line double quote newline => `"Unterminated basic string (single-line)"`; EOF double quote => `"Unterminated basic string"`.
    - `edge_cases_covered`: EOF; newline in single-line strings; multiline missing delimiter.
    - `why_this_is_Zig_derived`: Lexer calls `addDefaultError` at these cases.
    - `ambiguities_or_assumptions`: Exact user-facing diagnostic may be redacted by flag.

35. `theorem_id`: `TOML_ESCAPE_SPECIAL_SINGLE_CHAR_MAPPINGS`
    - `source_file`: `src/parsers/toml/lexer.zig`
    - `source_reference`: `decodeEscapeSequences`, lines 839-870
    - `statement`: Escape sequences map `\b,\f,\n,\v,\t,\r` to byte values 8,9,10,11,12,13 respectively.
    - `preconditions`: Decoding a double-quoted string containing these escapes.
    - `expected_behavior`: Output buffer receives the corresponding control byte.
    - `edge_cases_covered`: Vertical tab accepted; tab maps to 12 in Zig; form-feed maps to 9 in Zig.
    - `why_this_is_Zig_derived`: Zig appends those numeric constants in each escape case.
    - `ambiguities_or_assumptions`: These mappings may differ from standard expectations; do not repair.

36. `theorem_id`: `TOML_ESCAPE_HEX_INVALID_IN_MULTILINE`
    - `source_file`: `src/parsers/toml/lexer.zig`
    - `source_reference`: `decodeEscapeSequences`, lines 937-987
    - `statement`: `\xHH` is accepted only for non-multiline decoded strings and rejected in multiline decoded strings.
    - `preconditions`: Escape decoder sees `\x`; `allow_multiline` parameter true or false.
    - `expected_behavior`: If `allow_multiline == true`, syntax error; otherwise exactly two hex digits are required and decoded to one code point.
    - `edge_cases_covered`: Invalid hex digit; EOF after `\x`; multiline `\x`.
    - `why_this_is_Zig_derived`: `if (comptime allow_multiline)` triggers syntax error before hex parsing.
    - `ambiguities_or_assumptions`: “multiline” here means decoder parameter, not source merely containing newline.

37. `theorem_id`: `TOML_ESCAPE_UNICODE_FIXED_AND_VARIABLE`
    - `source_file`: `src/parsers/toml/lexer.zig`
    - `source_reference`: `decodeEscapeSequences`, lines 988-1078
    - `statement`: `\uXXXX` and `\u{...}` decode Unicode code points; invalid digits/empty braces/out-of-range variable value fail.
    - `preconditions`: Escape decoder sees `\u`.
    - `expected_behavior`: Fixed form consumes four hex digits; variable form consumes one or more hex digits until `}` and rejects values above `0x10FFFF`.
    - `edge_cases_covered`: Empty `\u{}`; non-hex char; out-of-range code point.
    - `why_this_is_Zig_derived`: Zig implements separate fixed and brace-form branches with range check.
    - `ambiguities_or_assumptions`: Fixed form truncates to `CodePoint` after accumulation.

38. `theorem_id`: `TOML_MULTILINE_ESCAPE_LINE_CONTINUATION_IGNORED`
    - `source_file`: `src/parsers/toml/lexer.zig`
    - `source_reference`: `decodeEscapeSequences`, lines 1079-1099
    - `statement`: Backslash followed by newline is an ignored line continuation in multiline strings, but invalid in non-multiline strings.
    - `preconditions`: Escape decoder sees `\` followed by CR/LF/LS/PS.
    - `expected_behavior`: If `allow_multiline == true`, no character is appended; if false, syntax error `"Unexpected end of line"`.
    - `edge_cases_covered`: CRLF; LF; Unicode line separators.
    - `why_this_is_Zig_derived`: Newline escape cases conditionally error only when `!allow_multiline`, then `continue`.
    - `ambiguities_or_assumptions`: CRLF handling indexes `iter.i + 1`; assume valid range in reachable inputs.

39. `theorem_id`: `TOML_NUMERIC_BASE_PREFIXES_AND_UNDERSCORES`
    - `source_file`: `src/parsers/toml/lexer.zig`
    - `source_reference`: `parseNumericLiteralOrDot`, lines 190-340
    - `statement`: Numeric literals support binary `0b`, octal `0o`, hex `0x`, and legacy octal-like prefixes, with underscore restrictions.
    - `preconditions`: Lexer scans a number starting with `0` and base prefix or legacy octal pattern.
    - `expected_behavior`: Valid digits accumulate numeric value by base; invalid digits or misplaced/consecutive underscores cause syntax errors, except invalid legacy octal is reparsed as decimal float.
    - `edge_cases_covered`: `0b2`; `0xF`; leading underscore after prefix; consecutive underscores; `08`.
    - `why_this_is_Zig_derived`: Base-specific branch implements these cases.
    - `ambiguities_or_assumptions`: BigInt branch sets `identifier` but token remains numeric; parser value uses `number`.

40. `theorem_id`: `TOML_DECIMAL_FLOAT_EXPONENT_AND_UNDERSCORES`
    - `source_file`: `src/parsers/toml/lexer.zig`
    - `source_reference`: `parseNumericLiteralOrDot`, lines 341-486
    - `statement`: Decimal numbers may include fractional part, exponent, and underscores subject to placement checks; parsed value is f64.
    - `preconditions`: Lexer scans decimal/dot-start numeric literal.
    - `expected_behavior`: Valid integer under 10 source bytes without dot/exponent uses fast u32 path; otherwise underscores are removed and `parseFloat(f64)` is used; invalid underscore/exponent forms fail.
    - `edge_cases_covered`: `.5`; `1.`; `1_e2`; `1e+2`; `1e`; `1__2`.
    - `why_this_is_Zig_derived`: Decimal branch handles digits, fraction, exponent, underscore filtering, and parseFloat.
    - `ambiguities_or_assumptions`: A lone dot token is not numeric.

41. `theorem_id`: `TOML_DOT_TOKEN_VERSUS_DOT_NUMBER`
    - `source_file`: `src/parsers/toml/lexer.zig`
    - `source_reference`: `parseNumericLiteralOrDot`, lines 190-201
    - `statement`: `.` tokenizes as key separator unless followed by a digit, in which case it begins a numeric literal.
    - `preconditions`: Lexer sees `.`.
    - `expected_behavior`: If next code point is digit, token is numeric; otherwise token is `t_dot`.
    - `edge_cases_covered`: Dotted keys; `.5` numeric value; trailing key dot.
    - `why_this_is_Zig_derived`: Early check returns `T.t_dot` only when first `.` and next not digit.
    - `ambiguities_or_assumptions`: Numeric `.5` as a key segment becomes raw string key if parsed in key context.

42. `theorem_id`: `TOML_INVALID_CHARACTER_IS_UNEXPECTED_SYNTAX_ERROR`
    - `source_file`: `src/parsers/toml/lexer.zig`
    - `source_reference`: `Lexer.next` lines 793-807; `unexpected` lines 1126-1138
    - `statement`: Any character not handled by lexer token cases is unexpected.
    - `preconditions`: Lexer current code point is not whitespace/comment, bracket, sign, brace, separator, quote, dot/digit, or identifier-start.
    - `expected_behavior`: Lexer logs `"Unexpected {raw}"` and returns syntax error.
    - `edge_cases_covered`: Unsupported punctuation; invalid leading identifier char.
    - `why_this_is_Zig_derived`: Final `else` in token switch calls `lexer.unexpected()`.
    - `ambiguities_or_assumptions`: Invalid UTF-8/WTF-8 bytes may decode to replacement behavior before this branch.
