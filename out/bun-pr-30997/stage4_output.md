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
