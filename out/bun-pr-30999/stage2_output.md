1. `theorem_id`: `EXP_INIT_DEFAULT_STATE`
   - `source_file`: `/home/saint/bun/src/runtime/shell/states/Expansion.zig`
   - `source_reference`: `init`, lines 126-150
   - `statement`: Initializing an `Expansion` sets it to normal, idle, first-word state with empty output buffer.
   - `preconditions`: `init` is called with valid interpreter, shell state, atom node, parent, result target, and IO.
   - `expected_behavior`: `word_idx == 0`, `state == normal`, `child_state == idle`, `out == out_result`, `out_idx == 0`, `io == io`, and `current_out` is initialized with the expansion allocator.
   - `edge_cases_covered`: Fresh expansion before any atoms are processed.
   - `why_this_is_Zig_derived`: Direct field assignment in `init`.
   - `ambiguities_or_assumptions`: Assumes allocator initialization succeeds or OOM aborts via Bun OOM handling.

2. `theorem_id`: `EXP_START_REQUIRES_IDLE_FIRST_WORD`
   - `source_file`: `/home/saint/bun/src/runtime/shell/states/Expansion.zig`
   - `source_reference`: `start`, lines 159-167
   - `statement`: Starting an expansion resets state to `normal` and yields the expansion itself.
   - `preconditions`: In assert-enabled builds, `child_state == idle` and `word_idx == 0`.
   - `expected_behavior`: `state == normal`; return value is `{ .expansion = this }`.
   - `edge_cases_covered`: Start called on a freshly initialized expansion.
   - `why_this_is_Zig_derived`: `start` asserts idle/zero index, assigns `.normal`, returns expansion yield.
   - `ambiguities_or_assumptions`: Assertions may be compiled out depending on `bun.Environment.allow_assert`.

3. `theorem_id`: `EXP_DEINIT_RELEASES_RESOURCES`
   - `source_file`: `/home/saint/bun/src/runtime/shell/states/Expansion.zig`
   - `source_reference`: `deinit`, lines 152-157
   - `statement`: Deinitializing an expansion releases `current_out`, `io`, and ends the allocation scope.
   - `preconditions`: Expansion was previously initialized.
   - `expected_behavior`: Calls `current_out.deinit()`, `io.deinit()`, and `base.endScope()`.
   - `edge_cases_covered`: Cleanup after success, error, or suspension.
   - `why_this_is_Zig_derived`: Direct calls in `deinit`.
   - `ambiguities_or_assumptions`: No return value; behavior is resource effect only.

4. `theorem_id`: `EXP_NO_FLAG_PLAIN_TEXT_SINGLE_OUTPUT`
   - `source_file`: `/home/saint/bun/src/runtime/shell/states/Expansion.zig`
   - `source_reference`: `next`, lines 169-220; `expandSimpleNoIO`, lines 597-644; `pushCurrentOut`, lines 651-662
   - `statement`: A simple or compound atom containing only ordinary text and no brace/glob/cmd-substitution syntax expands to one output equal to concatenated text.
   - `preconditions`: Node has atoms, no brace expansion, no glob expansion, no command substitution, no variable/tilde special cases unless included as literal text.
   - `expected_behavior`: Text bytes are appended to `current_out`, a trailing NUL sentinel is appended, result is pushed once, state becomes `done`, and parent is notified with exit code `0`.
   - `edge_cases_covered`: Baseline no-flag behavior.
   - `why_this_is_Zig_derived`: Normal state processes atoms, skips brace/glob branches, calls `pushCurrentOut`, then returns `parent.childDone(this, 0)`.
   - `ambiguities_or_assumptions`: “No flag” here means no AST flags for brace/glob/tilde/cmd substitution.

5. `theorem_id`: `EXP_EMPTY_UNQUOTED_OUTPUT_DROPPED`
   - `source_file`: `/home/saint/bun/src/runtime/shell/states/Expansion.zig`
   - `source_reference`: `pushCurrentOut`, lines 651-653
   - `statement`: Empty expansion output is not pushed when no quoted-empty atom was seen.
   - `preconditions`: `current_out.items.len == 0` and `has_quoted_empty == false`.
   - `expected_behavior`: `pushCurrentOut` returns without mutating the result target.
   - `edge_cases_covered`: Empty word, unset variable expanding to empty, command substitution yielding only trimmed whitespace.
   - `why_this_is_Zig_derived`: First guard in `pushCurrentOut`.
   - `ambiguities_or_assumptions`: Atom-level parser behavior for truly empty words is outside this file.

6. `theorem_id`: `EXP_QUOTED_EMPTY_PRESERVED_AS_EMPTY_ARG`
   - `source_file`: `/home/saint/bun/src/runtime/shell/states/Expansion.zig`
   - `source_reference`: field comment lines 39-41; `expandSimpleNoIO`, lines 603-607; `pushCurrentOut`, lines 651-654
   - `statement`: A quoted empty atom causes an empty expansion result to be preserved.
   - `preconditions`: At least one `.quoted_empty` atom is processed and no other bytes are appended.
   - `expected_behavior`: `has_quoted_empty == true`; `pushCurrentOut` appends a NUL sentinel and pushes an empty string result.
   - `edge_cases_covered`: `""`, `''`, `${''}`.
   - `why_this_is_Zig_derived`: `.quoted_empty` sets `has_quoted_empty`; `pushCurrentOut` only drops empty output when this flag is false.
   - `ambiguities_or_assumptions`: Exact parser mapping of quoted syntax to `.quoted_empty` is assumed.

