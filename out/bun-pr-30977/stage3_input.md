dataset_id: bun-pr-30977
expected_bug_slug: assert_side_effect_lost_in_debug_assert
bug_summary: A side-effecting Zig assert(...) became debug_assert!(...), so release builds skipped the side effect and broke dev-server initialization.
rust_selector: @src/runtime/bake/DevServer.rs::init
zig_semantic_anchor: init
notes: PR 30977 hoists a side effect out of debug_assert inside init.

theorem_packets:
1. `theorem_id`: `entry_empty_has_no_entries`
   - `source_file`: `src/runtime/bake/DevServer.zig`
   - `source_reference`: `EntryPointList.empty`
   - `statement`: A newly empty `EntryPointList` contains no entry-point mappings.
   - `preconditions`: Use `EntryPointList.empty`.
   - `expected_behavior`: `set` is initialized as an empty `StringArrayHashMapUnmanaged`.
   - `edge_cases_covered`: Empty input/state.
   - `why_this_is_Zig_derived`: `pub const empty: EntryPointList = .{ .set = .{} };`
   - `ambiguities_or_assumptions`: Assumes Dafny map emptiness corresponds to Zig `.{} ` hash map state.

2. `theorem_id`: `entry_append_new_no_flags`
   - `source_file`: `src/runtime/bake/DevServer.zig`
   - `source_reference`: `EntryPointList.append`
   - `statement`: Appending a previously absent path with no flags stores that path with all flags false.
   - `preconditions`: `abs_path` not already present; `flags == .{}`.
   - `expected_behavior`: Map contains `abs_path` with `client=false`, `server=false`, `ssr=false`, `css=false`.
   - `edge_cases_covered`: No-flag behavior; singleton insertion.
   - `why_this_is_Zig_derived`: In the `else` branch, `gop.value_ptr.* = flags`.
   - `ambiguities_or_assumptions`: Zig does not reject no-flag append, though higher-level callers may not use it.

3. `theorem_id`: `entry_append_new_preserves_given_flags`
   - `source_file`: `src/runtime/bake/DevServer.zig`
   - `source_reference`: `EntryPointList.append`
   - `statement`: Appending a previously absent path stores exactly the supplied flag bitset.
   - `preconditions`: `abs_path` not already present; supplied `Flags` value is well-formed.
   - `expected_behavior`: Map value for `abs_path` equals `flags`.
   - `edge_cases_covered`: Singleton insertion; arbitrary valid flag combination.
   - `why_this_is_Zig_derived`: New entries execute `gop.value_ptr.* = flags`.
   - `ambiguities_or_assumptions`: “Well-formed” excludes corrupt packed values with nonzero `unused` bits.

4. `theorem_id`: `entry_append_existing_bitwise_or`
   - `source_file`: `src/runtime/bake/DevServer.zig`
   - `source_reference`: `EntryPointList.append`
   - `statement`: Appending an existing path unions old and new flags by bitwise OR.
   - `preconditions`: `abs_path` already exists with value `old`; new value is `flags`.
   - `expected_behavior`: Stored value becomes `old OR flags`.
   - `edge_cases_covered`: Duplicate path; flag merging.
   - `why_this_is_Zig_derived`: Existing branch computes `@bitCast(old) | @bitCast(flags)`.
   - `ambiguities_or_assumptions`: Dafny model should treat each boolean flag as monotonic OR.

5. `theorem_id`: `entry_append_existing_no_flags_noop`
   - `source_file`: `src/runtime/bake/DevServer.zig`
   - `source_reference`: `EntryPointList.append`
   - `statement`: Appending an existing path with no flags leaves its stored flags unchanged.
   - `preconditions`: `abs_path` already exists; `flags == .{}`.
   - `expected_behavior`: Stored value remains equal to previous value.
   - `edge_cases_covered`: No-flag duplicate behavior.
   - `why_this_is_Zig_derived`: Bitwise OR with zero-valued flags is identity.
   - `ambiguities_or_assumptions`: Assumes `.{} ` encodes all flag bits as zero.

