dataset_id: bun-pr-31008
expected_bug_slug: bun_lockb_package_id_out_of_range_crash
bug_summary: Out-of-range package_id values in bun.lockb crashed install instead of being treated as corruption.
rust_selector: @src/install/lockfile/bun.lockb.rs::load
zig_semantic_anchor: load
notes: Primary target is bun.lockb load; PR 31008 also added a companion range check in Package.rs.

theorem_packets:
1. `theorem_id`: `lockb_load_invalid_header_errors`
   - `source_file`: `src/install/lockfile/bun.lockb.zig`
   - `source_reference`: `lines 3-4, 273-278`
   - `statement`: Loading requires the byte prefix `#!/usr/bin/env bun\nbun-lockfile-format-v0\n`.
   - `preconditions`: Stream begins with bytes not exactly equal to `header_bytes`, including empty or truncated header.
   - `expected_behavior`: `load` returns `error.InvalidLockfile` before reading format-dependent payload.
   - `edge_cases_covered`: empty input; partial header; wrong shebang; wrong version string.
   - `why_this_is_Zig_derived`: Zig reads up to `header_bytes.len` and compares with `strings.eqlComptime`; mismatch immediately returns `InvalidLockfile`.
   - `ambiguities_or_assumptions`: `reader.readAll` may itself error on stream failure; otherwise short reads compare unequal.

2. `theorem_id`: `lockb_load_current_format_not_migrated`
   - `source_file`: `src/install/lockfile/bun.lockb.zig`
   - `source_reference`: `lines 280-296, 315-316`
   - `statement`: A lockfile whose format equals current format loads without v2 migration.
   - `preconditions`: Header valid; format integer equals `Lockfile.FormatVersion.current`; later structural reads succeed.
   - `expected_behavior`: `res.migrated_from_lockb_v2 == false`; `lockfile.format` is set to current.
   - `edge_cases_covered`: normal non-migration path.
   - `why_this_is_Zig_derived`: `migrate_from_v2` starts false and only flips for older v2 format.
   - `ambiguities_or_assumptions`: Exact numeric value of current format is external to this file.

3. `theorem_id`: `lockb_load_future_format_errors`
   - `source_file`: `src/install/lockfile/bun.lockb.zig`
   - `source_reference`: `lines 281-284`
   - `statement`: A format greater than current is rejected.
   - `preconditions`: Header valid; decoded `format > current`.
   - `expected_behavior`: `load` returns `error."Unexpected lockfile version"`.
   - `edge_cases_covered`: forward-incompatible lockfile.
   - `why_this_is_Zig_derived`: Zig checks `format > current` before any migration or payload loading.
   - `ambiguities_or_assumptions`: None.

4. `theorem_id`: `lockb_load_legacy_non_v2_format_errors`
   - `source_file`: `src/install/lockfile/bun.lockb.zig`
   - `source_reference`: `lines 286-293`
   - `statement`: Older formats are accepted only if they are exactly v2.
   - `preconditions`: Header valid; `format < current`; `format != v2`.
   - `expected_behavior`: `load` returns `error."Outdated lockfile version"`.
   - `edge_cases_covered`: v0/v1 or other pre-current non-v2 formats.
   - `why_this_is_Zig_derived`: Zig explicitly rejects older non-v2 formats.
   - `ambiguities_or_assumptions`: Exact v2 numeric value is external.

5. `theorem_id`: `lockb_load_v2_sets_migration_flag`
   - `source_file`: `src/install/lockfile/bun.lockb.zig`
   - `source_reference`: `lines 286-294, 306-316, 345-367`
   - `statement`: Format v2 triggers migration mode for packages and workspace versions.
   - `preconditions`: Header valid; `format == v2`; later reads succeed.
   - `expected_behavior`: `res.migrated_from_lockb_v2 == true`; package serializer receives `migrate_from_v2 == true`; workspace version array, if present, is read as old `Semver.VersionType(u32)` and migrated.
   - `edge_cases_covered`: v2-to-current migration.
   - `why_this_is_Zig_derived`: Zig sets `migrate_from_v2 = true`, passes it into package load, and branches workspace-version decoding on it.
   - `ambiguities_or_assumptions`: Actual `old_version.migrate()` semantics live in Semver code.

