1. `theorem_id`: `LF_001_buffer_type_cases_only`
   - `source_file`: `src/collections/linear_fifo.zig`
   - `source_reference`: `lines 7-32, 48-52`
   - `statement`: `LinearFifo` has exactly three compile-time buffer modes: `Static(size)`, `Slice`, and `Dynamic`.
   - `preconditions`: `buffer_type` is one of the Zig union enum cases.
   - `expected_behavior`: `Static` stores an inline `[size]T`; `Slice` stores caller-provided `[]T`; `Dynamic` stores allocator-managed `[]T`. There are no runtime flag combinations.
   - `edge_cases_covered`: no-flag behavior; invalid flag combinations are compile-time-unrepresentable.
   - `why_this_is_Zig_derived`: The Zig `union(enum)` defines only these cases and `init` dispatches by `switch`.
   - `ambiguities_or_assumptions`: Treat “invalid flags” as not applicable except malformed compile-time construction.

2. `theorem_id`: `LF_002_init_static_empty_state`
   - `source_file`: `src/collections/linear_fifo.zig`
   - `source_reference`: `lines 54-61`
   - `statement`: Static initialization starts empty with `head == 0` and `count == 0`.
   - `preconditions`: `buffer_type == Static(n)`.
   - `expected_behavior`: Buffer capacity is `n`; contents are undefined; readable length is zero.
   - `edge_cases_covered`: `n == 0`, singleton capacity, power-of-two and non-power-of-two capacities.
   - `why_this_is_Zig_derived`: `initStatic` sets `.head = 0`, `.count = 0`, `.buf = undefined`.
   - `ambiguities_or_assumptions`: Undefined unused contents are not observable unless read through invalid use.

3. `theorem_id`: `LF_003_init_slice_empty_state`
   - `source_file`: `src/collections/linear_fifo.zig`
   - `source_reference`: `lines 63-70`
   - `statement`: Slice initialization starts empty over the caller-provided buffer.
   - `preconditions`: `buffer_type == Slice`, caller provides `buf: []T`.
   - `expected_behavior`: `self.buf` aliases the provided slice; `head == 0`; `count == 0`; capacity is `buf.len`.
   - `edge_cases_covered`: empty slice, singleton slice.
   - `why_this_is_Zig_derived`: `initSlice` stores `buf` directly and sets zero state.
   - `ambiguities_or_assumptions`: Aliasing effects outside the FIFO are not modeled unless buffer identity is represented.

4. `theorem_id`: `LF_004_init_dynamic_empty_zero_capacity`
   - `source_file`: `src/collections/linear_fifo.zig`
   - `source_reference`: `lines 72-79`
   - `statement`: Dynamic initialization starts empty with zero capacity.
   - `preconditions`: `buffer_type == Dynamic`, valid allocator supplied.
   - `expected_behavior`: `buf.len == 0`, `head == 0`, `count == 0`.
   - `edge_cases_covered`: initial zero-capacity dynamic FIFO.
   - `why_this_is_Zig_derived`: `initDynamic` sets `.buf = &[_]T{}`.
   - `ambiguities_or_assumptions`: Allocator identity/lifetime is a caller obligation.

5. `theorem_id`: `LF_005_deinit_dynamic_only`
   - `source_file`: `src/collections/linear_fifo.zig`
   - `source_reference`: `lines 81-83`
   - `statement`: `deinit` frees storage only for dynamic FIFOs.
   - `preconditions`: FIFO previously initialized.
   - `expected_behavior`: Dynamic calls `allocator.free(self.buf)`; Static/Slice do nothing.
   - `edge_cases_covered`: zero-capacity dynamic buffer; non-owning Slice buffer.
   - `why_this_is_Zig_derived`: `if (buffer_type == .Dynamic)` guards the free.
   - `ambiguities_or_assumptions`: Dafny may not model allocator/free effects.

