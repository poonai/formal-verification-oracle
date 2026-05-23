dataset_id: bun-pr-31008
expected_bug_slug: bun_lockb_package_id_out_of_range_crash
expected_stage3_label: intended bug found
bug_summary: Out-of-range package_id values in bun.lockb crashed install instead of being treated as corruption.
rust_selector: @src/install/lockfile/bun.lockb.rs::load
zig_semantic_anchor: load
notes: Primary target is bun.lockb load; PR 31008 also added a companion range check in Package.rs.

theorem_packet:
8. `theorem_id`: `lockb_load_package_result_propagation`
   - `source_file`: `src/install/lockfile/bun.lockb.zig`
   - `source_reference`: `lines 306-316`; helper `src/install/lockfile/Package.zig lines 2124-2218`
   - `statement`: Successful package deserialization installs the loaded package list and propagates its update flag.
   - `preconditions`: Header/format/total-size valid; `Package.Serializer.load` succeeds.
   - `expected_behavior`: `lockfile.packages == packages_load_result.list`; `res.packages_need_update == packages_load_result.needs_update`.
   - `edge_cases_covered`: package metadata needing update; migrated package list.
   - `why_this_is_Zig_derived`: Zig directly assigns both fields from `packages_load_result`.
   - `ambiguities_or_assumptions`: Package serializer internals are treated as helper behavior.

proof_output:
Theorem `lockb_load_package_result_propagation` was **not proved**.

Classification: **missing Dafny spec**  
Secondary blocker: the existing Dafny file has unrelated proof/frame gaps, so it does not verify cleanly before adding this theorem.

What I investigated:
- Read the theorem packet first.
- Confirmed Zig behavior at `bun.lockb.zig` lines 306–316:
  - `lockfile.packages = packages_load_result.list`
  - `res.packages_need_update = packages_load_result.needs_update`
- Read `Package.zig` lines 2124–2218 and nearby `loadFields`:
  - `Package.Serializer.load` returns `{ list, needs_update }`.
  - `needs_update` is set when package metadata `meta.needsUpdate()` is found.
  - `migrate_from_v2` builds a migrated package list from the old V2 package representation.
- Inspected the Dafny model:
  - `Load` does perform the same direct assignment/update after `PackageSerializerLoad`.
  - But `PackageSerializerLoad` is modeled as a stub that always creates a fresh default `PackageLoadResult`, with an empty list and `needs_update := false`.
  - It has no spec/input structure representing “metadata needing update” or “migrated package list”.

Concrete blocker:
- The main propagation shape is present in the Dafny method body, but the theorem packet’s edge cases require Zig-derived helper behavior from `Package.Serializer.load`.
- The current Dafny helper does not encode that behavior. In particular, the “package metadata needing update” edge case conflicts with the model because the Dafny helper can only return `needs_update == false`.

Verification status:
- Running `dafny verify src/install/lockfile/bun.lockb.dfy` currently fails with existing frame/assertion errors unrelated to this theorem, including modifies-clause failures around patched dependencies/catalog maps and assertions around `stream.pos` and `workspace_paths`.
- I tried the smallest local proof-oriented assertions/invariants to diagnose those frame gaps, but they did not resolve the baseline verification failures; I reverted them.

Added specs/helper lemmas:
- None retained.
- A faithful proof would need a Zig-derived specification for `PackageSerializerLoad` that exposes:
  - returned package list,
  - returned `needs_update`,
  - migration behavior for V2 package lists.