6. `theorem_id`: `lockb_load_total_buffer_size_bounds`
   - `source_file`: `src/install/lockfile/bun.lockb.zig`
   - `source_reference`: `lines 299-304`
   - `statement`: Declared total buffer size must not exceed actual stream buffer length.
   - `preconditions`: Header and format accepted; decoded `total_buffer_size > stream.buffer.len`.
   - `expected_behavior`: `load` returns `error."Lockfile is missing data"`.
   - `edge_cases_covered`: truncated payload; bogus oversized total size.
   - `why_this_is_Zig_derived`: Zig checks this immediately after reading total size.
   - `ambiguities_or_assumptions`: None.

7. `theorem_id`: `lockb_load_meta_hash_read_effect`
   - `source_file`: `src/install/lockfile/bun.lockb.zig`
   - `source_reference`: `lines 296-301`
   - `statement`: On accepted format, `lockfile.meta_hash` is overwritten from the stream before total-size validation.
   - `preconditions`: Header valid; format accepted; meta-hash read succeeds.
   - `expected_behavior`: `lockfile.meta_hash` equals the next meta-hash bytes read from stream.
   - `edge_cases_covered`: load mutates lockfile before later errors.
   - `why_this_is_Zig_derived`: Zig calls `reader.readAll(&lockfile.meta_hash)` before reading and validating `total_buffer_size`.
   - `ambiguities_or_assumptions`: Meta-hash length is the static size of `lockfile.meta_hash`.

8. `theorem_id`: `lockb_load_package_result_propagation`
   - `source_file`: `src/install/lockfile/bun.lockb.zig`
   - `source_reference`: `lines 306-316`; helper `src/install/lockfile/Package.zig lines 2124-2218`
   - `statement`: Successful package deserialization installs the loaded package list and propagates its update flag.
   - `preconditions`: Header/format/total-size valid; `Package.Serializer.load` succeeds.
   - `expected_behavior`: `lockfile.packages == packages_load_result.list`; `res.packages_need_update == packages_load_result.needs_update`.
   - `edge_cases_covered`: package metadata needing update; migrated package list.
   - `why_this_is_Zig_derived`: Zig directly assigns both fields from `packages_load_result`.
   - `ambiguities_or_assumptions`: Package serializer internals are treated as helper behavior.

9. `theorem_id`: `lockb_load_end_sentinel_must_be_zero`
   - `source_file`: `src/install/lockfile/bun.lockb.zig`
   - `source_reference`: `lines 318-326`
   - `statement`: After buffer loading, the next u64 sentinel must be zero.
   - `preconditions`: Buffer loading succeeds; next u64 read succeeds; value is nonzero.
   - `expected_behavior`: `load` returns `error."Lockfile is malformed (expected 0 at the end)"`.
   - `edge_cases_covered`: malformed core lockfile before optional extension tags.
   - `why_this_is_Zig_derived`: Zig reads a u64 and rejects if it is not zero.
   - `ambiguities_or_assumptions`: None.

10. `theorem_id`: `lockb_load_no_optional_sections`
    - `source_file`: `src/install/lockfile/bun.lockb.zig`
    - `source_reference`: `lines 331-438, 441-575`
    - `statement`: If no optional extension tags are available, optional maps/options remain as initialized except for later compatibility workspace path fill.
    - `preconditions`: Core load succeeds; after sentinel, `remaining_in_buffer` is not sufficient for each optional section guard.
    - `expected_behavior`: Workspace-version tag, trusted-dependencies tag, overrides tag, patched-dependencies tag, catalogs tag, and config-version tag are not consumed; no corresponding optional section is populated by tag logic.
    - `edge_cases_covered`: old `< Bun v1.0.4` lockfiles; boundary `remaining_in_buffer <= 8` for most sections.
    - `why_this_is_Zig_derived`: Each optional section is gated by `remaining_in_buffer > 8`, except trusted uses `>= 8`.
    - `ambiguities_or_assumptions`: Later workspace compatibility pass may still populate `workspace_paths`.

