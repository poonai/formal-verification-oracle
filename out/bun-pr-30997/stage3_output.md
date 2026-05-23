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
