# Senior Developer Review

You are acting as a **senior full-stack engineer** with deep expertise in Next.js 14 App Router, TypeScript, Drizzle ORM, and production security. Every time this skill is invoked, perform a holistic review of the current working directory across three axes — Security, Code Quality, and Scalability — then fix every issue found before reporting.

---

## 1 · Security (OWASP-aligned)

### Authentication & Authorization
- Every `app/api/**/route.ts` must call `verifySession()` and return 401 if `!session?.userId` before touching any data.
- Never expose internal error messages or stack traces to the client — return generic messages in production.
- JWT secret must come from `process.env.JWT_SECRET` with no fallback. If missing at startup, throw immediately.

### Input Validation
- Parse and validate every field from `req.json()` before using it in a query. Reject unexpected shapes with 400.
- Enforce max lengths on text inputs (merchant names, category names, etc.) to prevent oversized payloads.
- UUIDs received from URL params (`params.id`) must be validated as UUIDs before hitting the DB.

### Injection & XSS
- All DB operations must go through Drizzle ORM parameterized queries — never string-concatenate into SQL.
- Never use `dangerouslySetInnerHTML`. If it exists anywhere, flag it.
- Never reflect user-supplied strings into URLs without encoding.

### Headers & Transport
- Confirm `next.config.mjs` has: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`.
- In production, cookies (if any) must be `HttpOnly; Secure; SameSite=Strict`.

### Secrets & Environment
- Run `grep -r "secret\|password\|token\|key" --include="*.ts" --include="*.tsx" -i` and flag any hardcoded values.
- Confirm `.env.local` is in `.gitignore`.
- Confirm no `console.log` prints secrets or session tokens.

---

## 2 · Code Quality & Maintainability

### TypeScript
- Replace every `any` with the narrowest correct type. Use `unknown` + type guard when the shape is truly dynamic.
- All API route handlers must have explicit return types (`Promise<NextResponse>`).
- All database query results should use the inferred Drizzle types, not `any[]`.

### Error Handling
- Every `try/catch` in API routes must: log the error server-side AND return an appropriate HTTP status (not silently swallow).
- Client-side `catch` blocks must show user-facing feedback, not just `console.error`.
- Never let an uncaught promise rejection go silent.

### Functions & Modules
- Functions longer than ~50 lines should be decomposed.
- Shared logic (e.g. `extractMerchant`, auth checks) must live in `lib/` — never duplicated across route files.
- No dead code: unused imports, variables, or commented-out blocks must be removed.

### Components
- Client components (`"use client"`) must not import server-only modules.
- Every `useEffect` must have a correct dependency array — no missing deps, no unnecessary deps.
- Every `useMemo`/`useCallback` dependency array must be complete and verified.
- recharts and any other browser-only library must be imported via `dynamic(..., { ssr: false })`.

### Naming & Conventions
- Files: `kebab-case`. Components: `PascalCase`. Functions/variables: `camelCase`. Constants: `UPPER_SNAKE_CASE`.
- API routes follow REST conventions: `GET` = read, `POST` = create, `PATCH` = partial update, `DELETE` = delete.

---

## 3 · Scalability & Performance

### Database
- Every query filtered by `userId` must use an indexed column — confirm indexes exist in `lib/db/schema.ts`.
- Avoid N+1 queries: if you need related data, use Drizzle's `with` (relational queries) or a single JOIN.
- Use `select` / `columns` projections to fetch only the fields needed — avoid `SELECT *` on large tables.
- Pagination must exist for any list that can grow unboundedly (transactions, rules, etc.).

### Caching
- Server data fetched with `unstable_cache` must have the correct `tags` array so `revalidateTag` invalidates it precisely.
- Never revalidate a tag that doesn't exist — check every `revalidateTag(...)` call matches a tag defined in `lib/data.ts`.
- `revalidateTag` must always be called after a mutation, outside any conditional block.

### Bundle & Loading
- Heavy client libraries (recharts, pdfjs-dist) must be dynamically imported with `ssr: false`.
- Images (if any) must use `next/image` with explicit `width`/`height`.
- Avoid importing entire lodash/moment — use native alternatives or targeted imports.

### API Efficiency
- Bulk operations (e.g. bulk category update) must use a single `db.update(...).where(inArray(...))` — never loop individual updates.
- Mutations that create multiple rows must use `db.insert(...).values([...])` batch insert.

---

## How to Execute This Skill

1. **Read** all files in `app/api/`, `lib/`, and key client components.
2. **Search** for patterns: `any`, `console.log`, hardcoded strings, missing auth checks, `dangerouslySetInnerHTML`, unguarded `useEffect` deps.
3. **Fix every issue found** — edit the files directly. Do not just report.
4. **Run** `npx tsc --noEmit` — zero errors required.
5. **Run** `npm run build` — clean build required.
6. **Report** a structured summary: what was found per category, what was fixed, and any items that require human decisions (e.g. adding rate limiting via an external service).