6. `theorem_id`: `entry_append_idempotent_same_flags`
   - `source_file`: `src/runtime/bake/DevServer.zig`
   - `source_reference`: `EntryPointList.append`
   - `statement`: Re-appending the same path with the same flags is idempotent.
   - `preconditions`: Same `abs_path` appended twice with same well-formed `flags`.
   - `expected_behavior`: Final stored flags equal `flags`.
   - `edge_cases_covered`: Duplicate singleton path.
   - `why_this_is_Zig_derived`: `flags OR flags == flags`.
   - `ambiguities_or_assumptions`: None beyond normal boolean-bit interpretation.

7. `theorem_id`: `entry_append_same_path_order_independent`
   - `source_file`: `src/runtime/bake/DevServer.zig`
   - `source_reference`: `EntryPointList.append`
   - `statement`: For a single path, the final flags are independent of append order.
   - `preconditions`: Same `abs_path`; finite sequence of well-formed flag values.
   - `expected_behavior`: Final value is the OR of all supplied flags.
   - `edge_cases_covered`: Multiple duplicate appends; mixed flag combinations.
   - `why_this_is_Zig_derived`: Existing entries only combine by bitwise OR.
   - `ambiguities_or_assumptions`: Ignores allocation failure ordering.

8. `theorem_id`: `entry_append_distinct_paths_independent`
   - `source_file`: `src/runtime/bake/DevServer.zig`
   - `source_reference`: `EntryPointList.append`
   - `statement`: Appending one path does not alter flags for a different path.
   - `preconditions`: `path_a != path_b`.
   - `expected_behavior`: Operations on `path_a` only affect the `path_a` map entry.
   - `edge_cases_covered`: Multiple-entry map behavior.
   - `why_this_is_Zig_derived`: `getOrPut(alloc, abs_path)` selects only the keyed entry.
   - `ambiguities_or_assumptions`: Relies on hash map key equality by string contents.

9. `theorem_id`: `entry_appendjs_server_flag`
   - `source_file`: `src/runtime/bake/DevServer.zig`
   - `source_reference`: `EntryPointList.appendJs`
   - `statement`: `appendJs(..., .server)` appends the path with only `server=true`.
   - `preconditions`: Call `appendJs` with `side == .server`.
   - `expected_behavior`: Delegates to `append(..., .{ .server = true })`.
   - `edge_cases_covered`: Valid JS server graph flag case.
   - `why_this_is_Zig_derived`: Switch arm `.server => .{ .server = true }`.
   - `ambiguities_or_assumptions`: Existing-path behavior still uses OR merge.

10. `theorem_id`: `entry_appendjs_client_flag`
    - `source_file`: `src/runtime/bake/DevServer.zig`
    - `source_reference`: `EntryPointList.appendJs`
    - `statement`: `appendJs(..., .client)` appends the path with only `client=true`.
    - `preconditions`: Call `appendJs` with `side == .client`.
    - `expected_behavior`: Delegates to `append(..., .{ .client = true })`.
    - `edge_cases_covered`: Valid JS client graph flag case.
    - `why_this_is_Zig_derived`: Switch arm `.client => .{ .client = true }`.
    - `ambiguities_or_assumptions`: Existing-path behavior still uses OR merge.

11. `theorem_id`: `entry_appendjs_ssr_flag`
    - `source_file`: `src/runtime/bake/DevServer.zig`
    - `source_reference`: `EntryPointList.appendJs`
    - `statement`: `appendJs(..., .ssr)` appends the path with only `ssr=true`.
    - `preconditions`: Call `appendJs` with `side == .ssr`.
    - `expected_behavior`: Delegates to `append(..., .{ .ssr = true })`.
    - `edge_cases_covered`: Valid JS SSR graph flag case.
    - `why_this_is_Zig_derived`: Switch arm `.ssr => .{ .ssr = true }`.
    - `ambiguities_or_assumptions`: Existing-path behavior still uses OR merge.

