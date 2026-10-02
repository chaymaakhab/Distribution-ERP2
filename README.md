# ERP-Distribution

Monorepo architecture with distinct frontend and backend directories:

- `FRONT-END/`: Complete React/Vite ERP frontend application workspace with Light Mode toggle and Role Switcher.
- `BACK-END/`: Standalone Laravel (PHP 8.3) RESTful API backend service with SQLite/MySQL migrations, Eloquent models, and `/api/v1/` endpoints.

## Running the Applications

### Back-End (Laravel API Server)
```bash
cd BACK-END
php artisan serve --port=8000
```
API endpoints available at `http://localhost:8000/api/v1/`.

### Front-End (Vite/React Workspace)
```bash
cd FRONT-END
pnpm install
PORT=3000 BASE_PATH=/ pnpm --filter @workspace/distribution-erp run dev
```
Accessible at `http://localhost:3000/`.
