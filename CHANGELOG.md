# Changelog

## 1.0.2 - 2025-09-13
### Added
- Offline retry queue with exponential backoff and manual flush.
- Lazy loaded analytics chart bundle (smaller initial bundle).
- Manual build metadata alignment and version sync (web + Tauri).

### Improved
- Error boundaries (removed `any`, clearer Tauri diagnostics box).
- Offline download button logic with cache + offline short-circuit.
- Type safety: removed stale `syncPendingChanges` usage, introduced typed chart component props.

### Fixed
- Stale white screen & CSP issues previously addressed; consolidated in stable build.
- Lint issues (unused vars, `any`, empty catch) resolved.

### Internal
- Pinned TypeScript to 5.6.2 for stable ESLint parser behavior.
- Synced versions: `package.json` + `tauri.conf.json` -> 1.0.2.
