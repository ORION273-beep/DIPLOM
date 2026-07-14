# OneSec frontend (React + Vite)

SPA магазина OneSec. Dev-proxy: `/api` → `http://localhost:4000`.

## Запуск

```bash
npm install
npm run dev
```

Откроется [http://localhost:5173](http://localhost:5173).

Из корня монорепо вместе с backend:

```bash
npm run dev
```

## Сборка

```bash
npm run build
npm run preview
```

Production-статика отдаётся через nginx (`Dockerfile.frontend`).