12. `theorem_id`: `entry_appendcss_sets_client_and_css`
    - `source_file`: `src/runtime/bake/DevServer.zig`
    - `source_reference`: `EntryPointList.appendCss`
    - `statement`: `appendCss` always requests both client bundling and CSS treatment.
    - `preconditions`: Call `appendCss(abs_path)`.
    - `expected_behavior`: Delegates to `append(..., .{ .client = true, .css = true })`.
    - `edge_cases_covered`: CSS flag combination.
    - `why_this_is_Zig_derived`: `appendCss` passes exactly those two flags.
    - `ambiguities_or_assumptions`: Existing path may additionally retain prior `server` or `ssr`.

13. `theorem_id`: `entry_css_implies_client_only_by_caller_convention`
    - `source_file`: `src/runtime/bake/DevServer.zig`
    - `source_reference`: `EntryPointList.Flags`, `EntryPointList.appendCss`, `EntryPointList.append`
    - `statement`: Zig documents that `css` should imply `client`, but only `appendCss` enforces this convention.
    - `preconditions`: Compare direct `append` versus `appendCss`.
    - `expected_behavior`: `appendCss` produces `css=true, client=true`; direct `append` can store `css=true, client=false` if given such flags.
    - `edge_cases_covered`: Invalid/unsupported flag combination.
    - `why_this_is_Zig_derived`: Comment says “When this is set, also set .client = true”; `append` performs no validation.
    - `ambiguities_or_assumptions`: Such direct invalid combinations may be caller-bug behavior rather than intended public behavior.

14. `theorem_id`: `entry_unused_flag_bits_have_no_valid_constructor`
    - `source_file`: `src/runtime/bake/DevServer.zig`
    - `source_reference`: `EntryPointList.Flags`
    - `statement`: Valid Zig flag values have `unused == .unused`, i.e. zero unused bits.
    - `preconditions`: Flags created through Zig struct literals or helper functions.
    - `expected_behavior`: Unused bits remain zero.
    - `edge_cases_covered`: Invalid flag-space exclusion.
    - `why_this_is_Zig_derived`: `unused: enum(u4) { unused = 0 } = .unused`.
    - `ambiguities_or_assumptions`: Corrupt values from `@bitCast` are outside normal caller obligations.

15. `theorem_id`: `entry_append_no_invalid_flag_runtime_check`
    - `source_file`: `src/runtime/bake/DevServer.zig`
    - `source_reference`: `EntryPointList.append`
    - `statement`: `append` has no explicit runtime branch that rejects invalid flag combinations.
    - `preconditions`: Caller supplies a `Flags` value.
    - `expected_behavior`: Function either inserts/ORs the bits or returns allocation error; it does not validate semantic combinations.
    - `edge_cases_covered`: Invalid flag termination behavior.
    - `why_this_is_Zig_derived`: Body only calls `getOrPut`, then assignment or bitwise OR.
    - `ambiguities_or_assumptions`: Zig safety rules for impossible enum bit patterns are outside modeled normal behavior.

16. `theorem_id`: `entry_append_return_meaning`
    - `source_file`: `src/runtime/bake/DevServer.zig`
    - `source_reference`: `EntryPointList.append`
    - `statement`: Successful append returns `void`; failure is only through propagated allocation/hash-map error.
    - `preconditions`: Call `append`.
    - `expected_behavior`: On success, map is updated as specified; on error, Zig propagates `try entry_points.set.getOrPut`.
    - `edge_cases_covered`: Termination behavior.
    - `why_this_is_Zig_derived`: Function signature is `!void`; only fallible operation is `try getOrPut`.
    - `ambiguities_or_assumptions`: Exact post-state on allocator failure depends on hash map failure atomicity, not shown here.

17. `theorem_id`: `entry_keys_are_borrowed`
    - `source_file`: `src/runtime/bake/DevServer.zig`
    - `source_reference`: `EntryPointList.append`; `TestingBatch.entry_points` comment
    - `statement`: Entry-point keys are treated as borrowed slices, not duplicated by `append`.
    - `preconditions`: Call `append` with `abs_path`.
    - `expected_behavior`: Caller must ensure path bytes remain valid for the lifetime of the map entry.
    - `edge_cases_covered`: Caller obligation; lifetime robustness.
    - `why_this_is_Zig_derived`: `append` passes `abs_path` directly to `getOrPut`; TestingBatch comment states keys are borrowed.
    - `ambiguities_or_assumptions`: Depends on `StringArrayHashMapUnmanaged` storing the supplied slice.

