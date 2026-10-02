# Hercules ERP — source package

French-first frontend prototype for a Moroccan distribution ERP.

## Quick start

Requirements: Node.js 20+ and pnpm.

```sh
pnpm install
PORT=3000 BASE_PATH=/ pnpm --filter @workspace/distribution-erp run dev
```

Then open http://localhost:3000.

## Scope

The Hercules ERP screens are a frontend demo with illustrative local data. They are not connected to an API or database, and actions do not persist to a server. The workspace source and shared packages are included. The supplied requirements PDF and dashboard screenshot are in `docs/reference/`.
