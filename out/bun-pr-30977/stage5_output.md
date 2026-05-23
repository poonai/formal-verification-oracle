no bug found

The proof only modeled and proved `parseHexToInt` valid-length behavior. It did not identify the intended release-build bug: a side-effecting `assert(...)` incorrectly ported to `debug_assert!(...)` in `DevServer::init`, causing the side effect to be skipped.