11. `theorem_id`: `lockb_load_workspace_tag_current_format`
    - `source_file`: `src/install/lockfile/bun.lockb.zig`
    - `source_reference`: `lines 331-405`
    - `statement`: A workspace tag in the expected position loads workspace versions and workspace paths.
    - `preconditions`: `remaining_in_buffer > 8`; next u64 equals `has_workspace_package_ids_tag`; `migrate_from_v2 == false`; all four arrays read successfully.
    - `expected_behavior`: `lockfile.workspace_versions.keys` come from first hash array; values from `Semver.Version` array; `lockfile.workspace_paths.keys` come from path hash array; values from path string array; both maps are reindexed.
    - `edge_cases_covered`: nonempty workspace extension; current format.
    - `why_this_is_Zig_derived`: Zig reads four arrays and memcpy’s them into the two maps.
    - `ambiguities_or_assumptions`: Zig does not explicitly check equal key/value lengths before memcpy in this snippet.

12. `theorem_id`: `lockb_load_workspace_tag_v2_format`
    - `source_file`: `src/install/lockfile/bun.lockb.zig`
    - `source_reference`: `lines 345-367`
    - `statement`: In v2 migration mode, workspace versions are decoded as old u32 semver versions and migrated before insertion.
    - `preconditions`: Workspace tag present; `migrate_from_v2 == true`; old version array read succeeds.
    - `expected_behavior`: Each workspace version value inserted equals `old_version.migrate()`.
    - `edge_cases_covered`: migrated workspace versions.
    - `why_this_is_Zig_derived`: Zig reads `Semver.VersionType(u32)` and appends `old_version.migrate()`.
    - `ambiguities_or_assumptions`: Migration function details are external.

13. `theorem_id`: `lockb_load_unknown_workspace_slot_tag_rewinds`
    - `source_file`: `src/install/lockfile/bun.lockb.zig`
    - `source_reference`: `lines 331-408`
    - `statement`: If the first optional tag is not the workspace tag, load rewinds by 8 bytes.
    - `preconditions`: `remaining_in_buffer > 8`; next u64 is not `has_workspace_package_ids_tag`.
    - `expected_behavior`: `stream.pos` is restored to its value before reading that u64; workspace extension maps are not populated by this branch.
    - `edge_cases_covered`: workspace section absent; later trusted/overrides/etc. section begins immediately.
    - `why_this_is_Zig_derived`: Zig executes `stream.pos -= 8` in the `else`.
    - `ambiguities_or_assumptions`: Later compatibility pass can still add workspace paths.

14. `theorem_id`: `lockb_load_trusted_dependencies_nonempty`
    - `source_file`: `src/install/lockfile/bun.lockb.zig`
    - `source_reference`: `lines 412-431`
    - `statement`: A nonempty trusted-dependencies tag loads trusted dependency hashes.
    - `preconditions`: `remaining_in_buffer > 8`; next u64 equals `has_trusted_dependencies_tag`; hash array read succeeds.
    - `expected_behavior`: `lockfile.trusted_dependencies` becomes present/empty-set-then-filled; its keys equal the read u32 hashes; it is reindexed.
    - `edge_cases_covered`: explicit nonempty trusted dependencies.
    - `why_this_is_Zig_derived`: Zig assigns `. {}` to optional set, copies keys, and reindexes.
    - `ambiguities_or_assumptions`: Values are set-like keys only.

15. `theorem_id`: `lockb_load_trusted_dependencies_empty`
    - `source_file`: `src/install/lockfile/bun.lockb.zig`
    - `source_reference`: `lines 412-435`
    - `statement`: The empty trusted-dependencies tag records that trusted dependencies exists but is empty.
    - `preconditions`: `remaining_in_buffer >= 8`; next u64 equals `has_empty_trusted_dependencies_tag`.
    - `expected_behavior`: `lockfile.trusted_dependencies` becomes present with no keys read.
    - `edge_cases_covered`: tag-only section; exactly 8 remaining bytes.
    - `why_this_is_Zig_derived`: Zig has a dedicated `else if` for `has_empty_trusted_dependencies_tag`.
    - `ambiguities_or_assumptions`: Present-empty is semantically distinct from `None`.

