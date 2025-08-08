## Farelo Mobile — Refactoring Plan

This document proposes a pragmatic, step-by-step refactor to make the codebase more robust, scalable, and easy to maintain, while preserving Expo Router conventions and current app behavior.

### Goals
- Improve structure and separation of concerns without fighting Expo Router’s `app/` constraints
- Establish consistent patterns for data access, caching, and mutations (Supabase + React Query)
- Enforce code quality, typing, and UI/theming consistency (including skeleton loaders for all components)
- Prepare the codebase for growth (features, tests, CI, release automation)

### Non‑Goals
- No feature changes beyond structural and reliability improvements
- No runtime behavior change unless explicitly stated (e.g., bug fixes)

---

## Current State (High-Level Assessment)

- Routing uses Expo Router (`app/`) correctly; providers are set in `app/_layout.tsx`.
- Supabase client is centralized in `lib/supabase.ts` with `AsyncStorage` auth and auto-refresh via `AppState`.
- Global state combines React Context (auth, paywall, revenuecat) with React Query for server state.
- Types in `types/db.ts` are handwritten. No supabase-generated types, which risks schema drift.
- Hooks (e.g., `useRecipes`, `useLogs`) embed query details directly, sometimes mixing responsibilities (fetch, transform, cache, navigate).
- UI follows a components directory; several skeleton loaders exist but not consistently across all components.
- Theming relies on `constants/Colors.ts`; design tokens (spacing, typography) are not centralized.

Notable issues to fix immediately:
- React Query key mismatch in recipes:
  - `useRecipes` uses `RECIPE_KEYS.search(searchTerm)` (no `profileId`), but reads from and writes to list caches keyed by `RECIPE_KEYS.list(profileId)`. This causes cache misses and cross-user cache bleed. Keys must include all inputs that affect the query.
- `AuthContext` has extensive console logging and mixed responsibilities (session init, profile fetching, revenuecat login). It should be slimmer with centralized logging utilities.
- No Supabase type generation; manual types risk divergence from DB schema.

---

## Target Structure (Incremental, Compatible with Expo Router)

Keep `app/` for screens and routing; extract domain logic and UI building blocks into `src/`.

```
app/
  (tabs)/
  recipe/[recipeId]/
  log/[logId]/
  ... screens only (thin)

src/
  features/
    recipes/
      api/               # Supabase queries for recipes
      hooks/             # useRecipes, useRecipe, useCreateRecipe, etc.
      components/        # recipe-specific UI (not shared)
      types/             # feature-level DTOs/mappers
    logs/
      api/
      hooks/
      components/
      types/
    social/              # follows, likes, comments, blocks
    profiles/
    reports/

  services/
    supabase/
      client.ts          # supabase client
      types.gen.ts       # generated supabase types
    revenuecat/
      index.ts
    logger/
      index.ts           # centralized logging (levels, env-aware)

  providers/             # app-wide providers only
    AuthProvider.tsx
    PaywallProvider.tsx
    RevenueCatProvider.tsx
    QueryProvider.tsx
    ThemeProvider.tsx

  ui/                    # shared, app-wide reusable UI
    skeletons/
    primitives/          # Button, Input, etc.
    layout/

  theme/
    colors.ts
    spacing.ts
    typography.ts        # Title size 20, etc.
    index.ts

  config/
    env.ts               # typed access to EXPO_PUBLIC_* vars
    reactQuery.ts        # default query options

  utils/
    dates.ts
    strings.ts
    array.ts

  types/
    domain.ts            # domain-facing types
    db.ts                # thin wrappers over generated types, if needed
```

Rationale:
- Screens remain in `app/` and stay thin; all domain logic and UI composition lives under `src/features/*`.
- All remote data access goes through `src/features/*/api` and `src/services/supabase`.
- Shared UI and design tokens live under `src/ui` and `src/theme`.
- Providers are co-located under `src/providers` and imported in `app/_layout.tsx`.

---

## Phased, Step-by-Step Refactor

Each phase is independently shippable. Prefer small PRs per step.

### Phase 0 — Tooling and Guardrails
1) TypeScript strictness
   - Enable stricter TS options (noImplicitAny, strictNullChecks, exactOptionalPropertyTypes).
2) ESLint + Prettier
   - Add base config and recommended RN/Expo/TypeScript rules.