6. `theorem_id`: `LF_006_readable_and_writable_lengths`
   - `source_file`: `src/collections/linear_fifo.zig`
   - `source_reference`: `lines 149-151, 238-240`
   - `statement`: Readable length equals `count`; writable length equals `buf.len - count`.
   - `preconditions`: Valid FIFO state with `count <= buf.len`.
   - `expected_behavior`: `readableLength() == count`; `writableLength() == capacity - count`.
   - `edge_cases_covered`: empty FIFO, full FIFO, zero capacity.
   - `why_this_is_Zig_derived`: Both functions directly return those expressions.
   - `ambiguities_or_assumptions`: If `count > buf.len`, writable length would underflow; Zig validity relies on caller-maintained invariants.

7. `theorem_id`: `LF_007_ensure_total_capacity_noop_when_enough`
   - `source_file`: `src/collections/linear_fifo.zig`
   - `source_reference`: `lines 122-124`
   - `statement`: `ensureTotalCapacity(size)` is a no-op success when current capacity is already at least `size`.
   - `preconditions`: `buf.len >= size`.
   - `expected_behavior`: Returns success; buffer, head, count, and readable sequence unchanged.
   - `edge_cases_covered`: `size == 0`, exact capacity boundary.
   - `why_this_is_Zig_derived`: First branch returns immediately.
   - `ambiguities_or_assumptions`: Success is represented as absence of error in Zig.

8. `theorem_id`: `LF_008_ensure_total_capacity_dynamic_grows_and_realigns`
   - `source_file`: `src/collections/linear_fifo.zig`
   - `source_reference`: `lines 123-140`
   - `statement`: Dynamic `ensureTotalCapacity(size)` grows storage when needed and preserves readable contents.
   - `preconditions`: `buffer_type == Dynamic`, `buf.len < size`, allocation succeeds.
   - `expected_behavior`: Calls `realign`; allocates new capacity `ceilPowerOfTwo(size)` because dynamic uses `powers_of_two == true`; copies readable contents to index 0; frees old buffer; sets `head == 0`.
   - `edge_cases_covered`: empty dynamic FIFO, wrapped readable contents, singleton growth.
   - `why_this_is_Zig_derived`: Dynamic branch realigns, allocates `new_size`, copies `readableSlice(0)`, frees old buffer, resets head.
   - `ambiguities_or_assumptions`: Dafny may model capacity as exactly `size`; Zig rounds dynamic capacity to power of two.

9. `theorem_id`: `LF_009_ensure_total_capacity_static_slice_fails_when_insufficient`
   - `source_file`: `src/collections/linear_fifo.zig`
   - `source_reference`: `lines 123-140`
   - `statement`: Non-dynamic FIFOs cannot grow.
   - `preconditions`: `buffer_type != Dynamic`, `buf.len < size`.
   - `expected_behavior`: Returns `error.OutOfMemory`; state unchanged.
   - `edge_cases_covered`: full Static/Slice FIFO, zero-capacity Slice/Static.
   - `why_this_is_Zig_derived`: Else branch returns `error.OutOfMemory`.
   - `ambiguities_or_assumptions`: Zig error union maps to boolean/error result in model.

10. `theorem_id`: `LF_010_ensure_unused_capacity`
    - `source_file`: `src/collections/linear_fifo.zig`
    - `source_reference`: `lines 142-147`
    - `statement`: `ensureUnusedCapacity(size)` succeeds without mutation if current writable length is enough; otherwise it requires total capacity `count + size`.
    - `preconditions`: Valid FIFO; `count + size` does not overflow, or overflow is treated as `OutOfMemory`.
    - `expected_behavior`: If `writableLength() >= size`, success no-op. Else delegates to `ensureTotalCapacity(count + size)`.
    - `edge_cases_covered`: `size == 0`, exact writable boundary, arithmetic overflow.
    - `why_this_is_Zig_derived`: Function checks writable length then calls `math.add`.
    - `ambiguities_or_assumptions`: Overflow produces `error.OutOfMemory`.

