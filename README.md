# Netflow Finance Dashboard

Dashboard financiero personal para analizar transacciones importadas de estados de cuenta bancarios panameños (Banco General y otros), con auto-categorización, promedios por categoría y KPIs de salud financiera.

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 14 App Router |
| Base de datos | Neon (PostgreSQL serverless) |
| ORM | Drizzle ORM — driver HTTP (`neon-http`) para evitar cold starts por WebSocket |
| Auth | JWT custom: `jose` (sign/verify) + `bcryptjs` (hashing), cookie HttpOnly |
| Estilos | Tailwind CSS con tema personalizado (variables CSS) |
| Gráficos | Recharts |
| Parsers | PapaParse (CSV), `xlsx` (Excel), `pdfjs-dist` v5 ESM (PDF) |

## Features implementadas

### Auth
- Sign-in / Sign-up con JWT de 7 días en cookie HttpOnly
- Email almacenado en el JWT para evitar queries al layout
- Middleware (`middleware.ts`) protege todas las rutas excepto `/sign-in` y `/sign-up`
- `JWT_SECRET` obligatorio (sin fallback inseguro)

### Importación de archivos
- Drag-and-drop (`react-dropzone`) — validación por extensión, no por MIME type (evita problemas en Windows)
- **CSV:** PapaParse + detección automática de columnas
- **Excel:** `xlsx` con `cellDates: true` + normalización NFD de diacríticos (para "Débito" → "debito")
  - Escanea hasta fila 25 buscando encabezados
  - Maneja columnas separadas Débito/Crédito (formato Banco General)
- **PDF:** `pdfjs-dist` client-side con worker en `/public/pdf.worker.min.mjs`
  - Agrupa líneas por coordenada Y, ancla transacciones por fecha española (`01-oct-2025`)
  - Detecta montos con regex `/-?\$[\d,]+\.\d{2}/g`
- Invalidación de caché (`revalidateTag`) después de importar para que las páginas muestren datos frescos

### Categorización
- Jaro-Winkler fuzzy matching (pure TypeScript, sin dependencias)
- Umbral 0.85 con fallback a "Otros"
- Reglas personalizadas por usuario en BD

### Dashboard (Overview)
- KPIs: gasto total, ingreso total, balance neto del mes
- Gráfico de barras mensual (Recharts)
- Gráfico de dona por categoría
- Últimas 5 transacciones

### Movimientos (Transactions)
- Tabla paginada con búsqueda y filtro por categoría/mes
- Edición de categoría por fila (inline)
- Edición masiva: checkboxes + toolbar flotante `fixed bottom-6`
- Bulk API (`PATCH /api/transactions/bulk`) con `inArray`

### Ajustes (Settings)
- Categorías personalizadas (crear/eliminar)
- Reglas automáticas de categorización por keyword

### UX / Performance
- Barra de progreso de navegación (top, 2px, color accent) — detecta clicks en `<a>` y completa al cambiar `usePathname`
- Skeletons `loading.tsx` por ruta — visibles inmediatamente al navegar
- `unstable_cache` en todas las queries de datos con `revalidateTag` por userId
  - `txs-{userId}`: transacciones, revalidation 60s, invalidado al importar
  - `cats-{userId}`: categorías, revalidation 300s
  - `rules-{userId}`: reglas, revalidation 300s
- Layout sin query a BD (email en JWT)

## Estructura de archivos relevante

```
app/
  (auth)/sign-in/        # Server Action: valida credenciales, crea sesión JWT
  (auth)/sign-up/        # Server Action: crea usuario, crea sesión JWT
  (dashboard)/
    layout.tsx           # Sidebar + NavigationProgress, lee email del JWT
    overview/            # KPIs + charts (datos en caché)
    transactions/        # Tabla + bulk edit
    averages/            # Promedios por categoría
    settings/            # Categorías y reglas
    import/              # Drag-and-drop, parseo client-side
  api/
    transactions/route.ts         # POST: importa transacciones, invalida caché
    transactions/bulk/route.ts    # PATCH: edición masiva de categorías
    transactions/[id]/route.ts    # PATCH: edición individual

lib/
  auth.ts              # encrypt/decrypt JWT, createSession(userId, email), verifySession
  db/index.ts          # Drizzle + Neon HTTP driver
  db/schema.ts         # Tablas: users, transactions, uploads, customCategories, categoryRules
  data.ts              # Queries cacheadas con unstable_cache
  categorize.ts        # Jaro-Winkler + reglas por defecto
  parsers/
    index.ts           # parseFile() dispatcher + normalizeDate/Amount/detectColumns
    csv.ts             # PapaParse
    excel.ts           # xlsx con NFD + cellDates
    pdf.ts             # pdfjs-dist, regex de montos en dólares

components/
  ui/NavigationProgress.tsx  # Barra de progreso top-level
  ui/SubmitButton.tsx        # Botón con useFormStatus spinner

middleware.ts          # Verifica JWT en cada request, excluye .mjs para pdf worker
```

## Setup

### Variables de entorno (`.env.local`)

```env
DATABASE_URL="postgresql://..."        # Neon connection string
JWT_SECRET="..."                       # openssl rand -base64 32  (mín 32 chars)
```

### Instalación

```bash
npm install
npx drizzle-kit push     # crea las tablas en Neon
npm run dev              # http://localhost:3000
```

## Notas para el LLM que retome esto

- **El archivo de parsers correcto es `lib/parsers/index.ts`** — existía un `lib/parsers.ts` antiguo que fue eliminado. Si hay problemas con imports de parsers, verificar que no haya regresado.
- **`pdfjs-dist` requiere el worker en `/public/pdf.worker.min.mjs`** — si se actualiza la versión de pdfjs, copiar el worker de `node_modules/pdfjs-dist/build/pdf.worker.min.mjs`.
- **Neon HTTP vs WebSocket:** usamos `drizzle-orm/neon-http` en `lib/db/index.ts`. No usar `@neondatabase/serverless` Pool.
- **JWT_SECRET** debe estar en `.env.local` (dev) y en las variables de entorno de producción. Sin él, la app lanza error al arrancar (`lib/auth.ts:6`).
- **Caché de Next.js:** las queries usan `unstable_cache` con tags `txs-{userId}`, `cats-{userId}`, `rules-{userId}`. Al modificar datos se llama `revalidateTag(tag)`. Si los datos no se actualizan tras importar, verificar que el API route llama `revalidateTag(\`txs-${userId}\`)`.
- **Banco General Excel:** el formato tiene columnas "Fecha", "Descripción", "Débito", "Crédito", "Saldo" con acentos. El parser normaliza con NFD. Si un nuevo banco falla, agregar keywords a las constantes en `lib/parsers/excel.ts`.
- **Banco General PDF:** formato `01-oct-2025 DESCRIPCION -$235.39 $3,077.59`. Si falla, revisar `TX_DATE_RE` y `DOLLAR_RE` en `lib/parsers/pdf.ts`.

## Deployment

Ver `DEPLOY.md`.