7. `theorem_id`: `EXP_RESULT_ARRAY_OF_SLICE_MOVES_SENTINEL_SLICE`
   - `source_file`: `/home/saint/bun/src/runtime/shell/states/Expansion.zig`
   - `source_reference`: `Result.pushResult`, lines 95-104; `Result.pushResultSliceOwned`, lines 72-81
   - `statement`: Pushing into `array_of_slice` appends a sentinel-terminated slice excluding the sentinel from length and returns `moved`.
   - `preconditions`: Result variant is `.array_of_slice`; buffer/slice has NUL sentinel.
   - `expected_behavior`: Output list receives `buf.items[0 .. len-1 :0]` or owned sentinel slice; push action is `.moved`.
   - `edge_cases_covered`: Normal result collection for argument arrays.
   - `why_this_is_Zig_derived`: Direct switch branch behavior.
   - `ambiguities_or_assumptions`: Assert checks sentinel only when assertions enabled.

8. `theorem_id`: `EXP_RESULT_ARRAY_OF_PTR_MOVES_POINTER`
   - `source_file`: `/home/saint/bun/src/runtime/shell/states/Expansion.zig`
   - `source_reference`: `Result.pushResult`, lines 95-107; `Result.pushResultSliceOwned`, lines 72-85
   - `statement`: Pushing into `array_of_ptr` appends the sentinel pointer and returns `moved`.
   - `preconditions`: Result variant is `.array_of_ptr`; input is NUL-terminated.
   - `expected_behavior`: Output pointer array receives a `[*:0]const u8` pointer to the buffer; push action is `.moved`.
   - `edge_cases_covered`: argv-style pointer output.
   - `why_this_is_Zig_derived`: Direct switch branch behavior.
   - `ambiguities_or_assumptions`: Lifetime ownership is managed by caller according to `.moved`.

9. `theorem_id`: `EXP_RESULT_SINGLE_ACCEPTS_ONLY_FIRST_PUSH`
   - `source_file`: `/home/saint/bun/src/runtime/shell/states/Expansion.zig`
   - `source_reference`: `Result.pushResult`, lines 109-112; `Result.pushResultSliceOwned`, lines 86-90
   - `statement`: A `single` result records only the first pushed result.
   - `preconditions`: Result variant is `.single`.
   - `expected_behavior`: If `single.done == false`, bytes including sentinel are copied and `done` becomes true for `pushResultSliceOwned`; later pushes return `.copied` without appending.
   - `edge_cases_covered`: Brace/glob producing multiple outputs into single-result target.
   - `why_this_is_Zig_derived`: `.single` branches check `done`.
   - `ambiguities_or_assumptions`: In `pushResult`, Zig copies bytes but does not set `done`; this appears intentional or a possible bug, but theorem should mirror source exactly.

10. `theorem_id`: `EXP_SIMPLE_TEXT_APPENDS_BYTES`
    - `source_file`: `/home/saint/bun/src/runtime/shell/states/Expansion.zig`
    - `source_reference`: `expandSimpleNoIO`, lines 599-602
    - `statement`: A `.Text` simple atom appends its bytes unchanged.
    - `preconditions`: Atom is `.Text(txt)`.
    - `expected_behavior`: `txt` is appended to the target byte list; function returns `false`.
    - `edge_cases_covered`: Empty text slice, non-empty text slice.
    - `why_this_is_Zig_derived`: Direct `.Text` switch branch.
    - `ambiguities_or_assumptions`: Encoding is not interpreted here.

11. `theorem_id`: `EXP_SIMPLE_META_ATOMS_APPEND_LITERAL_CHARS`
    - `source_file`: `/home/saint/bun/src/runtime/shell/states/Expansion.zig`
    - `source_reference`: `expandSimpleNoIO`, lines 614-628
    - `statement`: Parsed meta atoms append their literal shell characters before later brace/glob handling.
    - `preconditions`: Atom is `.asterisk`, `.double_asterisk`, `.brace_begin`, `.brace_end`, or `.comma`.
    - `expected_behavior`: Appends respectively `"*"`, `"**"`, `"{"`, `"}"`, or `","`; returns `false`.
    - `edge_cases_covered`: Glob markers and brace markers as bytes in `current_out`.
    - `why_this_is_Zig_derived`: Direct switch branches.
    - `ambiguities_or_assumptions`: Whether these markers trigger glob/brace state depends on AST node flags outside the atom append branch.