11. `theorem_id`: `LF_011_realign_preserves_read_order`
    - `source_file`: `src/collections/linear_fifo.zig`
    - `source_reference`: `lines 85-107`
    - `statement`: `realign` moves readable contents to the start of the buffer without changing logical FIFO order or count.
    - `preconditions`: Valid FIFO state.
    - `expected_behavior`: `head == 0`; `count` unchanged; logical readable sequence unchanged; unused region becomes undefined.
    - `edge_cases_covered`: contiguous readable region, wrapped readable region, empty FIFO.
    - `why_this_is_Zig_derived`: Both branches copy/rotate readable data so `head` reaches 0, then clear unused bytes to undefined.
    - `ambiguities_or_assumptions`: Undefined writes to unused storage are not semantically observable in model.

12. `theorem_id`: `LF_012_shrink_dynamic`
    - `source_file`: `src/collections/linear_fifo.zig`
    - `source_reference`: `lines 109-118`
    - `statement`: Dynamic `shrink(size)` attempts to reduce capacity while preserving readable contents.
    - `preconditions`: `buffer_type == Dynamic`, `size >= count`.
    - `expected_behavior`: Calls `realign`; attempts `realloc` to `size`; on success capacity becomes `size`; on OOM capacity remains valid and contents preserved.
    - `edge_cases_covered`: shrink to `count`, shrink to zero when empty.
    - `why_this_is_Zig_derived`: `assert(size >= count)`, dynamic branch realigns and catches `OutOfMemory` by returning.
    - `ambiguities_or_assumptions`: OOM nondeterminism may need separate theorem if allocator failures are modeled.

13. `theorem_id`: `LF_013_shrink_static_slice_noop`
    - `source_file`: `src/collections/linear_fifo.zig`
    - `source_reference`: `lines 109-118`
    - `statement`: `shrink` does nothing for Static and Slice FIFOs after checking `size >= count`.
    - `preconditions`: `buffer_type != Dynamic`, `size >= count`.
    - `expected_behavior`: Capacity, head, count, and readable sequence unchanged.
    - `edge_cases_covered`: size smaller than capacity but at least count.
    - `why_this_is_Zig_derived`: Only dynamic branch mutates.
    - `ambiguities_or_assumptions`: `size < count` is assertion failure, not normal behavior.

14. `theorem_id`: `LF_014_readable_slice_cases`
    - `source_file`: `src/collections/linear_fifo.zig`
    - `source_reference`: `lines 154-171`
    - `statement`: `readableSlice(offset)` returns the first contiguous readable segment starting at logical `offset`.
    - `preconditions`: `offset <= count` for non-empty result; valid FIFO.
    - `expected_behavior`: If `offset > count`, returns empty. If `head + offset >= buf.len`, returns wrapped segment from physical start. Otherwise returns segment from `head + offset` up to `min(head + count, buf.len)`.
    - `edge_cases_covered`: `offset == count`, wrapped readable data, contiguous readable data.
    - `why_this_is_Zig_derived`: Direct branch structure in `readableSliceMut`.
    - `ambiguities_or_assumptions`: It returns a contiguous slice, not necessarily the whole logical suffix when data wraps.

15. `theorem_id`: `LF_015_discard_normal`
    - `source_file`: `src/collections/linear_fifo.zig`
    - `source_reference`: `lines 173-201`
    - `statement`: `discard(n)` removes the first `n` readable items.
    - `preconditions`: `n <= count`; if non-power-of-two mode, `buf.len > 0` when executing modulo.
    - `expected_behavior`: `count` decreases by `n`; `head` advances by `n` modulo capacity or power-of-two mask; logical readable sequence drops its first `n` items.
    - `edge_cases_covered`: `n == 0`, `n == count`, wrap-around head.
    - `why_this_is_Zig_derived`: Function asserts bound, advances `head`, then subtracts `count`.
    - `ambiguities_or_assumptions`: In assert-enabled builds, discarded storage is set undefined; not logically observable.