18. `theorem_id`: `htmlrouter_empty_has_no_map_and_no_fallback`
    - `source_file`: `src/runtime/bake/DevServer.zig`
    - `source_reference`: `HTMLRouter.empty`
    - `statement`: An empty `HTMLRouter` has an empty exact-route map and no fallback route.
    - `preconditions`: Use `HTMLRouter.empty`.
    - `expected_behavior`: `map == .empty`; `fallback == null`.
    - `edge_cases_covered`: Empty router state.
    - `why_this_is_Zig_derived`: `pub const empty = .{ .map = .empty, .fallback = null }`.
    - `ambiguities_or_assumptions`: None.

19. `theorem_id`: `htmlrouter_put_catchall_sets_fallback`
    - `source_file`: `src/runtime/bake/DevServer.zig`
    - `source_reference`: `HTMLRouter.put`
    - `statement`: Putting path `"/*"` stores the route as fallback, not as an exact map entry.
    - `preconditions`: `path == "/*"`.
    - `expected_behavior`: `fallback = route`; map is not modified by this branch.
    - `edge_cases_covered`: Special delimiter/catch-all route.
    - `why_this_is_Zig_derived`: `if (bun.strings.eqlComptime(path, "/*")) router.fallback = route`.
    - `ambiguities_or_assumptions`: Repeated fallback puts overwrite the prior fallback.

20. `theorem_id`: `htmlrouter_put_non_catchall_sets_exact_map`
    - `source_file`: `src/runtime/bake/DevServer.zig`
    - `source_reference`: `HTMLRouter.put`
    - `statement`: Putting any path other than `"/*"` stores it in the exact-route map.
    - `preconditions`: `path != "/*"`.
    - `expected_behavior`: `map[path] = route`; fallback unchanged.
    - `edge_cases_covered`: Singleton and non-catch-all route insertion.
    - `why_this_is_Zig_derived`: `else try router.map.put(alloc, path, route)`.
    - `ambiguities_or_assumptions`: Hash-map replacement semantics for duplicate path are imported behavior.

21. `theorem_id`: `htmlrouter_get_exact_precedes_fallback`
    - `source_file`: `src/runtime/bake/DevServer.zig`
    - `source_reference`: `HTMLRouter.get`
    - `statement`: Exact route lookup takes precedence over fallback.
    - `preconditions`: `map` contains `path`; `fallback` may or may not be set.
    - `expected_behavior`: Returns `map[path]`.
    - `edge_cases_covered`: Exact route plus catch-all conflict.
    - `why_this_is_Zig_derived`: `return router.map.get(path) orelse router.fallback`.
    - `ambiguities_or_assumptions`: None.

22. `theorem_id`: `htmlrouter_get_fallback_when_no_exact`
    - `source_file`: `src/runtime/bake/DevServer.zig`
    - `source_reference`: `HTMLRouter.get`
    - `statement`: If no exact route exists, lookup returns fallback if present.
    - `preconditions`: `map.get(path) == null`; `fallback != null`.
    - `expected_behavior`: Returns `fallback`.
    - `edge_cases_covered`: Catch-all routing.
    - `why_this_is_Zig_derived`: `orelse router.fallback`.
    - `ambiguities_or_assumptions`: None.

23. `theorem_id`: `htmlrouter_get_null_when_no_exact_and_no_fallback`
    - `source_file`: `src/runtime/bake/DevServer.zig`
    - `source_reference`: `HTMLRouter.get`
    - `statement`: If neither exact route nor fallback exists, lookup returns null.
    - `preconditions`: `map.get(path) == null`; `fallback == null`.
    - `expected_behavior`: Returns `null`.
    - `edge_cases_covered`: Miss behavior; empty router lookup.
    - `why_this_is_Zig_derived`: `map.get(path) orelse fallback`.
    - `ambiguities_or_assumptions`: None.

