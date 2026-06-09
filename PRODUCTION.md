# Produccion local y SaaS

## Instalacion local

1. Copia y ajusta variables si quieres cambiarlas:
   `cp .env.production.example .env.production`
2. Levanta la instalacion:
   `scripts/install-local.sh`
3. Abre:
   - Admin: `http://127.0.0.1:8080`
   - Player: `http://127.0.0.1:8080/player`

El instalador genera secretos locales cuando detecta valores de ejemplo. Para un cliente real, revisa `.env.production` antes de entregar.

## Backup

Ejecuta:

```sh
scripts/backup-local.sh
```

Esto crea una carpeta en `backups/` con:
- `postgres.sql`
- `uploads.tar.gz`

## Restore

Ejecuta:

```sh
scripts/restore-local.sh backups/FECHA/postgres.sql backups/FECHA/uploads.tar.gz
```

## Salud del sistema

La API expone `/health` con chequeos de API, base de datos, Redis y uploads. Docker usa ese endpoint para decidir si el servicio esta listo.

## SaaS

Antes de vender SaaS publico, completar:
- HTTPS obligatorio y dominio publico.
- Secretos por entorno, nunca en el repositorio.
- Postgres y Redis administrados.
- Storage administrado tipo S3, R2 o MinIO.
- Auditoria multi-tenant completa sobre pantallas, contenido, playlists, schedules, grupos, layouts y widgets.
- Backups automaticos y restore probado.
- Billing y limites por plan despues de estabilizar el core.