16. `theorem_id`: `LF_016_discard_zero_dynamic_empty_special`
    - `source_file`: `src/collections/linear_fifo.zig`
    - `source_reference`: `lines 191-200, 444-449`
    - `statement`: `discard(0)` on a freshly initialized Dynamic FIFO with zero capacity succeeds and leaves it empty.
    - `preconditions`: `buffer_type == Dynamic`, `buf.len == 0`, `head == 0`, `count == 0`, `n == 0`.
    - `expected_behavior`: No trap; `head == 0`; `count == 0`.
    - `edge_cases_covered`: zero-capacity dynamic boundary.
    - `why_this_is_Zig_derived`: Dynamic has `powers_of_two == true`; `head &= self.buf.len -% 1` avoids overflow, and the test explicitly covers this.
    - `ambiguities_or_assumptions`: Same call on zero-capacity Slice/non-power Static is not implied safe.

17. `theorem_id`: `LF_017_read_item_empty`
    - `source_file`: `src/collections/linear_fifo.zig`
    - `source_reference`: `lines 203-210`
    - `statement`: `readItem` on an empty FIFO returns null and does not mutate.
    - `preconditions`: `count == 0`.
    - `expected_behavior`: Return value is `null`; state unchanged.
    - `edge_cases_covered`: empty dynamic zero-capacity, empty nonzero-capacity.
    - `why_this_is_Zig_derived`: First branch returns `null`.
    - `ambiguities_or_assumptions`: None.

18. `theorem_id`: `LF_018_read_item_nonempty`
    - `source_file`: `src/collections/linear_fifo.zig`
    - `source_reference`: `lines 203-210`
    - `statement`: `readItem` returns and removes the oldest item.
    - `preconditions`: `count > 0`.
    - `expected_behavior`: Returns `buf[head]`; then discards one item; readable sequence becomes old sequence without first element.
    - `edge_cases_covered`: singleton FIFO, wrapped head.
    - `why_this_is_Zig_derived`: Reads `self.buf[self.head]` then calls `discard(1)`.
    - `ambiguities_or_assumptions`: Requires valid physical buffer invariant.

19. `theorem_id`: `LF_019_read_bulk`
    - `source_file`: `src/collections/linear_fifo.zig`
    - `source_reference`: `lines 212-226`
    - `statement`: `read(dst)` copies up to `dst.len` readable items and removes exactly the copied items.
    - `preconditions`: Valid FIFO; destination slice is writable.
    - `expected_behavior`: Returns `min(old count, dst.len)`; destination prefix equals old readable prefix of that length; FIFO drops that prefix.
    - `edge_cases_covered`: empty destination, empty FIFO, read across wrap boundary, destination shorter/longer than readable length.
    - `why_this_is_Zig_derived`: Loop copies contiguous readable slices, discards copied amount, stops when dst full or no readable slice.
    - `ambiguities_or_assumptions`: Return count is item count, not byte count for generic `T`.

20. `theorem_id`: `LF_020_writable_slice_cases`
    - `source_file`: `src/collections/linear_fifo.zig`
    - `source_reference`: `lines 243-254`
    - `statement`: `writableSlice(offset)` returns the first contiguous writable segment at logical writable offset.
    - `preconditions`: Valid FIFO; safe usage requires `offset <= writableLength()` or equivalent non-underflow condition.
    - `expected_behavior`: If `offset > buf.len`, returns empty. Else computes `tail = head + offset + count`; if `tail < buf.len`, returns `buf[tail..]`; otherwise returns wrapped writable segment of length `writableLength() - offset`.
    - `edge_cases_covered`: full FIFO gives zero-length segment, wrapped tail, `offset == writableLength`.
    - `why_this_is_Zig_derived`: Direct branch structure.
    - `ambiguities_or_assumptions`: Zig does not explicitly guard `offset > writableLength()`; such calls can underflow/trap.

