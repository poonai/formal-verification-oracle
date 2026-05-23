Read the theorem packet, the proof result, and the benchmark ground truth.

Task:
- Decide whether the proof stage found the intended bug.
- Use the benchmark ground truth as the reference.
- Output exactly one label on the first line:
  - intended bug found
  - valid bug found
  - no bug found
- Then give a short explanation.

Rules:
- Do not suggest alternative theorems.
- Do not change the proof result.
- Do not restate the theorem packet unless needed for the explanation.
- If the match is unclear, choose the closest label and say why.
- Prefer the intended-bug label only when the proof result really targets the benchmark bug.

Input fields you will see:
- dataset_id
- expected_bug_slug
- expected_stage3_label
- bug_summary
- rust_selector
- zig_semantic_anchor
- notes
- theorem_packet
- proof_output

Short principle:
- Judge whether the proof result actually hit the ground-truth bug.
