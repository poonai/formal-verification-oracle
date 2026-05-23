11. `theorem_id`: `LF_011_realign_preserves_read_order`
    - `source_file`: `src/collections/linear_fifo.zig`
    - `source_reference`: `lines 85-107`
    - `statement`: `realign` moves readable contents to the start of the buffer without changing logical FIFO order or count.
    - `preconditions`: Valid FIFO state.
    - `expected_behavior`: `head == 0`; `count` unchanged; logical readable sequence unchanged; unused region becomes undefined.
    - `edge_cases_covered`: contiguous readable region, wrapped readable region, empty FIFO.
    - `why_this_is_Zig_derived`: Both branches copy/rotate readable data so `head` reaches 0, then clear unused bytes to undefined.
    - `ambiguities_or_assumptions`: Undefined writes to unused storage are not semantically observable in model.