21. `theorem_id`: `LF_021_writable_with_size`
    - `source_file`: `src/collections/linear_fifo.zig`
    - `source_reference`: `lines 256-271`
    - `statement`: `writableWithSize(size)` returns a contiguous writable slice of exactly `size` after ensuring capacity.
    - `preconditions`: Allocation/ensure succeeds.
    - `expected_behavior`: If first writable segment is too short, FIFO is realigned; returned slice length is `size`; readable sequence and count unchanged.
    - `edge_cases_covered`: `size == 0`, wrapped buffer needing realign, dynamic growth.
    - `why_this_is_Zig_derived`: Calls `ensureUnusedCapacity`, optionally `realign`, asserts slice length, returns `slice[0..size]`.
    - `ambiguities_or_assumptions`: Caller must call `update` after writing into returned slice.

22. `theorem_id`: `LF_022_update`
    - `source_file`: `src/collections/linear_fifo.zig`
    - `source_reference`: `lines 273-277`
    - `statement`: `update(n)` marks `n` previously-written tail items as readable.
    - `preconditions`: `count + n <= buf.len`.
    - `expected_behavior`: `count` increases by `n`; head unchanged.
    - `edge_cases_covered`: `n == 0`, fill-to-capacity.
    - `why_this_is_Zig_derived`: Function asserts bound and does `self.count += count`.
    - `ambiguities_or_assumptions`: Contents are caller-written through writable slice; Zig does not initialize them in `update`.

23. `theorem_id`: `LF_023_write_assume_capacity`
    - `source_file`: `src/collections/linear_fifo.zig`
    - `source_reference`: `lines 279-293`
    - `statement`: `writeAssumeCapacity(src)` appends all source items without allocation.
    - `preconditions`: `writableLength() >= src.len`.
    - `expected_behavior`: Readable sequence becomes old readable sequence followed by `src`; count increases by `src.len`.
    - `edge_cases_covered`: empty source, source spanning wrap boundary, exact remaining capacity.
    - `why_this_is_Zig_derived`: Loop copies chunks to writable slices and calls `update(n)`.
    - `ambiguities_or_assumptions`: Insufficient capacity is assertion failure, not normal error.

24. `theorem_id`: `LF_024_write_item_assume_capacity`
    - `source_file`: `src/collections/linear_fifo.zig`
    - `source_reference`: `lines 301-310`
    - `statement`: `writeItemAssumeCapacity(item)` appends one item at the physical tail.
    - `preconditions`: At least one writable slot exists.
    - `expected_behavior`: Item is written at `(head + count) mod capacity` or equivalent power-of-two mask; count increases by one; readable sequence appends `item`.
    - `edge_cases_covered`: empty FIFO, tail wrap, singleton capacity.
    - `why_this_is_Zig_derived`: Computes `tail`, writes `buf[tail]`, calls `update(1)`.
    - `ambiguities_or_assumptions`: Zig has no explicit assert here; zero capacity would trap through modulo/mask indexing.

25. `theorem_id`: `LF_025_write_item`
   - `source_file`: `src/collections/linear_fifo.zig`
   - `source_reference`: `lines 295-299`
   - `statement`: `writeItem(item)` ensures one unused slot then appends the item.
   - `preconditions`: Valid FIFO; allocation succeeds if growth is needed.
   - `expected_behavior`: On success, readable sequence appends `item`; count increases by one. On non-dynamic insufficient capacity, returns `OutOfMemory` and does not append.
   - `edge_cases_covered`: empty dynamic zero-capacity, full Static/Slice, full Dynamic.
   - `why_this_is_Zig_derived`: Calls `ensureUnusedCapacity(1)` then `writeItemAssumeCapacity`.
   - `ambiguities_or_assumptions`: Error representation differs between Zig and Dafny.