16. `theorem_id`: `lockb_load_trusted_dependencies_absent_or_wrong_tag_rewinds`
    - `source_file`: `src/install/lockfile/bun.lockb.zig`
    - `source_reference`: `lines 412-437`
    - `statement`: A non-trusted tag in the trusted slot is not consumed.
    - `preconditions`: `remaining_in_buffer >= 8`; next u64 is neither trusted tag nor empty-trusted tag, or is nonempty trusted tag with only exactly 8 bytes remaining.
    - `expected_behavior`: `stream.pos` is decremented by 8; `lockfile.trusted_dependencies` is not changed by this branch.
    - `edge_cases_covered`: trusted absent; boundary where nonempty trusted tag lacks array payload.
    - `why_this_is_Zig_derived`: Zig rewinds in the final `else`; nonempty trusted branch requires `remaining_in_buffer > 8`.
    - `ambiguities_or_assumptions`: Subsequent sections may consume the same tag.

17. `theorem_id`: `lockb_load_overrides_tag`
    - `source_file`: `src/install/lockfile/bun.lockb.zig`
    - `source_reference`: `lines 441-474`
    - `statement`: An overrides tag loads name hashes and external dependency values into `lockfile.overrides.map`.
    - `preconditions`: `remaining_in_buffer > 8`; next u64 equals `has_overrides_tag`; both arrays read successfully.
    - `expected_behavior`: For each paired `(name, value)`, map contains `name -> Dependency.toDependency(value, context)`.
    - `edge_cases_covered`: overrides section present; zero-length arrays if helper permits them.
    - `why_this_is_Zig_derived`: Zig reads two arrays, converts external dependencies, and `putAssumeCapacity`s pairs.
    - `ambiguities_or_assumptions`: Pairing truncation/length mismatch behavior follows Zig `for (a,b)` semantics and may require separate modeling.

18. `theorem_id`: `lockb_load_overrides_absent_rewinds`
    - `source_file`: `src/install/lockfile/bun.lockb.zig`
    - `source_reference`: `lines 441-474`
    - `statement`: A non-overrides tag in the overrides slot is not consumed.
    - `preconditions`: `remaining_in_buffer > 8`; next u64 is not `has_overrides_tag`.
    - `expected_behavior`: `stream.pos` is restored by subtracting 8; overrides are not changed by this branch.
    - `edge_cases_covered`: overrides absent while later sections may be present.
    - `why_this_is_Zig_derived`: Zig rewinds in the `else`.
    - `ambiguities_or_assumptions`: None.

19. `theorem_id`: `lockb_load_patched_dependencies_tag`
    - `source_file`: `src/install/lockfile/bun.lockb.zig`
    - `source_reference`: `lines 478-507`
    - `statement`: A patched-dependencies tag loads package-name-and-version hashes and patch records into `lockfile.patched_dependencies`.
    - `preconditions`: `remaining_in_buffer > 8`; next u64 equals `has_patched_dependencies_tag`; both arrays read successfully.
    - `expected_behavior`: For each paired `(name_hash, patch_path)`, patched-dependency map contains that pair.
    - `edge_cases_covered`: patched dependencies section present.
    - `why_this_is_Zig_derived`: Zig reads two arrays and `putAssumeCapacity`s paired entries.
    - `ambiguities_or_assumptions`: Length mismatch behavior follows Zig paired iteration.

20. `theorem_id`: `lockb_load_patched_dependencies_absent_rewinds`
    - `source_file`: `src/install/lockfile/bun.lockb.zig`
    - `source_reference`: `lines 478-507`
    - `statement`: A non-patched-dependencies tag in the patched slot is not consumed.
    - `preconditions`: `remaining_in_buffer > 8`; next u64 is not `has_patched_dependencies_tag`.
    - `expected_behavior`: `stream.pos` is restored by subtracting 8; patched dependencies are not changed by this branch.
    - `edge_cases_covered`: patched section absent while catalogs/config may follow.
    - `why_this_is_Zig_derived`: Zig rewinds in the `else`.
    - `ambiguities_or_assumptions`: None.