12. `theorem_id`: `EXP_VAR_PREFERS_SHELL_ENV_OVER_EXPORT_ENV`
    - `source_file`: `/home/saint/bun/src/runtime/shell/states/Expansion.zig`
    - `source_reference`: `expandSimpleNoIO`, lines 608-610; `expandVar`, lines 664-669
    - `statement`: Variable expansion uses shell-local environment before exported environment.
    - `preconditions`: Atom is `.Var(label)`.
    - `expected_behavior`: If `shell_env[label]` exists, append its value; else if `export_env[label]` exists, append its value; else append empty string.
    - `edge_cases_covered`: Present in both envs, present only exported, unset variable.
    - `why_this_is_Zig_derived`: `expandVar` checks `shell_env.get` before `export_env.get`.
    - `ambiguities_or_assumptions`: Env value lifetime/refcounting is internal and not part of observable theorem.

13. `theorem_id`: `EXP_VAR_UNSET_DOES_NOT_FORCE_ARG`
    - `source_file`: `/home/saint/bun/src/runtime/shell/states/Expansion.zig`
    - `source_reference`: `expandVar`, lines 664-667; `pushCurrentOut`, lines 651-653
    - `statement`: An unset variable expands to empty bytes and does not by itself create an argument.
    - `preconditions`: Atom is `.Var(label)` and `label` absent from both shell and exported env; no quoted-empty and no other output bytes.
    - `expected_behavior`: No bytes appended; final `pushCurrentOut` drops the result.
    - `edge_cases_covered`: `$UNSET` as a standalone word.
    - `why_this_is_Zig_derived`: `expandVar` returns `""`; empty unquoted output is dropped.
    - `ambiguities_or_assumptions`: Shell word splitting outside this expansion state is not considered.

14. `theorem_id`: `EXP_TILDE_SIMPLE_EXPANDS_TO_HOME`
    - `source_file`: `/home/saint/bun/src/runtime/shell/states/Expansion.zig`
    - `source_reference`: `expandSimpleNoIO`, lines 629-635
    - `statement`: A simple tilde atom expands directly to the shell home directory when tilde expansion is enabled.
    - `preconditions`: Atom is `.tilde`; `expand_tilde == true`.
    - `expected_behavior`: Appends `base.shell.getHomedir().slice()`; returns `false`.
    - `edge_cases_covered`: Standalone `~`.
    - `why_this_is_Zig_derived`: `.tilde` branch appends home directory when `expand_tilde`.
    - `ambiguities_or_assumptions`: Actual home directory value comes from shell state.

15. `theorem_id`: `EXP_TILDE_LITERAL_WHEN_DISABLED`
    - `source_file`: `/home/saint/bun/src/runtime/shell/states/Expansion.zig`
    - `source_reference`: `expandSimpleNoIO`, lines 629-635
    - `statement`: A tilde atom is literal `"~"` when tilde expansion is disabled.
    - `preconditions`: Atom is `.tilde`; `expand_tilde == false`.
    - `expected_behavior`: Appends byte `'~'`; returns `false`.
    - `edge_cases_covered`: Helper-level behavior independent of normal expansion flow.
    - `why_this_is_Zig_derived`: Else branch of `.tilde`.
    - `ambiguities_or_assumptions`: Normal callers in this file pass `true`.

16. `theorem_id`: `EXP_COMPOUND_TILDE_SKIP_INITIAL_ATOM`
    - `source_file`: `/home/saint/bun/src/runtime/shell/states/Expansion.zig`
    - `source_reference`: `expandVarAndCmdSubst`, lines 367-376
    - `statement`: For compound words with tilde expansion, the first tilde atom is skipped during initial atom iteration.
    - `preconditions`: Node is compound, `start_word_idx == 0`, and `node.hasTildeExpansion() == true`.
    - `expected_behavior`: `word_idx` is incremented once before iterating from atom index `1`.
    - `edge_cases_covered`: Compound words beginning with tilde.
    - `why_this_is_Zig_derived`: `starting_offset` branch increments `word_idx` and slices from `start_word_idx + 1`.
    - `ambiguities_or_assumptions`: Parser guarantees tilde is first atom per Zig comment.

