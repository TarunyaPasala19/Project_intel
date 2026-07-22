---
name: Stale composite dist types
description: Fixing "Module has no exported member" errors from workspace libs with composite TS builds
---

Rule: when a package importing a workspace lib (e.g. `@workspace/db`) fails typecheck with "has no exported member" for symbols that clearly exist in the lib's src, the lib's `dist/*.d.ts` (composite/emitDeclarationOnly output) is stale.

**Why:** consuming packages use TS project references, which resolve types from the referenced project's declaration output, not src. Adding exports to src without rebuilding leaves old declarations in place.

**How to apply:** run `npx tsc -b <lib path> --force` (e.g. `npx tsc -b lib/db --force`) after adding/renaming exports in a shared lib, then re-run the consumer's typecheck.