21. `theorem_id`: `lockb_load_catalogs_tag`
    - `source_file`: `src/install/lockfile/bun.lockb.zig`
    - `source_reference`: `lines 511-560`
    - `statement`: A catalogs tag resets catalogs and loads default catalog plus named groups.
    - `preconditions`: `remaining_in_buffer > 8`; next u64 equals `has_catalogs_tag`; all catalog arrays read successfully.
    - `expected_behavior`: `lockfile.catalogs` is reset to empty; default entries are populated from paired default name/dependency arrays; each catalog group name gets a group populated from its paired dependency arrays.
    - `edge_cases_covered`: default-only catalogs; groups with zero deps; multiple groups.
    - `why_this_is_Zig_derived`: Zig assigns `lockfile.catalogs = .{}` then reads and inserts default and group entries.
    - `ambiguities_or_assumptions`: Length mismatch behavior follows Zig paired iteration.

22. `theorem_id`: `lockb_load_catalogs_absent_rewinds`
    - `source_file`: `src/install/lockfile/bun.lockb.zig`
    - `source_reference`: `lines 511-560`
    - `statement`: A non-catalogs tag in the catalogs slot is not consumed.
    - `preconditions`: `remaining_in_buffer > 8`; next u64 is not `has_catalogs_tag`.
    - `expected_behavior`: `stream.pos` is restored by subtracting 8; catalogs are not changed by this branch.
    - `edge_cases_covered`: catalogs absent while config may follow.
    - `why_this_is_Zig_derived`: Zig rewinds in the `else`.
    - `ambiguities_or_assumptions`: None.

23. `theorem_id`: `lockb_load_config_version_valid_tag`
    - `source_file`: `src/install/lockfile/bun.lockb.zig`
    - `source_reference`: `lines 564-574`
    - `statement`: A valid config-version tag loads and stores saved config version.
    - `preconditions`: `remaining_in_buffer > 8`; next u64 equals `has_config_version_tag`; following u64 maps through `bun.ConfigVersion.fromInt`.
    - `expected_behavior`: `lockfile.saved_config_version` is set to the decoded config version.
    - `edge_cases_covered`: explicit config version section.
    - `why_this_is_Zig_derived`: Zig reads the tag, decodes the next u64, and assigns `saved_config_version`.
    - `ambiguities_or_assumptions`: Valid config-version integer domain is external.

24. `theorem_id`: `lockb_load_config_version_invalid_value_errors`
    - `source_file`: `src/install/lockfile/bun.lockb.zig`
    - `source_reference`: `lines 567-573`
    - `statement`: A config-version tag followed by an unrecognized config-version integer is invalid.
    - `preconditions`: Config-version tag present; `bun.ConfigVersion.fromInt(value)` returns null.
    - `expected_behavior`: `load` returns `error.InvalidLockfile`.
    - `edge_cases_covered`: corrupt config value.
    - `why_this_is_Zig_derived`: Zig uses `orelse return error.InvalidLockfile`.
    - `ambiguities_or_assumptions`: None.

25. `theorem_id`: `lockb_load_unknown_config_slot_tag_consumed`
    - `source_file`: `src/install/lockfile/bun.lockb.zig`
    - `source_reference`: `lines 564-575, 606`
    - `statement`: Unlike earlier optional sections, an unknown tag in the config-version slot is read but not rewound.
    - `preconditions`: `remaining_in_buffer > 8`; next u64 is not `has_config_version_tag`.
    - `expected_behavior`: No config version is assigned; `stream.pos` remains advanced by 8.
    - `edge_cases_covered`: trailing unknown extension after catalogs slot.
    - `why_this_is_Zig_derived`: Config branch has no `else { stream.pos -= 8; }`.
    - `ambiguities_or_assumptions`: In assertion-enabled builds, final `assert(stream.pos == total_buffer_size)` may catch leftover bytes; in non-assert builds this is not an explicit returned error in this function.