26. `theorem_id`: `LF_026_write_bulk`
   - `source_file`: `src/collections/linear_fifo.zig`
   - `source_reference`: `lines 312-318`
   - `statement`: `write(src)` ensures capacity then appends all source items.
   - `preconditions`: Valid FIFO; allocation succeeds if required.
   - `expected_behavior`: On success, readable sequence becomes old sequence plus `src`; count increases by `src.len`. If fixed-capacity insufficient, returns `OutOfMemory`.
   - `edge_cases_covered`: empty source, full buffer, dynamic growth, wrapped tail.
   - `why_this_is_Zig_derived`: Calls `ensureUnusedCapacity(src.len)` then `writeAssumeCapacity(src)`.
   - `ambiguities_or_assumptions`: None beyond allocator failure.

27. `theorem_id`: `LF_027_rewind_internal`
   - `source_file`: `src/collections/linear_fifo.zig`
   - `source_reference`: `lines 331-343`
   - `statement`: `rewind(n)` makes `n` positions available before the current read location.
   - `preconditions`: `writableLength() >= n`.
   - `expected_behavior`: Head moves backward by `n` modulo capacity/mask; count increases by `n`.
   - `edge_cases_covered`: `n == 0`, wrap-around to end of buffer.
   - `why_this_is_Zig_derived`: Computes `head + (buf.len - n)`, wraps, assigns head, increments count.
   - `ambiguities_or_assumptions`: Internal helper; newly readable contents are not initialized by `rewind` itself.

28. `theorem_id`: `LF_028_unget`
   - `source_file`: `src/collections/linear_fifo.zig`
   - `source_reference`: `lines 345-359`
   - `statement`: `unget(src)` prepends `src` to the readable stream.
   - `preconditions`: Capacity can be ensured for `src.len`; allocation succeeds if needed.
   - `expected_behavior`: On success, readable sequence becomes `src + old_readable_sequence`; count increases by `src.len`.
   - `edge_cases_covered`: empty `src`, prepending to empty FIFO, prepending across wrap boundary.
   - `why_this_is_Zig_derived`: Ensures capacity, rewinds by `src.len`, then copies `src` into the new readable region.
   - `ambiguities_or_assumptions`: If `src.len < slice.len`, Zig copies into a larger slice; this assumes `bun.copy` copies source length or equivalent safe semantics.

29. `theorem_id`: `LF_029_peek_item`
   - `source_file`: `src/collections/linear_fifo.zig`
   - `source_reference`: `lines 361-373`
   - `statement`: `peekItem(offset)` returns the readable item at logical offset without mutation.
   - `preconditions`: `offset < count`.
   - `expected_behavior`: Returns logical readable sequence element at `offset`; state unchanged.
   - `edge_cases_covered`: offset zero, last valid offset, wrapped physical index.
   - `why_this_is_Zig_derived`: Asserts bound, computes wrapped physical index, returns `buf[index]`.
   - `ambiguities_or_assumptions`: Invalid offset is assertion failure.

30. `theorem_id`: `LF_030_peek_item_mut`
   - `source_file`: `src/collections/linear_fifo.zig`
   - `source_reference`: `lines 375-387`
   - `statement`: `peekItemMut(offset)` returns a mutable reference to the readable item at logical offset.
   - `preconditions`: `offset < count`.
   - `expected_behavior`: Mutating the returned reference changes that logical readable item and no other logical item.
   - `edge_cases_covered`: offset zero, wrapped physical index.
   - `why_this_is_Zig_derived`: Computes same index as `peekItem` and returns `&self.buf[index]`.
   - `ambiguities_or_assumptions`: Dafny model may represent this as a `poke_item` operation rather than reference aliasing.

31. `theorem_id`: `LF_031_ordered_remove_zero`
   - `source_file`: `src/collections/linear_fifo.zig`
   - `source_reference`: `lines 389-392`
   - `statement`: `orderedRemoveItem(0)` is equivalent to discarding one item.
   - `preconditions`: `count >= 1`.
   - `expected_behavior`: Removes the first readable item; preserves order of remaining items; count decreases by one.
   - `edge_cases_covered`: singleton FIFO.
   - `why_this_is_Zig_derived`: Immediate branch `if (offset == 0) return self.discard(1)`.
   - `ambiguities_or_assumptions`: If `count == 0`, this reaches `discard(1)` and asserts.

