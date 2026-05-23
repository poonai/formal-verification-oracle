dataset_id: bun-pr-30997
expected_bug_slug: detached_response_fallback_content_type
bug_summary: detached responses still got a fallback content-type, which Zig suppressed.
rust_selector: @src/runtime/server/RequestContext.rs::do_write_headers
zig_semantic_anchor: doWriteHeaders
notes: PR 30997 changed fallback content-type behavior in do_write_headers.

theorem_packets:
1. theorem packet:
   - `theorem_id`: `RC_DWH_001_always_removes_content_length`
   - `source_file`: `/home/saint/bun/src/runtime/server/RequestContext.zig`
   - `source_reference`: `doWriteHeaders`, lines 2317-2320
   - `statement`: Calling `doWriteHeaders(headers)` removes `ContentLength` from `headers` for every transport and response-state case.
   - `preconditions`: `headers` is a valid non-null `*WebCore.FetchHeaders`; `this` is a valid `RequestContext`.
   - `expected_behavior`: After return, `headers.fastHas(.ContentLength)` would be false / the Content-Length header is absent.
   - `edge_cases_covered`: HTTP/1 or HTTP/2; HTTP/3; `this.resp == null`; `this.resp != null`; header initially present or absent.
   - `why_this_is_Zig_derived`: Zig unconditionally executes `headers.fastRemove(.ContentLength);` before any branch.
   - `ambiguities_or_assumptions`: Assumes `fastRemove` is total/idempotent when the header is absent.

2. theorem packet:
   - `theorem_id`: `RC_DWH_002_always_removes_transfer_encoding`
   - `source_file`: `/home/saint/bun/src/runtime/server/RequestContext.zig`
   - `source_reference`: `doWriteHeaders`, lines 2317-2320
   - `statement`: Calling `doWriteHeaders(headers)` removes `TransferEncoding` from `headers` for every transport and response-state case.
   - `preconditions`: `headers` is valid non-null; `this` is valid.
   - `expected_behavior`: After return, `headers.fastHas(.TransferEncoding)` would be false / the Transfer-Encoding header is absent.
   - `edge_cases_covered`: HTTP/1 or HTTP/2; HTTP/3; `this.resp == null`; `this.resp != null`; header initially present or absent.
   - `why_this_is_Zig_derived`: Zig unconditionally executes `headers.fastRemove(.TransferEncoding);`.
   - `ambiguities_or_assumptions`: Assumes `fastRemove` is idempotent for absent headers.

3. theorem packet:
   - `theorem_id`: `RC_DWH_003_non_http3_preserves_connection_specific_headers`
   - `source_file`: `/home/saint/bun/src/runtime/server/RequestContext.zig`
   - `source_reference`: `doWriteHeaders`, lines 2321-2327
   - `statement`: When `http3 == false`, `doWriteHeaders` does not remove `Connection`, `KeepAlive`, `ProxyConnection`, or `Upgrade`.
   - `preconditions`: `headers` is valid non-null; `this` is valid; comptime `http3 == false`.
   - `expected_behavior`: The presence/absence of `Connection`, `KeepAlive`, `ProxyConnection`, and `Upgrade` after the call equals their presence/absence before the call, except for any effects inside `toUWSResponse`.
   - `edge_cases_covered`: No-HTTP3/no-flag behavior; each connection-specific header initially present or absent; `this.resp == null`; `this.resp != null`.
   - `why_this_is_Zig_derived`: The only removals of these four headers are inside `if (comptime http3) { ... }`, so that block is omitted for non-HTTP3 instantiations.
   - `ambiguities_or_assumptions`: Assumes `headers.toUWSResponse` does not mutate/remap these header-presence fields; the Dafny model represents it as preserving them.

4. theorem packet:
   - `theorem_id`: `RC_DWH_004_http3_removes_connection_header`
   - `source_file`: `/home/saint/bun/src/runtime/server/RequestContext.zig`
   - `source_reference`: `doWriteHeaders`, lines 2321-2324
   - `statement`: When `http3 == true`, `doWriteHeaders` removes `Connection`.
   - `preconditions`: `headers` is valid non-null; `this` is valid; comptime `http3 == true`.
   - `expected_behavior`: After return, `Connection` is absent.
   - `edge_cases_covered`: Header initially present; header initially absent; `this.resp == null`; `this.resp != null`.
   - `why_this_is_Zig_derived`: Zig executes `headers.fastRemove(.Connection);` inside the HTTP/3-only branch.
   - `ambiguities_or_assumptions`: Assumes `fastRemove` is idempotent for absent headers.

5. theorem packet:
   - `theorem_id`: `RC_DWH_005_http3_removes_keep_alive_header`
   - `source_file`: `/home/saint/bun/src/runtime/server/RequestContext.zig`
   - `source_reference`: `doWriteHeaders`, lines 2321-2325
   - `statement`: When `http3 == true`, `doWriteHeaders` removes `KeepAlive`.
   - `preconditions`: `headers` is valid non-null; `this` is valid; comptime `http3 == true`.
   - `expected_behavior`: After return, `KeepAlive` is absent.
   - `edge_cases_covered`: Header initially present; header initially absent; `this.resp == null`; `this.resp != null`.
   - `why_this_is_Zig_derived`: Zig executes `headers.fastRemove(.KeepAlive);` inside the HTTP/3-only branch.
   - `ambiguities_or_assumptions`: Assumes `fastRemove` is idempotent.