26. `theorem_id`: `lockb_load_runtime_structures_initialized`
    - `source_file`: `src/install/lockfile/bun.lockb.zig`
    - `source_reference`: `lines 578-581`
    - `statement`: After optional-section parsing, scratch state, package index, and string pool are initialized fresh.
    - `preconditions`: Load has not returned an error before line 578.
    - `expected_behavior`: `lockfile.scratch`, `lockfile.package_index`, and `lockfile.string_pool` are reset/initialized; package index capacity is ensured for package count.
    - `edge_cases_covered`: empty package list; singleton package list.
    - `why_this_is_Zig_derived`: Zig assigns new initialized values unconditionally before package-index population.
    - `ambiguities_or_assumptions`: Allocation failure propagates via `try`.

27. `theorem_id`: `lockb_load_package_index_population`
    - `source_file`: `src/install/lockfile/bun.lockb.zig`
    - `source_reference`: `lines 583-604`
    - `statement`: Every loaded package name hash is inserted into package index with its package id.
    - `preconditions`: Runtime structures initialized; `getOrPutID` succeeds for all packages.
    - `expected_behavior`: For each package at index `id`, `lockfile.getOrPutID(id, name_hash)` is called.
    - `edge_cases_covered`: zero packages results in no calls; singleton package gets id `0`; boundary package ids are truncated to `PackageID`.
    - `why_this_is_Zig_derived`: Zig loops over `name_hashes` with `0..` id and calls `getOrPutID`.
    - `ambiguities_or_assumptions`: Behavior of duplicate name hashes is inside `getOrPutID`.

28. `theorem_id`: `lockb_load_workspace_resolution_compatibility_paths`
    - `source_file`: `src/install/lockfile/bun.lockb.zig`
    - `source_reference`: `lines 328, 583-597`
    - `statement`: Because `has_workspace_name_hashes` is hardcoded false, workspace package resolutions always populate `workspace_paths` for compatibility.
    - `preconditions`: Load reaches compatibility loop; package has `resolution.tag == .workspace`; `workspace_paths.put` succeeds.
    - `expected_behavior`: `lockfile.workspace_paths` receives `name_hash -> resolution.value.workspace`.
    - `edge_cases_covered`: old lockfiles without workspace extension; lockfiles with extension plus workspace resolutions.
    - `why_this_is_Zig_derived`: Zig sets `const has_workspace_name_hashes = false` and then executes the compatibility branch.
    - `ambiguities_or_assumptions`: If key already exists from workspace extension, exact replace/duplicate behavior depends on map `put`.

29. `theorem_id`: `lockb_load_final_position_assertion`
    - `source_file`: `src/install/lockfile/bun.lockb.zig`
    - `source_reference`: `line 606`
    - `statement`: In assertion-enabled builds, successful load requires `stream.pos == total_buffer_size`.
    - `preconditions`: `Environment.allow_assert` is true; load reaches final assertion.
    - `expected_behavior`: Assertion failure if stream position differs from declared total size.
    - `edge_cases_covered`: trailing unknown data; skipped bytes; malformed optional extension layout.
    - `why_this_is_Zig_derived`: Zig performs `assert(stream.pos == total_buffer_size)` only under comptime assertion guard.
    - `ambiguities_or_assumptions`: This is not a returned error path in non-assert builds.

30. `theorem_id`: `lockb_save_core_prefix_and_total_size_placeholder`
    - `source_file`: `src/install/lockfile/bun.lockb.zig`
    - `source_reference`: `lines 22-30, 254-256`
    - `statement`: Save writes header, format, meta hash, and reserves a u64 total-size slot before serialized body; later records `total_size` as current stream position before alignment padding.
    - `preconditions`: Writer operations succeed.
    - `expected_behavior`: Output starts with `header_bytes`, little-endian format, meta hash, then placeholder u64; `total_size.*` is body end before repeated alignment padding.
    - `edge_cases_covered`: all saved lockfiles; padding excluded from logical total size.
    - `why_this_is_Zig_derived`: Zig writes these fields in order and sets `total_size` before writing `alignment_bytes_to_repeat_buffer`.
    - `ambiguities_or_assumptions`: This snippet does not show backpatching of the placeholder; likely handled by caller or omitted from excerpt.