3) CI checks
   - Add GitHub Actions: typecheck, lint, tests on PR.
4) Commit hooks
   - Add Husky + lint-staged for pre-commit lint/format.

PowerShell (Windows) install commands:
```
npm i -D eslint prettier @react-native/eslint-config @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-config-prettier eslint-plugin-react eslint-plugin-react-hooks husky lint-staged
```

### Phase 1 — Environment & Config
1) Centralize env access in `src/config/env.ts` with runtime validation via `zod`.
2) Keep using `EXPO_PUBLIC_*` for client-side vars. Fail fast if missing.
3) Move React Query defaults to `src/config/reactQuery.ts` and import from `app/_layout.tsx`.

Add:
```
npm i zod
```

### Phase 2 — Supabase Types & Data Layer
1) Generate types from Supabase schema:
   - Install Supabase CLI and generate `src/services/supabase/types.gen.ts`.
   - Configure a script to re-generate on schema changes.
   - Use these types instead of handwritten `types/db.ts` where possible.
2) Create `src/services/supabase/client.ts` moving current `lib/supabase.ts` implementation.
3) Add light wrappers for common patterns:
   - `withErrorHandling<T>()` to normalize errors
   - `deserialize/serialize` (e.g., dates, JSON fields)

Example PowerShell generation command (once CLI is installed and authenticated):
```
supabase gen types typescript --project-id <YOUR_PROJECT_ID> > src/services/supabase/types.gen.ts
```

### Phase 3 — Feature Services and Hooks
1) Introduce `src/features/recipes/api/recipes.api.ts` with pure Supabase calls.
2) Move `hooks/useRecipes.ts` logic into `src/features/recipes/hooks/useRecipes.ts` consuming the API.
3) Fix React Query key issues:
   - Keys must include all query inputs. For example:
     - `list(profileId, searchTerm)` and `detail(id)`.
   - Ensure any cache read/write uses the same key factory.
4) Standardize mutations:
   - Co-locate optimistic updates and invalidations next to mutations.
   - Prefer `queryClient.invalidateQueries` after server success unless local update is trivial.
5) Extract `useLogs` into `src/features/logs/...` and split responsibilities:
   - `useFeed` (infinite query for timeline)
   - `useProfileLogs(profileId)`
   - `useLog(id)`
   - Keep block filtering in API layer to avoid duplicating logic across hooks.

Immediate bug fix (Recipes):
- Change the recipes list query key to include `profileId` and `searchTerm`, and ensure `useRecipe` cache lookup reads from that exact key.

### Phase 4 — Providers and Auth
1) Move `contexts/AuthContext.tsx` to `src/providers/AuthProvider.tsx` and slim it down:
   - Extract profile fetch into `profiles/api` service.
   - Move RevenueCat calls behind `src/services/revenuecat`.
   - Replace console logs with `src/services/logger` (level-based, disabled in prod).
2) Add `ErrorBoundary` and `Suspense`-friendly fallbacks at layout/screen level where feasible.

### Phase 5 — UI System, Theming, and Skeletons
1) Create `src/theme/*` design tokens:
   - Colors: BROWN `#793206`, BEIGE `#EDE4D2`, and low-opacity brown `#79320633`.
   - Typography: set title size 20.
   - Spacing, radii, shadows.
2) Shared primitives in `src/ui/primitives` (Button, Input, Text, View, Divider).
3) Skeleton loaders:
   - Define a small skeleton toolkit in `src/ui/skeletons` and use it everywhere instead of spinners/placeholders.
   - Audit all components and add a skeleton variant if missing.
4) Keep feature-specific UI under `src/features/*/components`.

### Phase 6 — Testing
1) Add `@testing-library/react-native` for component tests and hook tests via `@testing-library/react-hooks` or React Testing Library for hooks.
2) Mock Supabase API at the service layer; test hooks and components against these mocks.
3) Write smoke tests for critical flows: auth init, recipe list, recipe detail, feed load.

```
npm i -D @testing-library/react-native @testing-library/jest-native
```

### Phase 7 — Performance & Offline
1) Convert feed to `useInfiniteQuery` with a paginated API (keyset pagination by `created_at`).
2) Add React Query persistence to `AsyncStorage` for better perceived performance offline.
3) Debounce search queries and memoize list items; ensure `FlatList` has stable `keyExtractor` and `getItemLayout` where appropriate.
4) Consider Supabase Realtime subscriptions for logs/comments/likes (opt-in, gated by performance measures).

