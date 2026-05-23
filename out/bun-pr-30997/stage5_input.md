dataset_id: bun-pr-30997
expected_bug_slug: detached_response_fallback_content_type
expected_stage3_label: intended bug found
bug_summary: detached responses still got a fallback content-type, which Zig suppressed.
rust_selector: @src/runtime/server/RequestContext.rs::do_write_headers
zig_semantic_anchor: doWriteHeaders
notes: PR 30997 changed fallback content-type behavior in do_write_headers.

theorem_packet:
8. theorem packet:
   - `theorem_id`: `RC_DWH_008_null_response_only_mutates_headers`
   - `source_file`: `/home/saint/bun/src/runtime/server/RequestContext.zig`
   - `source_reference`: `doWriteHeaders`, lines 2317-2328
   - `statement`: If `this.resp == null`, `doWriteHeaders` performs only the applicable header removals and does not write headers to uWS.
   - `preconditions`: `headers` is valid non-null; `this` is valid; `this.resp == null`.
   - `expected_behavior`: `ContentLength` and `TransferEncoding` are removed; if HTTP/3, connection-specific headers are removed; no `headers.toUWSResponse(...)` call occurs.
   - `edge_cases_covered`: Detached/null response; HTTP/3 and non-HTTP3; all initial header-presence combinations.
   - `why_this_is_Zig_derived`: Final write is guarded by `if (this.resp) |resp| headers.toUWSResponse(resp_kind, resp);`.
   - `ambiguities_or_assumptions`: Dafny can model this as `wroteToUwsResponse` remaining unchanged/false if initially false; Zig has no explicit return value for this distinction.

proof_output:
Theorem `RC_DWH_008_null_response_only_mutates_headers` was proved against the existing Dafny method body.

Verification run:

```sh
dafny verify /home/saint/bun/src/runtime/server/RequestContext.dfy
```

Result:

```text
Dafny program verifier finished with 11 verified, 0 errors
```

Investigated:

- Read the theorem packet first.
- Confirmed Zig source at `RequestContext.zig` `doWriteHeaders`, lines 2317-2328:
  - always removes `ContentLength`
  - always removes `TransferEncoding`
  - removes connection-specific headers only for HTTP/3
  - calls `headers.toUWSResponse(...)` only under `if (this.resp) |resp| ...`

Added proof/spec structure only; the Dafny method body was not changed:

- Added constructor postconditions for `FetchHeaders`.
- Added `fast_remove` frame-preservation postconditions for `wroteToUwsResponse` and `lastRespKind`.
- Added `do_write_headers` postconditions:
  - null `resp` preserves `wroteToUwsResponse`
  - null `resp` preserves `lastRespKind`
  - non-HTTP/3 preserves connection-specific headers
- Added two edge-case witness methods:
  - `rc_dwh_008_null_response_non_http3_witness`
  - `rc_dwh_008_null_response_http3_witness`

These witnesses cover detached/null response, HTTP/3 and non-HTTP/3, and all initial header-presence combinations via Boolean parameters.

No failure classification applies because the theorem was proved.