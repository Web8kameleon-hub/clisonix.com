# 🔒 SECURITY TODO - Sensitive Data Cleanup

## Problema Aktuale
IP-ja e serverit (46.224.205.183) është hardcoded në shumë file TSX.
Kjo duhet të ndryshohet për të përdorur environment variables.

## File-t që duhen ndryshuar:

### 1. apps/web/app/modules/page.tsx (Lines 47-58)
- Hardcoded: `http://46.224.205.183:8000`, `:8002`, `:8003`, `:8004`
- Duhet: `process.env.NEXT_PUBLIC_API_URL`, etc.

### 2. apps/web/app/modules/excel-dashboard/page.tsx (Line 255)
- Hardcoded: `http://46.224.205.183:3001`
- Duhet: `process.env.NEXT_PUBLIC_GRAFANA_URL`

### 3. apps/web/app/marketplace/page.tsx (Lines 204, 395)
- Hardcoded: `http://46.224.205.183:8000`
- Duhet: `process.env.NEXT_PUBLIC_API_URL`

### 4. apps/web/app/page.tsx (Lines 272, 277)
- Hardcoded: `http://46.224.205.183:3001`, `:9090`
- Duhet: `process.env.NEXT_PUBLIC_GRAFANA_URL`, `NEXT_PUBLIC_PROMETHEUS_URL`

## Environment Variables të nevojshme (.env.local):
```
NEXT_PUBLIC_API_URL=http://46.224.205.183:8000
NEXT_PUBLIC_EXCEL_API_URL=http://46.224.205.183:8002
NEXT_PUBLIC_CORE_API_URL=http://46.224.205.183:8003
NEXT_PUBLIC_MARKETPLACE_API_URL=http://46.224.205.183:8004
NEXT_PUBLIC_GRAFANA_URL=http://46.224.205.183:3001
NEXT_PUBLIC_PROMETHEUS_URL=http://46.224.205.183:9090
```

## Server .env (/root/.env) - Passwords të dobëta:
```
POSTGRES_PASSWORD=postgres  ← Duhet password i fortë!
MINIO_ROOT_PASSWORD=minio123  ← Duhet password i fortë!
```

## Rekomandime:
1. Gjenero passwords të forta (min 16 karaktere, mixed case, numra, simbole)
2. Përdor `openssl rand -base64 32` për të gjeneruar
3. Shto në .gitignore: `.env`, `.env.local`, `.env.production`
4. Për production, përdor domain (api.clisonix.com) jo IP

## Prioritet: HIGH 🔴
Duhet të rregullohet para se të dalë në production publik.