32. `theorem_id`: `LF_032_ordered_remove_nonzero`
   - `source_file`: `src/collections/linear_fifo.zig`
   - `source_reference`: `lines 389-421`
   - `statement`: `orderedRemoveItem(offset)` for nonzero offset removes that logical item and shifts later items forward.
   - `preconditions`: `0 < offset < count`.
   - `expected_behavior`: Readable sequence becomes `old[..offset] + old[offset+1..]`; count decreases by one.
   - `edge_cases_covered`: contiguous buffer, wrapped buffer with removed item before head, wrapped buffer with removed item after head, removing last item.
   - `why_this_is_Zig_derived`: Branches copy the following physical items over the removed slot and then decrement `count`.
   - `ambiguities_or_assumptions`: Physical copy ranges are complex; theorem states intended observable FIFO behavior.

33. `theorem_id`: `LF_033_pump`
   - `source_file`: `src/collections/linear_fifo.zig`
   - `source_reference`: `lines 423-440`
   - `statement`: `pump` transfers all source-reader data through the FIFO to the destination writer until EOF, then flushes remaining buffered data.
   - `preconditions`: `buf.len > 0`; reader/writer operations succeed or errors propagate.
   - `expected_behavior`: Reads into writable slices while space exists; writes readable slices to destination; stops reading when source returns `0`; exits with FIFO empty after flushing.
   - `edge_cases_covered`: EOF immediately, partial writes, full intermediate buffer.
   - `why_this_is_Zig_derived`: Loop reads until `n == 0`, discards bytes written, then second loop drains readable data.
   - `ambiguities_or_assumptions`: Current Dafny model may not include reader/writer I/O effects.

34. `theorem_id`: `LF_034_invalid_assertion_cases`
   - `source_file`: `src/collections/linear_fifo.zig`
   - `source_reference`: `lines 111, 175, 275, 282, 333, 364, 378, 393, 427`
   - `statement`: Several operations have caller obligations enforced by assertions rather than recoverable errors.
   - `preconditions`: Invalid calls include `shrink(size < count)`, `discard(n > count)`, `update(count+n > capacity)`, `writeAssumeCapacity(src)` without capacity, `rewind(n)` without capacity, `peekItem/peekItemMut(offset >= count)`, `orderedRemoveItem(offset >= count && offset != 0)`, and `pump` with zero-capacity buffer.
   - `expected_behavior`: In assert-enabled/safe builds these terminate/trap; they are not normal return cases.
   - `edge_cases_covered`: invalid offset, invalid capacity, zero-capacity pump.
   - `why_this_is_Zig_derived`: Each obligation appears as `assert(...)`.
   - `ambiguities_or_assumptions`: Release behavior with disabled assertions may be undefined or trap later; model should treat these as preconditions.

35. `theorem_id`: `LF_035_reader_writer_adapters`
   - `source_file`: `src/collections/linear_fifo.zig`
   - `source_reference`: `lines 40-41, 228-235, 320-328`
   - `statement`: Reader and writer adapters forward to FIFO `read` and `write`.
   - `preconditions`: Adapter created from a live FIFO.
   - `expected_behavior`: `reader().read` returns same count/effects as `read`; `writer().write` appends all bytes on success and returns `bytes.len`.
   - `edge_cases_covered`: zero-byte read/write, insufficient fixed capacity for writer.
   - `why_this_is_Zig_derived`: `readFn` returns `self.read(dest)`; `appendWrite` calls `self.write(bytes)` then returns `bytes.len`.
   - `ambiguities_or_assumptions`: Generic model may not specialize `T == u8` adapter behavior.