31. `theorem_id`: `lockb_save_optional_section_order`
    - `source_file`: `src/install/lockfile/bun.lockb.zig`
    - `source_reference`: `lines 74-252`
    - `statement`: Save emits optional sections only in this fixed order: workspace, trusted, overrides, patched dependencies, catalogs, config version.
    - `preconditions`: Save reaches optional-section writing.
    - `expected_behavior`: Any emitted extension tags appear as a subsequence of that order, except config-version is always emitted.
    - `edge_cases_covered`: all valid tag combinations written by Zig save.
    - `why_this_is_Zig_derived`: Optional `if` blocks occur sequentially in this order and config tag is unconditional.
    - `ambiguities_or_assumptions`: Trusted dependencies has two mutually exclusive tags.

32. `theorem_id`: `lockb_save_workspace_section_condition`
    - `source_file`: `src/install/lockfile/bun.lockb.zig`
    - `source_reference`: `lines 74-112`
    - `statement`: Save emits workspace extension only when `workspace_versions.count() > 0`.
    - `preconditions`: `this.workspace_versions.count()` known.
    - `expected_behavior`: If count is zero, no workspace tag or workspace arrays are written; if count is positive, tag plus four arrays are written.
    - `edge_cases_covered`: no workspace versions; workspace paths may be nonempty but workspace_versions empty.
    - `why_this_is_Zig_derived`: Zig gates the entire workspace block solely on `workspace_versions.count() > 0`.
    - `ambiguities_or_assumptions`: It does not check workspace_paths count before writing paths inside the block.

33. `theorem_id`: `lockb_save_trusted_dependencies_none_empty_nonempty`
    - `source_file`: `src/install/lockfile/bun.lockb.zig`
    - `source_reference`: `lines 114-129`
    - `statement`: Save distinguishes absent, empty-present, and nonempty trusted dependencies.
    - `preconditions`: `this.trusted_dependencies` is `null`, present with count zero, or present with count greater than zero.
    - `expected_behavior`: Null writes no trusted tag; present-empty writes `has_empty_trusted_dependencies_tag` only; present-nonempty writes `has_trusted_dependencies_tag` and key array.
    - `edge_cases_covered`: explicit empty trusted list vs absent field.
    - `why_this_is_Zig_derived`: Zig has nested `if` over optional value and count.
    - `ambiguities_or_assumptions`: None.

34. `theorem_id`: `lockb_save_overrides_section_condition`
    - `source_file`: `src/install/lockfile/bun.lockb.zig`
    - `source_reference`: `lines 131-157`
    - `statement`: Save emits overrides only when override map count is positive.
    - `preconditions`: `this.overrides.map.count()` known.
    - `expected_behavior`: If zero, no overrides tag; if positive, writes tag, keys array, and externalized dependency values array.
    - `edge_cases_covered`: empty overrides map.
    - `why_this_is_Zig_derived`: Zig gates block on `count() > 0` and converts each dependency via `toExternal`.
    - `ambiguities_or_assumptions`: None.

35. `theorem_id`: `lockb_save_patched_dependencies_condition_and_assertion`
    - `source_file`: `src/install/lockfile/bun.lockb.zig`
    - `source_reference`: `lines 159-181`
    - `statement`: Save emits patched dependencies only when entries are present and asserts every patchfile hash is non-null.
    - `preconditions`: `this.patched_dependencies.entries.len` known.
    - `expected_behavior`: If zero, no patched tag; if positive, each value must satisfy `!patchfile_hash_is_null`, then tag, keys array, and values array are written.
    - `edge_cases_covered`: empty patched map; invalid patched dep value.
    - `why_this_is_Zig_derived`: Zig gates on `entries.len > 0` and asserts each value before writing.
    - `ambiguities_or_assumptions`: Assertion behavior depends on build/assert configuration.

