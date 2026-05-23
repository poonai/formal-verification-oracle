Implemented Dafny port for `src/install/lockfile/bun.lockb.rs::load` at:

`/home/saint/bun/src/install/lockfile/bun.lockb.dfy`

What’s included:
- Rust-faithful `Load` method mirroring the Rust control flow and update order.
- Minimal Dafny model types for `Lockfile`, `Stream`, package/buffer/map helpers, etc.
- Narrow helper methods for Rust-specific deserialization operations.
- Diagnostic sample assertion method for invalid-header behavior.

Non-operational deviations:
- Bun-specific serializers/maps are mechanically abstracted as small Dafny helpers.
- Some verifier scaffolding was added for bounds/termination.
- I attempted Dafny verification; the file is syntactically close but still has remaining verification/frame obligations around mutable map fields and stream-position facts. I did not use `assume`, axioms, or proof-shortcuts to force these through.
