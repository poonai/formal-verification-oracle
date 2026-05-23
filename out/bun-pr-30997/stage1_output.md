Created Dafny port:

- `src/runtime/server/RequestContext.dfy`

Ported `RequestContext.rs::do_write_headers` with:
- same control-flow shape
- mechanical helpers for `fast_remove` and `to_uws_response`
- HTTP/3 conditional header removal preserved
- nullable response branch preserved
- isolated sample assertion method exercising the port

Verification result:

```text
Dafny program verifier finished with 8 verified, 0 errors
```

Non-operational deviation: Rust FFI/uWS response behavior is represented with small Dafny model classes; `to_uws_response` records the call on `FetchHeaders` so the sample assertion can prove the branch executed without modeling uWS internals.