24. `theorem_id`: `htmlrouter_clear_removes_all_routes`
    - `source_file`: `src/runtime/bake/DevServer.zig`
    - `source_reference`: `HTMLRouter.clear`
    - `statement`: Clearing an `HTMLRouter` removes exact routes and fallback.
    - `preconditions`: Any router state.
    - `expected_behavior`: Map is cleared retaining capacity; `fallback = null`.
    - `edge_cases_covered`: Reset behavior.
    - `why_this_is_Zig_derived`: `router.map.clearRetainingCapacity(); router.fallback = null;`
    - `ambiguities_or_assumptions`: Capacity retention is likely irrelevant to Dafny behavioral model.

25. `theorem_id`: `parsehex_valid_exact_length_returns_bitcast`
    - `source_file`: `src/runtime/bake/DevServer.zig`
    - `source_reference`: `parseHexToInt`
    - `statement`: A valid hex string of exactly `2 * @sizeOf(T)` characters decodes to bytes and returns `@bitCast(out)`.
    - `preconditions`: `slice` is valid hex; decoded byte count is `@sizeOf(T)`.
    - `expected_behavior`: Returns non-null integer value represented by decoded bytes.
    - `edge_cases_covered`: Boundary exact length.
    - `why_this_is_Zig_derived`: Calls `std.fmt.hexToBytes(&out, slice)` and returns `@bitCast(out)`.
    - `ambiguities_or_assumptions`: Endianness follows Zig memory representation via `@bitCast`.

26. `theorem_id`: `parsehex_invalid_hex_returns_null`
    - `source_file`: `src/runtime/bake/DevServer.zig`
    - `source_reference`: `parseHexToInt`
    - `statement`: Invalid hex input returns null.
    - `preconditions`: `std.fmt.hexToBytes` fails for `slice`.
    - `expected_behavior`: Returns `null`.
    - `edge_cases_covered`: Invalid character; invalid length.
    - `why_this_is_Zig_derived`: `catch return null`.
    - `ambiguities_or_assumptions`: If `hexToBytes` were to succeed with unexpected length, Zig asserts; normal library behavior should not do that.

27. `theorem_id`: `extract_pathname_absolute_url_with_path`
    - `source_file`: `src/runtime/bake/DevServer.zig`
    - `source_reference`: `extractPathnameFromUrl`
    - `statement`: For a URL containing `://` and a following slash path, the function returns the path portion without query or hash.
    - `preconditions`: Input like `scheme://host/path?query#hash`.
    - `expected_behavior`: Returns `/path`, ending before earliest `?` or `#`.
    - `edge_cases_covered`: Protocol stripping; query/hash trimming.
    - `why_this_is_Zig_derived`: Slices after `://`, finds first `/`, then truncates at min query/hash index.
    - `ambiguities_or_assumptions`: Does not parse URLs fully; purely byte-pattern based.

28. `theorem_id`: `extract_pathname_path_only_with_query_or_hash`
    - `source_file`: `src/runtime/bake/DevServer.zig`
    - `source_reference`: `extractPathnameFromUrl`
    - `statement`: For a path-only string starting with `/`, query and hash are removed.
    - `preconditions`: Input starts with `/`.
    - `expected_behavior`: Returns slice from `/` through before earliest `?` or `#`.
    - `edge_cases_covered`: No protocol; query/hash trimming.
    - `why_this_is_Zig_derived`: Without `://`, `pathname=url`; first slash at index `0`; trim branch applies.
    - `ambiguities_or_assumptions`: None.

29. `theorem_id`: `extract_pathname_no_slash_returns_remaining_input`
    - `source_file`: `src/runtime/bake/DevServer.zig`
    - `source_reference`: `extractPathnameFromUrl`
    - `statement`: If the post-protocol string contains no `/`, the function returns it unchanged, including query/hash characters.
    - `preconditions`: No slash exists after optional protocol removal.
    - `expected_behavior`: Returns the current `pathname` slice unchanged.
    - `edge_cases_covered`: Boundary malformed URL; no path delimiter.
    - `why_this_is_Zig_derived`: Query/hash trimming occurs only inside the `if indexOfScalar('/', pathname)` branch.
    - `ambiguities_or_assumptions`: This may intentionally feed later validation errors.