17. `theorem_id`: `EXP_COMPOUND_TILDE_PREFIX_HOME_FOR_SLASH_OR_BACKSLASH`
    - `source_file`: `/home/saint/bun/src/runtime/shell/states/Expansion.zig`
    - `source_reference`: `next`, lines 185-203
    - `statement`: After processing a compound tilde word with more than one atom, if the accumulated output begins with `/` or `\`, home directory is inserted at the front.
    - `preconditions`: `node.hasTildeExpansion() == true`, `node.atomsLen() > 1`, `current_out.items.len > 0`, and first byte is `/` or `\`.
    - `expected_behavior`: `homedir` bytes are inserted at offset `0`.
    - `edge_cases_covered`: `~/path`, `~\path`.
    - `why_this_is_Zig_derived`: Switch on `current_out.items[0]` inserts home for `/` and `\`.
    - `ambiguities_or_assumptions`: Username tilde expansion is not implemented here.

18. `theorem_id`: `EXP_COMPOUND_TILDE_PREFIX_LITERAL_FOR_NON_SLASH`
    - `source_file`: `/home/saint/bun/src/runtime/shell/states/Expansion.zig`
    - `source_reference`: `next`, lines 185-203
    - `statement`: After processing a compound tilde word with more than one atom, if accumulated output begins with a non-slash byte, a literal `~` is inserted.
    - `preconditions`: `node.hasTildeExpansion() == true`, `node.atomsLen() > 1`, `current_out.items.len > 0`, first byte is neither `/` nor `\`.
    - `expected_behavior`: Byte `'~'` is inserted at offset `0`.
    - `edge_cases_covered`: `~user`-like inputs.
    - `why_this_is_Zig_derived`: Else branch says TODO handle username and inserts `'~'`.
    - `ambiguities_or_assumptions`: Username expansion intentionally unsupported in this source.

19. `theorem_id`: `EXP_TILDE_QUOTED_EMPTY_EXPANDS_HOME`
    - `source_file`: `/home/saint/bun/src/runtime/shell/states/Expansion.zig`
    - `source_reference`: `next`, lines 185-203
    - `statement`: A tilde compound whose remaining output is empty because of quoted empty expands to home.
    - `preconditions`: `node.hasTildeExpansion() == true`, `node.atomsLen() > 1`, `current_out.items.len == 0`, and `has_quoted_empty == true`.
    - `expected_behavior`: Home directory bytes are appended to `current_out`.
    - `edge_cases_covered`: `~""`, `~''`.
    - `why_this_is_Zig_derived`: Explicit `else if (this.has_quoted_empty)` branch.
    - `ambiguities_or_assumptions`: Parser must represent quoted empty after tilde as `.quoted_empty`.

20. `theorem_id`: `EXP_CMD_SUBST_STARTS_SCRIPT_AND_SUSPENDS_PARENT`
    - `source_file`: `/home/saint/bun/src/runtime/shell/states/Expansion.zig`
    - `source_reference`: `expandVarAndCmdSubst`, lines 337-363 and 376-400
    - `statement`: Encountering a command substitution creates a subshell script and yields that script instead of continuing expansion synchronously.
    - `preconditions`: Current simple atom is `.cmd_subst`; `dupeForSubshell` succeeds.
    - `expected_behavior`: Child IO uses root stdin ref, stdout pipe, root stderr ref; child state becomes `.cmd_subst` with quoted flag from atom; returns `script.start()`.
    - `edge_cases_covered`: Simple command substitution, compound command substitution.
    - `why_this_is_Zig_derived`: Both simple and compound branches create IO, duplicate shell state, initialize `Script`, set child state, and return script start.
    - `ambiguities_or_assumptions`: Actual script execution is outside this file.

21. `theorem_id`: `EXP_CMD_SUBST_SUBSHELL_DUP_FAILURE_FAILS`
    - `source_file`: `/home/saint/bun/src/runtime/shell/states/Expansion.zig`
    - `source_reference`: `expandVarAndCmdSubst`, lines 347-353 and 384-390
    - `statement`: Failure to duplicate shell state for command substitution throws a shell syscall error and returns failed yield.
    - `preconditions`: Current atom is `.cmd_subst`; `dupeForSubshell` returns `.err(e)`.
    - `expected_behavior`: IO is dereferenced, `base.throw(ShellErr.newSys(e))` is called, and `.failed` is returned.
    - `edge_cases_covered`: Command substitution setup failure.
    - `why_this_is_Zig_derived`: Error branch in both simple and compound paths.
    - `ambiguities_or_assumptions`: Exact `.failed` propagation semantics are outside this file.

22. `theorem_id`: `EXP_CMD_SUBST_UNQUOTED_NORMALIZES_AND_SPLITS_STDOUT`
    - `source_file`: `/home/saint/bun/src/runtime/shell/states/Expansion.zig`
    - `source_reference`: `childDone`, lines 522-528; `postSubshellExpansion`, lines 420-455; `convertNewlinesToSpaces`, lines 458-484
    - `statement`: Unquoted command substitution removes one trailing newline, converts remaining newlines to spaces, trims leading/trailing whitespace, and splits on runs of spaces by pushing intermediate words.
    - `preconditions`: Child is `Script`; `child_state.cmd_subst.quoted == false`.
    - `expected_behavior`: Processed stdout contributes zero or more output words; spaces trigger `pushCurrentOut`; final segment is appended to `current_out`.
    - `edge_cases_covered`: Empty stdout, only whitespace stdout, stdout with newlines, stdout with consecutive spaces.
    - `why_this_is_Zig_derived`: `childDone` calls `postSubshellExpansion`, whose comments and code implement normalization/trimming/splitting.
    - `ambiguities_or_assumptions`: Only byte `' '` is used for internal split after newline conversion; tabs/carriage returns are trimmed at edges but not internal split delimiters unless already spaces.

23. `theorem_id`: `EXP_CMD_SUBST_QUOTED_TRIMS_RIGHT_ONLY`
    - `source_file`: `/home/saint/bun/src/runtime/shell/states/Expansion.zig`
    - `source_reference`: `childDone`, lines 522-528
    - `statement`: Quoted command substitution appends stdout after trimming only trailing spaces, newlines, tabs, and carriage returns.
    - `preconditions`: Child is `Script`; `child_state.cmd_subst.quoted == true`.
    - `expected_behavior`: `std.mem.trimRight(u8, stdout, " \n\t\r")` is appended to `current_out`; no word splitting is performed.
    - `edge_cases_covered`: Quoted empty output, trailing newline, leading whitespace preserved.
    - `why_this_is_Zig_derived`: Quoted branch in `childDone`.
    - `ambiguities_or_assumptions`: Exact stdout buffer ownership is outside this theorem.

24. `theorem_id`: `EXP_CMD_SUBST_SINGLE_FAILED_COMMAND_PROPAGATES_EXIT_CODE`
    - `source_file`: `/home/saint/bun/src/runtime/shell/states/Expansion.zig`
    - `source_reference`: `childDone`, lines 507-520
    - `statement`: A failed command substitution sets `out_exit_code` only when the entire node is exactly that simple command substitution.
    - `preconditions`: Child is `Script`; `exit_code != 0`; `node.* == .simple`; `node.simple == .cmd_subst`.
    - `expected_behavior`: `out_exit_code == exit_code`.
    - `edge_cases_covered`: `$(bad-command)` used as the whole word/command name.
    - `why_this_is_Zig_derived`: Explicit conditional assignment in `childDone`.
    - `ambiguities_or_assumptions`: How parent `Cmd` uses `out_exit_code` is outside this file.

25. `theorem_id`: `EXP_CMD_SUBST_NON_SINGLE_FAILURE_DOES_NOT_SET_OUT_EXIT_CODE`
    - `source_file`: `/home/saint/bun/src/runtime/shell/states/Expansion.zig`
    - `source_reference`: `childDone`, lines 507-520
    - `statement`: Failed command substitution does not update `out_exit_code` when embedded in a larger compound/simple context.
    - `preconditions`: Child is `Script`; `exit_code != 0`; node is not exactly simple `.cmd_subst`.
    - `expected_behavior`: `out_exit_code` remains unchanged by this branch.
    - `edge_cases_covered`: `a$(bad)`, `$(bad)suffix`, compound words.
    - `why_this_is_Zig_derived`: Assignment is guarded by exact-node condition.
    - `ambiguities_or_assumptions`: Initial `out_exit_code` default is `0`.

26. `theorem_id`: `EXP_CMD_SUBST_CHILD_DONE_ADVANCES_AND_CLEANS`
    - `source_file`: `/home/saint/bun/src/runtime/shell/states/Expansion.zig`
    - `source_reference`: `childDone`, lines 530-533
    - `statement`: Completing command substitution advances one atom, clears child state, deinitializes child, and resumes expansion.
    - `preconditions`: Child is `Script` and child state is command substitution.
    - `expected_behavior`: `word_idx += 1`, `child_state == idle`, `child.deinit()` called, return `{ .expansion = this }`.
    - `edge_cases_covered`: Resuming compound expansion after a command substitution.
    - `why_this_is_Zig_derived`: Final statements in Script child branch.
    - `ambiguities_or_assumptions`: Assertion validates child state only when enabled.

27. `theorem_id`: `EXP_INVALID_CHILD_PANICS`
    - `source_file`: `/home/saint/bun/src/runtime/shell/states/Expansion.zig`
    - `source_reference`: `ChildPtr`, lines 50-53; `childDone`, lines 495-536
    - `statement`: Passing a non-`Script` child to `Expansion.childDone` is invalid and terminates via panic.
    - `preconditions`: `child.ptr.is(Script) == false`.
    - `expected_behavior`: Panic with message `"Invalid child to Expansion, this indicates a bug in Bun. Please file a report on Github."`
    - `edge_cases_covered`: Invalid child-state/child-type combination.
    - `why_this_is_Zig_derived`: Only Script child branch exists; otherwise `@panic`.
    - `ambiguities_or_assumptions`: The type union currently only includes Script, so this is defensive invalid-case behavior.

28. `theorem_id`: `EXP_BRACE_EXPANSION_RUNS_AFTER_NORMAL_ATOM_EXPANSION`
    - `source_file`: `/home/saint/bun/src/runtime/shell/states/Expansion.zig`
    - `source_reference`: `next`, lines 205-210 and 227-284
    - `statement`: Brace expansion is performed after normal atom expansion has produced `current_out`.
    - `preconditions`: `node.has_brace_expansion() == true` after all atoms have been processed.
    - `expected_behavior`: State changes to `.braces`; `current_out` is tokenized by brace lexer and expanded into `expansion_count` result strings.
    - `edge_cases_covered`: Brace syntax mixed with variables/text; non-ASCII brace input.
    - `why_this_is_Zig_derived`: Normal branch checks brace flag after atom processing; braces branch tokenizes `current_out`.
    - `ambiguities_or_assumptions`: Exact brace grammar is delegated to `Braces`.

29. `theorem_id`: `EXP_BRACE_ASCII_AND_WTF8_LEXER_SELECTION`
    - `source_file`: `/home/saint/bun/src/runtime/shell/states/Expansion.zig`
    - `source_reference`: `next` braces branch, lines 231-237
    - `statement`: Brace tokenization uses the ASCII lexer for all-ASCII input and WTF-8 lexer otherwise.
    - `preconditions`: State is `.braces`.
    - `expected_behavior`: If `bun.strings.isAllASCII(current_out)` then `Braces.Lexer.tokenize`; otherwise `Braces.NewLexer(.wtf8).tokenize`.
    - `edge_cases_covered`: Non-ASCII brace expansion input.
    - `why_this_is_Zig_derived`: Direct conditional lexer selection.
    - `ambiguities_or_assumptions`: Lexer outputs are trusted by this state.

30. `theorem_id`: `EXP_BRACE_RESULTS_ARE_SENTINEL_TERMINATED_AND_PUSHED`
    - `source_file`: `/home/saint/bun/src/runtime/shell/states/Expansion.zig`
    - `source_reference`: `next` braces branch, lines 238-278
    - `statement`: Every brace-expanded string is NUL-terminated and pushed to the result target.
    - `preconditions`: Brace expansion succeeds with `expansion_count`.
    - `expected_behavior`: For each expanded string, append `0`, push result, then either deinit copied buffer or clear moved buffer.
    - `edge_cases_covered`: Single brace result, multiple brace results, result target ownership modes.
    - `why_this_is_Zig_derived`: Loop over `0..expansion_count` appends sentinel and pushes.
    - `ambiguities_or_assumptions`: `UnexpectedToken` from `Braces.expand` panics; OOM aborts.

31. `theorem_id`: `EXP_BRACE_THEN_GLOB_TRANSITIONS_TO_GLOB`
    - `source_file`: `/home/saint/bun/src/runtime/shell/states/Expansion.zig`
    - `source_reference`: `next`, lines 280-284
    - `statement`: If a node has both brace and glob expansion flags, the expansion state moves to glob after pushing brace results.
    - `preconditions`: State is `.braces`; `node.has_glob_expansion() == true`.
    - `expected_behavior`: `state == glob` after brace results are pushed.
    - `edge_cases_covered`: Combined brace/glob expansion.
    - `why_this_is_Zig_derived`: Final conditional in braces branch.
    - `ambiguities_or_assumptions`: The glob pattern used is still `current_out`; comments note brace + command substitution has unsupported weird behavior.

32. `theorem_id`: `EXP_GLOB_INIT_USES_CURRENT_OUT_PATTERN_AND_FALSE_FLAGS`
    - `source_file`: `/home/saint/bun/src/runtime/shell/states/Expansion.zig`
    - `source_reference`: `transitionToGlobState`, lines 305-334
    - `statement`: Glob expansion initializes a `GlobWalker` from `current_out` and current working directory, with all five boolean options set to false.
    - `preconditions`: State is `.glob`.
    - `expected_behavior`: `child_state` becomes `.glob`; `GlobWalker.initWithCwd` is called with pattern `current_out.items[0..]`, shell cwd, and booleans `false,false,false,false,false`.
    - `edge_cases_covered`: Valid no-option glob behavior.
    - `why_this_is_Zig_derived`: Direct call arguments in `transitionToGlobState`.
    - `ambiguities_or_assumptions`: Meanings of the five false flags are defined in `GlobWalker`, not this file.

33. `theorem_id`: `EXP_GLOB_INIT_ERROR_SETS_ERROR_STATE`
    - `source_file`: `/home/saint/bun/src/runtime/shell/states/Expansion.zig`
    - `source_reference`: `transitionToGlobState`, lines 312-329
    - `statement`: Failure to initialize the glob walker sets expansion error state and resumes expansion handling.
    - `preconditions`: `GlobWalker.initWithCwd` returns `.err(e)`.
    - `expected_behavior`: Arena is deinitialized, `child_state == idle`, `state == err(ShellErr.newSys(e))`, return `{ .expansion = this }`.
    - `edge_cases_covered`: Invalid glob pattern or cwd syscall error.
    - `why_this_is_Zig_derived`: Error branch in `transitionToGlobState`.
    - `ambiguities_or_assumptions`: Exact errors are from `GlobWalker`.

34. `theorem_id`: `EXP_GLOB_SCHEDULES_ASYNC_TASK_ON_SUCCESS`
    - `source_file`: `/home/saint/bun/src/runtime/shell/states/Expansion.zig`
    - `source_reference`: `transitionToGlobState`, lines 330-334; `ShellGlobTask.schedule`, lines 857-860
    - `statement`: Successful glob initialization schedules an asynchronous glob task and suspends expansion.
    - `preconditions`: `GlobWalker.initWithCwd` succeeds.
    - `expected_behavior`: A `ShellGlobTask` is created, scheduled on `WorkPool`, and `transitionToGlobState` returns `.suspended`.
    - `edge_cases_covered`: Async glob walk.
    - `why_this_is_Zig_derived`: `createOnMainThread`, `task.schedule()`, return `.suspended`.
    - `ambiguities_or_assumptions`: WorkPool scheduling order is outside this theorem.

35. `theorem_id`: `EXP_GLOB_NO_MATCH_ASSIGNMENT_PRESERVES_PATTERN`
    - `source_file`: `/home/saint/bun/src/runtime/shell/states/Expansion.zig`
    - `source_reference`: `onGlobWalkDone`, lines 558-566
    - `statement`: A no-match glob in assignment context expands to the original pattern rather than an error.
    - `preconditions`: Glob task completed with `task.result.items.len == 0`; parent is `Assigns`, or parent is `Cmd` with state `.expanding_assigns`.
    - `expected_behavior`: `pushCurrentOut()` is called; walker is deinitialized; `child_state == idle`; `state == done`; return `{ .expansion = this }`.
    - `edge_cases_covered`: Failed glob in variable assignment.
    - `why_this_is_Zig_derived`: Explicit assignment-context branch.
    - `ambiguities_or_assumptions`: Parent state enum meanings are outside this file.

36. `theorem_id`: `EXP_GLOB_NO_MATCH_NON_ASSIGNMENT_ERRORS`
    - `source_file`: `/home/saint/bun/src/runtime/shell/states/Expansion.zig`
    - `source_reference`: `onGlobWalkDone`, lines 558-576
    - `statement`: A no-match glob outside assignment context becomes a custom shell error.
    - `preconditions`: Glob task completed with no results; parent is not `Assigns`; parent is not `Cmd` in `.expanding_assigns`.
    - `expected_behavior`: `state == err(custom("no matches found: {pattern}"))`; walker deinitialized; `child_state == idle`; return `{ .expansion = this }`.
    - `edge_cases_covered`: Unmatched `*`/`**` in command arguments.
    - `why_this_is_Zig_derived`: Non-assignment no-match branch formats error message.
    - `ambiguities_or_assumptions`: Pattern string comes from `child_state.glob.walker.pattern`.

37. `theorem_id`: `EXP_GLOB_MATCHES_PUSH_DUPED_SENTINEL_RESULTS`
    - `source_file`: `/home/saint/bun/src/runtime/shell/states/Expansion.zig`
    - `source_reference`: `onGlobWalkDone`, lines 579-594
    - `statement`: Matched glob results are duplicated as sentinel strings and pushed individually.
    - `preconditions`: Glob task completed with `task.result.items.len > 0`.
    - `expected_behavior`: Each matched path is `dupeZ` copied, pushed via `pushResultSliceOwned`, freed if copied, retained if moved; then `word_idx += 1`, walker deinitialized, `child_state == idle`, `state == done`.
    - `edge_cases_covered`: One match, multiple matches.
    - `why_this_is_Zig_derived`: Loop over `task.result.items` and final state updates.
    - `ambiguities_or_assumptions`: Match ordering is determined by `GlobWalker`, not this file.

38. `theorem_id`: `EXP_GLOB_TASK_ERROR_THROWS`
    - `source_file`: `/home/saint/bun/src/runtime/shell/states/Expansion.zig`
    - `source_reference`: `onGlobWalkDone`, lines 545-556; `ShellGlobTask.runFromThreadPool`, lines 815-824
    - `statement`: Glob walker task errors are thrown into the expansion base before result handling.
    - `preconditions`: `task.err` is present.
    - `expected_behavior`: Syscall errors call `base.throw(ShellErr.newSys(err))`; unknown errors call `base.throw(custom(errorName))`.
    - `edge_cases_covered`: Iterator init/next errors during glob walking.
    - `why_this_is_Zig_derived`: `onGlobWalkDone` checks `task.err` and throws by error kind.
    - `ambiguities_or_assumptions`: After `base.throw`, code continues to inspect results; exact throw control-flow semantics are outside this file.

39. `theorem_id`: `EXP_DONE_RETURNS_PARENT_CHILD_DONE_ZERO`
    - `source_file`: `/home/saint/bun/src/runtime/shell/states/Expansion.zig`
    - `source_reference`: `next`, lines 293-295
    - `statement`: A completed expansion reports success to its parent with exit code `0`.
    - `preconditions`: `state == done` when `next` reaches final state handling.
    - `expected_behavior`: Return value is `parent.childDone(this, 0)`.
    - `edge_cases_covered`: Completion after normal, brace, glob-assignment no-match, or glob-match paths.
    - `why_this_is_Zig_derived`: Final `if (this.state == .done)` branch.
    - `ambiguities_or_assumptions`: Parent behavior is outside this file.

40. `theorem_id`: `EXP_ERR_RETURNS_PARENT_CHILD_DONE_ONE`
    - `source_file`: `/home/saint/bun/src/runtime/shell/states/Expansion.zig`
    - `source_reference`: `next`, lines 297-300
    - `statement`: An expansion error reports failure to its parent with exit code `1`.
    - `preconditions`: `state == err` when `next` reaches final state handling.
    - `expected_behavior`: Return value is `parent.childDone(this, 1)`.
    - `edge_cases_covered`: Glob init error, unmatched glob non-assignment error.
    - `why_this_is_Zig_derived`: Final `if (this.state == .err)` branch.
    - `ambiguities_or_assumptions`: Parent inspects `this.state.err` per comment.

41. `theorem_id`: `EXP_TRIM_REMOVES_ONLY_EDGE_VALUES`
    - `source_file`: `/home/saint/bun/src/runtime/shell/states/Expansion.zig`
    - `source_reference`: `trim`, lines 411-417
    - `statement`: `trim` removes only leading and trailing bytes contained in `values_to_strip`.
    - `preconditions`: Any mutable byte slice and any strip byte set.
    - `expected_behavior`: Returns subslice from first non-strip byte through last non-strip byte inclusive; internal strip bytes are preserved.
    - `edge_cases_covered`: Empty slice, all-stripped slice, singleton stripped/non-stripped slice.
    - `why_this_is_Zig_derived`: Two while loops advance `begin` and decrement `end`.
    - `ambiguities_or_assumptions`: Byte membership uses `std.mem.indexOfScalar`.

42. `theorem_id`: `EXP_CONVERT_NEWLINES_EMPTY_AND_SINGLE_NEWLINE`
    - `source_file`: `/home/saint/bun/src/runtime/shell/states/Expansion.zig`
    - `source_reference`: `convertNewlinesToSpaces`, lines 458-467
    - `statement`: Converting newlines returns empty output unchanged, and a single trailing newline is stripped before conversion.
    - `preconditions`: Input stdout slice length is `0` or ends with `'\n'`.
    - `expected_behavior`: Empty input returns empty; if last byte is newline, returned slice excludes that final byte; if that makes length zero, returns empty.
    - `edge_cases_covered`: `""`, `"\n"`.
    - `why_this_is_Zig_derived`: Initial `brk` block strips final newline and early-returns on empty.
    - `ambiguities_or_assumptions`: Function mutates input buffer for non-final newlines.

43. `theorem_id`: `EXP_CONVERT_NEWLINES_REPLACES_NON_FINAL_NEWLINES_WITH_SPACES`
    - `source_file`: `/home/saint/bun/src/runtime/shell/states/Expansion.zig`
    - `source_reference`: `convertNewlinesToSpaces`, lines 458-484; `convertNewlinesToSpacesSlow`, lines 487-493
    - `statement`: All non-stripped newline bytes in stdout are replaced with spaces.
    - `preconditions`: Input length after optional trailing-newline strip is nonzero.
    - `expected_behavior`: Every remaining `'\n'` byte becomes `' '`; other bytes are unchanged.
    - `edge_cases_covered`: Length below 64 slow path, length at/above 64 vector path, tail after vector chunks.
    - `why_this_is_Zig_derived`: Slow and SIMD paths both replace newline with space.
    - `ambiguities_or_assumptions`: SIMD and slow paths are expected to be observationally equivalent.

44. `theorem_id`: `EXP_ARGV_JS_MAPPING`
    - `source_file`: `/home/saint/bun/src/runtime/shell/states/Expansion.zig`
    - `source_reference`: `expandVarArgv`, lines 672-692
    - `statement`: In JS event-loop mode, positional variable expansion maps index `0` to Bun executable path, then optional VM main, then worker argv or VM argv.
    - `preconditions`: Atom is `.VarArgv(int)` and interpreter event loop is `.js`.
    - `expected_behavior`: `0 => selfExePath() catch ""`; next index maps to `vm.main` if non-empty; remaining index maps to worker argv if worker exists else VM argv; out-of-range returns `""`.
    - `edge_cases_covered`: `$0`, missing executable path, no main, worker mode, argv out of range.
    - `why_this_is_Zig_derived`: JS switch branch in `expandVarArgv`.
    - `ambiguities_or_assumptions`: Exact shell syntax for `.VarArgv` is parser-defined.

45. `theorem_id`: `EXP_ARGV_MINI_MAPPING`
    - `source_file`: `/home/saint/bun/src/runtime/shell/states/Expansion.zig`
    - `source_reference`: `expandVarArgv`, lines 693-698
    - `statement`: In mini event-loop mode, positional variable expansion maps index `0` to the last positional and positive indexes to passthrough arguments.
    - `preconditions`: Atom is `.VarArgv(int)` and interpreter event loop is `.mini`.
    - `expected_behavior`: If `int >= 1 + passthrough.len`, returns `""`; if `int == 0`, returns `ctx.positionals[ctx.positionals.len - 1]`; otherwise returns `ctx.passthrough[int - 1]`.
    - `edge_cases_covered`: `$0`, first passthrough, out of range.
    - `why_this_is_Zig_derived`: Mini switch branch in `expandVarArgv`.
    - `ambiguities_or_assumptions`: Assumes `ctx.positionals` is non-empty when `int == 0`, as Zig does not guard it here.
