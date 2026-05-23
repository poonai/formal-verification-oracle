Created `/home/saint/bun/src/runtime/bake/DevServer.dfy` with a Dafny port of `src/runtime/bake/DevServer.rs::init`.

Verified with:

```sh
cd /home/saint/bun
dafny verify src/runtime/bake/DevServer.dfy
```

Result: `25 verified, 0 errors`.

Notes:
- Rust/JSC/OS primitives are represented by narrow helper methods/classes.
- Core `init` control flow mirrors the Rust path: feature increment shape, dump dir setup, SSR graph flag, DevServer allocation/init, filesystem/watcher/transpiler setup, resolve, hash, react-refresh insertion, server runtime init, router loop, initial scan, final magic check.
- Non-operational deviation: Dafny has no module-level mutable static equivalent for `Features::DEV_SERVER`, so that increment is modeled as a local counter without changing `init(options)` signature.
- Added one isolated `SanityCheck` assertion exercising `init` on a minimal successful input.