6. theorem packet:
   - `theorem_id`: `RC_DWH_006_http3_removes_proxy_connection_header`
   - `source_file`: `/home/saint/bun/src/runtime/server/RequestContext.zig`
   - `source_reference`: `doWriteHeaders`, lines 2321-2326
   - `statement`: When `http3 == true`, `doWriteHeaders` removes `ProxyConnection`.
   - `preconditions`: `headers` is valid non-null; `this` is valid; comptime `http3 == true`.
   - `expected_behavior`: After return, `ProxyConnection` is absent.
   - `edge_cases_covered`: Header initially present; header initially absent; `this.resp == null`; `this.resp != null`.
   - `why_this_is_Zig_derived`: Zig executes `headers.fastRemove(.ProxyConnection);` inside the HTTP/3-only branch.
   - `ambiguities_or_assumptions`: Assumes `fastRemove` is idempotent.

7. theorem packet:
   - `theorem_id`: `RC_DWH_007_http3_removes_upgrade_header`
   - `source_file`: `/home/saint/bun/src/runtime/server/RequestContext.zig`
   - `source_reference`: `doWriteHeaders`, lines 2321-2327
   - `statement`: When `http3 == true`, `doWriteHeaders` removes `Upgrade`.
   - `preconditions`: `headers` is valid non-null; `this` is valid; comptime `http3 == true`.
   - `expected_behavior`: After return, `Upgrade` is absent.
   - `edge_cases_covered`: Header initially present; header initially absent; `this.resp == null`; `this.resp != null`.
   - `why_this_is_Zig_derived`: Zig executes `headers.fastRemove(.Upgrade);` inside the HTTP/3-only branch.
   - `ambiguities_or_assumptions`: Assumes `fastRemove` is idempotent.

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

9. theorem packet:
   - `theorem_id`: `RC_DWH_009_non_null_response_writes_to_uws_with_resp_kind`
   - `source_file`: `/home/saint/bun/src/runtime/server/RequestContext.zig`
   - `source_reference`: `doWriteHeaders`, line 2328; `resp_kind` definition near top of `NewRequestContext`
   - `statement`: If `this.resp != null`, `doWriteHeaders` forwards the sanitized headers to the underlying uWS response using `resp_kind`.
   - `preconditions`: `headers` is valid non-null; `this` is valid; `this.resp != null`.
   - `expected_behavior`: `headers.toUWSResponse(resp_kind, resp)` is called exactly once after the removals.
   - `edge_cases_covered`: HTTP/3 and non-HTTP3; all header-presence combinations; response available.
   - `why_this_is_Zig_derived`: The final branch calls `headers.toUWSResponse(resp_kind, resp)` only when `this.resp` unwraps.
   - `ambiguities_or_assumptions`: Exact “once” is source-level control-flow derived; Dafny may represent this as `wroteToUwsResponse == true` and `lastRespKind == RESP_KIND`.

10. theorem packet:
   - `theorem_id`: `RC_DWH_010_operation_is_void_and_non_terminating_only_by_callee_failure`
   - `source_file`: `/home/saint/bun/src/runtime/server/RequestContext.zig`
   - `source_reference`: `doWriteHeaders`, lines 2317-2329
   - `statement`: `doWriteHeaders` has no explicit error return, no early return, and no invalid-flag termination branch.
   - `preconditions`: `this` and `headers` satisfy Zig pointer validity obligations.
   - `expected_behavior`: The function completes normally after removals and optional uWS write; it does not signal success/failure via a return value.
   - `edge_cases_covered`: All valid combinations of `http3` and `resp`; absent headers; present headers.
   - `why_this_is_Zig_derived`: The function return type is `void`; body contains no `return`, `try`, `catch`, or explicit termination branch.
   - `ambiguities_or_assumptions`: Does not rule out lower-level panic/termination inside `fastRemove` or `toUWSResponse`; those are imported helper obligations outside this function’s own branching.

11. theorem packet:
   - `theorem_id`: `RC_DWH_011_caller_must_provide_valid_headers_pointer`
   - `source_file`: `/home/saint/bun/src/runtime/server/RequestContext.zig`
   - `source_reference`: `doWriteHeaders` signature, line 2317
   - `statement`: The caller obligation is that `headers` is a valid non-null `*WebCore.FetchHeaders`.
   - `preconditions`: Function is invoked according to Zig pointer rules.
   - `expected_behavior`: There is no null-check for `headers`; the function immediately dereferences it through method calls.
   - `edge_cases_covered`: Invalid/null header pointer is not a supported behavioral case.
   - `why_this_is_Zig_derived`: The parameter type is a non-optional pointer, and the first operations are `headers.fastRemove(...)`.
   - `ambiguities_or_assumptions`: Dafny may not model pointer invalidity; treat this as a precondition, not a theorem over all possible values.

12. theorem packet:
   - `theorem_id`: `RC_DWH_012_all_header_presence_combinations_are_valid_inputs`
   - `source_file`: `/home/saint/bun/src/runtime/server/RequestContext.zig`
   - `source_reference`: `doWriteHeaders`, lines 2319-2328
   - `statement`: No combination of the modeled header-presence booleans is invalid; absent headers are handled by `fastRemove` just like present headers.
   - `preconditions`: `headers` is valid non-null.
   - `expected_behavior`: For every initial combination of `ContentLength`, `TransferEncoding`, `Connection`, `KeepAlive`, `ProxyConnection`, and `Upgrade`, `doWriteHeaders` applies the same branch rules without rejecting the input.
   - `edge_cases_covered`: Empty header set; singleton header set; all headers present; arbitrary subsets.
   - `why_this_is_Zig_derived`: The function never tests for header presence before removal and never branches to an error/termination path based on header combinations.
   - `ambiguities_or_assumptions`: Relies on `fastRemove` semantics for absent headers being safe/idempotent.