# UJJWAL ELECTRICAL AND MECHANICAL ENGINEERS ENTERPRISE

Premium industrial website + product discovery + quotation platform.

## Stack

- React + TypeScript + Vite
- Three.js + React Three Fiber
- Node.js + Fastify + TypeScript
- PostgreSQL-ready API with a development demo fallback
- Zod request validation

## Run locally

```bash
npm install
npm run dev
```

Open the Vite URL (normally http://localhost:5173). The API runs on http://localhost:4000.

Optional PostgreSQL setup:
1. Copy `apps/api/.env.example` to `apps/api/.env`.
2. Set `DATABASE_URL`.
3. Use the SQL schema in `apps/api/sql/schema.sql` when wiring production persistence.

Without a database URL the API uses the sample catalogue in `apps/api/src/store.ts`, so the interface can be developed without infrastructure first.

## Build

```bash
npm run typecheck
npm run build
```

## Production notes

The catalogue currently contains clearly marked sample records. Replace them with the company's verified catalogue before public launch.

The frontend includes the premium industrial visual system, purposeful procedural 3D hero, product catalogue, technical finders, comparison-ready product detail patterns, enquiry cart and contact workflow.

The backend includes validated product search, bearing/CNC matching endpoints, enquiry creation, upload intake, rate limiting, secure headers and an admin-key-protected catalogue endpoint. Production deployment should add managed PostgreSQL, private object storage and real authentication/role management.
