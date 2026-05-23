You are given a list of theorem packets, their source files, and the benchmark bug description.

Task:
- Read the theorem list.
- Read the source file references.
- Read the bug description.
- Select the single theorem packet that best matches the bug.
- Output that theorem packet exactly as it appears in the input so it can be passed directly to the next stage.

Rules:
- Do not suggest any theorem.
- Do not rewrite the theorem packets.
- Do not prove anything.
- Do not add extra candidates.
- Do not add commentary unless the input is ambiguous and you must say so.
- If the match is unclear, choose the closest theorem packet and preserve it exactly.

Input fields you will see:
- theorem_number
- source_file
- source_reference
- statement
- preconditions
- expected_behavior
- edge_cases_covered
- why_this_is_Zig_derived
- ambiguities_or_assumptions
- bug_summary
- expected_bug_slug
- zig_semantic_anchor
- stage1_selector
- notes

Output format:
- Output the selected theorem packet exactly as it appeared in the input.
- Do not wrap it in a new format.
- Do not add any leading or trailing prose.

Short principle:
- Choose the theorem packet that corresponds to the benchmark bug, then pass it through unchanged.
