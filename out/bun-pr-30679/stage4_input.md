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