36. `theorem_id`: `lockb_save_catalogs_section_condition`
    - `source_file`: `src/install/lockfile/bun.lockb.zig`
    - `source_reference`: `lines 183-248`
    - `statement`: Save emits catalogs only when `catalogs.hasAny()` is true.
    - `preconditions`: Catalog default/groups state known.
    - `expected_behavior`: If false, no catalogs tag; if true, writes default keys/deps, group names, and each group’s keys/deps in group order.
    - `edge_cases_covered`: no catalogs; default-only; group-only; empty group.
    - `why_this_is_Zig_derived`: Zig gates block on `hasAny()` and iterates default and groups.
    - `ambiguities_or_assumptions`: Exact `hasAny()` definition is external.

37. `theorem_id`: `lockb_save_config_version_always_written`
    - `source_file`: `src/install/lockfile/bun.lockb.zig`
    - `source_reference`: `lines 250-252`
    - `statement`: Save always writes config-version tag and a config-version integer.
    - `preconditions`: Save reaches line 250.
    - `expected_behavior`: `has_config_version_tag` is emitted; value is `options.config_version` if present, otherwise `.current`.
    - `edge_cases_covered`: options has no config version.
    - `why_this_is_Zig_derived`: This write is unconditional and uses `orelse .current`.
    - `ambiguities_or_assumptions`: Exact integer values are external.

38. `theorem_id`: `lockb_save_windows_separator_debug_assertions`
    - `source_file`: `src/install/lockfile/bun.lockb.zig`
    - `source_reference`: `lines 48-66`; helper `Buffers.zig lines 189-236`
    - `statement`: In assertion-enabled builds, saved folder/symlink/local-tarball/workspace paths must not contain Windows path separator.
    - `preconditions`: `Environment.allow_assert` true; package resolutions or dependency versions include path-like tags.
    - `expected_behavior`: Assertion/panic occurs if path string contains `std.fs.path.sep_windows`.
    - `edge_cases_covered`: Windows separator in folder, symlink, local tarball, workspace paths.
    - `why_this_is_Zig_derived`: Zig explicitly asserts or panics on these path tags before/during serialization.
    - `ambiguities_or_assumptions`: Assertion-only robustness; release behavior may not enforce.

39. `theorem_id`: `lockb_valid_optional_tag_combination_is_ordered_subsequence`
    - `source_file`: `src/install/lockfile/bun.lockb.zig`
    - `source_reference`: `save lines 74-252; load lines 331-575`
    - `statement`: The interoperable optional-tag language is an ordered subsequence of save order, with trusted represented by at most one of nonempty or empty trusted tag.
    - `preconditions`: Optional extension tags are intended to be consumed by this loader without final-position assertion failure.
    - `expected_behavior`: Tags may be omitted, but present tags should appear in parser order: workspace, trusted/empty-trusted, overrides, patched, catalogs, config.
    - `edge_cases_covered`: no optional tags; only config; any subset in order; trusted empty vs nonempty.
    - `why_this_is_Zig_derived`: Save only writes this order; load probes the same order and rewinds unknown tags except final config slot.
    - `ambiguities_or_assumptions`: Out-of-order tags can be skipped or consumed as unknown depending on position; assertion-enabled builds may reject via final position assert.

40. `theorem_id`: `lockb_read_array_corrupt_offsets_error`
    - `source_file`: `src/install/lockfile/Buffers.zig`
    - `source_reference`: `lines 79-139`
    - `statement`: Any optional-section array read fails on sentinel, zero, backward, inverted, or out-of-buffer offsets.
    - `preconditions`: `Lockfile.Buffers.readArray` is invoked by one of the lockb optional-section branches.
    - `expected_behavior`: Returns `error.CorruptLockfile` when `start_pos` or `end_pos` is `0xDEADBEEF`, zero, backward relative to current position, `start_pos > end_pos`, or `end_pos > stream.buffer.len`.
    - `edge_cases_covered`: corrupt array metadata; empty array represented by `start_pos == end_pos`; boundary at end of buffer.
    - `why_this_is_Zig_derived`: `readArray` contains explicit checks for all listed conditions and returns empty array when byte length is zero.
    - `ambiguities_or_assumptions`: Type alignment/casting behavior is helper-level implementation detail.