30. `theorem_id`: `relative_path_non_absolute_identity`
    - `source_file`: `src/runtime/bake/DevServer.zig`
    - `source_reference`: `relativePath`
    - `statement`: Non-absolute paths are returned unchanged.
    - `preconditions`: `!std.fs.path.isAbsolute(path)`.
    - `expected_behavior`: Return value is exactly `path`.
    - `edge_cases_covered`: Relative input.
    - `why_this_is_Zig_derived`: First branch returns `path`.
    - `ambiguities_or_assumptions`: Caller obligation: `dev.root` must not end in `/`, asserted.

31. `theorem_id`: `relative_path_under_root_strips_root_prefix`
    - `source_file`: `src/runtime/bake/DevServer.zig`
    - `source_reference`: `relativePath`
    - `statement`: Absolute paths directly under `dev.root` return the suffix after `root/`.
    - `preconditions`: `path` absolute; `path` starts with `dev.root`; byte at `path[dev.root.len] == '/'`.
    - `expected_behavior`: Returns `path[dev.root.len + 1 ..]`.
    - `edge_cases_covered`: Root-boundary absolute path.
    - `why_this_is_Zig_derived`: Second branch checks prefix and slash, then slices.
    - `ambiguities_or_assumptions`: Exact root path with no trailing component does not satisfy `len >= root.len + 1`.

32. `theorem_id`: `relative_path_outside_root_platform_relative_posix`
    - `source_file`: `src/runtime/bake/DevServer.zig`
    - `source_reference`: `relativePath`
    - `statement`: Absolute paths not directly under root are converted to a platform-relative path and normalized to POSIX separators.
    - `preconditions`: `path` absolute; prefix branch does not apply.
    - `expected_behavior`: Returns `bun.path.relativePlatformBuf(...)` after in-place `platformToPosixInPlace`.
    - `edge_cases_covered`: Outside-root absolute path.
    - `why_this_is_Zig_derived`: Final branch computes relative path and normalizes separators.
    - `ambiguities_or_assumptions`: Exact relative string depends on platform path rules.

33. `theorem_id`: `read_string32_zero_length`
    - `source_file`: `src/runtime/bake/DevServer.zig`
    - `source_reference`: `readString32`
    - `statement`: If the encoded length is zero, the function allocates a zero-length byte slice and reads no payload bytes.
    - `preconditions`: Reader first returns little-endian `u32` value `0`.
    - `expected_behavior`: Returns an empty slice unless allocator/read fails.
    - `edge_cases_covered`: Empty string payload.
    - `why_this_is_Zig_derived`: Reads `len`, allocates `alloc.alloc(u8, len)`, then `readNoEof(memory)`.
    - `ambiguities_or_assumptions`: Exact zero-sized allocation representation is allocator-specific.

34. `theorem_id`: `read_string32_reads_exact_length`
    - `source_file`: `src/runtime/bake/DevServer.zig`
    - `source_reference`: `readString32`
    - `statement`: For length `n`, the function returns exactly the next `n` bytes from the reader.
    - `preconditions`: Reader supplies little-endian length `n`; allocation succeeds; at least `n` bytes available.
    - `expected_behavior`: Returned slice length is `n` and contents equal the next `n` reader bytes.
    - `edge_cases_covered`: Boundary-length payloads.
    - `why_this_is_Zig_derived`: Allocates `len` bytes and calls `reader.readNoEof(memory)`.
    - `ambiguities_or_assumptions`: Reader semantics are imported.

35. `theorem_id`: `read_string32_error_propagation`
    - `source_file`: `src/runtime/bake/DevServer.zig`
    - `source_reference`: `readString32`
    - `statement`: Length-read, allocation, and payload-read errors are propagated.
    - `preconditions`: Any of `readInt`, `alloc`, or `readNoEof` fails.
    - `expected_behavior`: Function returns the corresponding error.
    - `edge_cases_covered`: Early-exit/termination behavior.
    - `why_this_is_Zig_derived`: Each operation is prefixed with `try`; allocated memory is freed on later error via `errdefer`.
    - `ambiguities_or_assumptions`: Error set depends on concrete reader and allocator.