### Phase 8 — CI/CD and Quality Gates
1) GitHub Actions:
   - jobs: typecheck, lint, test on PR
2) Require green checks before merge.
3) EAS build pipelines remain unchanged; consider adding `preview` channels.

---

## Conventions and Standards

- Naming: prefer verbose, descriptive identifiers; functions as verbs, values as nouns.
- File size: split files > ~300 lines; functions > ~50 lines into smaller helpers.
- Comments: explain “why”, avoid obvious “how”.
- Control flow: early returns; avoid deep nesting.
- Types: annotate public APIs, avoid `any`, prefer generated types.
- React Query:
  - Keys include all inputs, centralized key factories per feature.
  - Mutations colocated with their cache updates/invalidations.
  - Set `staleTime` and `gcTime` appropriately; do not over-invalidate.
- UI:
  - Titles use font size 20.
  - Colors use BROWN/BEIGE palette; low-opacity brown `#79320633` where needed.
  - Every component has a skeleton loader variant.

---

## Concrete To‑Do Checklist (Cut here into PRs)

- [ ] Phase 0: ESLint/Prettier/Husky/CI
- [ ] Phase 1: `src/config/env.ts`, `src/config/reactQuery.ts`
- [ ] Phase 2: Supabase types generation and `src/services/supabase/client.ts`
- [ ] Phase 3: Recipes service + hooks, FIX query key mismatch
- [ ] Phase 3: Logs service split (`useFeed`, `useProfileLogs`, `useLog`)
- [ ] Phase 4: Move/simplify Auth provider, add logger service, isolate RevenueCat
- [ ] Phase 5: Theme tokens + shared UI primitives + skeleton toolkit, audit all components
- [ ] Phase 6: Add tests and mocks, write smoke tests
- [ ] Phase 7: Infinite feed, query persistence, debounce search
- [ ] Phase 8: GitHub Actions gates

---

## Appendix — Examples

### Example: Recipes Query Keys (Fix)

Old (problematic):
```ts
// key does not include profileId, and other places read from list(profileId)
RECIPE_KEYS = {
  lists: () => ['recipes', 'list'] as const,
  list: (profileId: string) => [...RECIPE_KEYS.lists(), profileId] as const,
  search: (searchTerm?: string) => [...RECIPE_KEYS.lists(), { searchTerm }] as const,
}
```

New (consistent):
```ts
export const RECIPE_KEYS = {
  root: ['recipes'] as const,
  list: (profileId: string, searchTerm?: string) =>
    [...RECIPE_KEYS.root, 'list', { profileId, searchTerm }] as const,
  detail: (id: string) => [...RECIPE_KEYS.root, 'detail', id] as const,
}

// useRecipes(profileId, searchTerm)
useQuery({
  queryKey: RECIPE_KEYS.list(profileId, searchTerm),
  // ...
});

// useRecipe(id) reads/writes RECIPE_KEYS.detail(id)
```

### Example: Env Validation

```ts
// src/config/env.ts
import { z } from 'zod';

const schema = z.object({
  EXPO_PUBLIC_SUPABASE_URL: z.string().url(),
  EXPO_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  EXPO_PUBLIC_REVENUECAT_API_KEY_IOS: z.string().optional(),
  EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID: z.string().optional(),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error(parsed.error.format());
  throw new Error('Missing or invalid environment variables');
}

export const Env = parsed.data;
```

---

## Definition of Done

- All features read data exclusively through feature APIs and hooks.
- All queries/mutations use consistent key factories; no cross-key cache reads.
- Auth provider is lean; logs routed via logger service; RevenueCat logic isolated.
- Supabase schema types are generated and consumed at compile time.
- UI uses shared tokens; every component has a skeleton loader.
- CI enforces lint, typecheck, tests; PRs are green.

---

## Migration Notes

- Perform refactors in small PRs with pure moves first (no logic changes) so git history remains useful.
- Fix the recipes query-key bug early to avoid confusing cache behavior during the rest of the refactor.
- Keep `app/` as screens-only; move logic iteratively to `src/` per feature.


