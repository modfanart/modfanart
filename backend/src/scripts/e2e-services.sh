#!/bin/sh
# Starts (creating on first run) the local containers the e2e environment in e2e.env points at:
# Postgres on 5434, Redis on 6381 and MinIO (an S3 stand-in) on 9000 with a public-read bucket.
# Bound to 127.0.0.1 only. Safe to re-run.
set -e

start_or_run() {
  name="$1"
  shift
  if docker container inspect "$name" >/dev/null 2>&1; then
    docker start "$name" >/dev/null
  else
    docker run -d --name "$name" --restart unless-stopped "$@" >/dev/null
  fi
  echo "✓ $name"
}

start_or_run modfanart-postgres -p 127.0.0.1:5434:5432 \
  -e POSTGRES_USER=modfanart -e POSTGRES_PASSWORD=modfanart -e POSTGRES_DB=modfanart_dev \
  postgres:16-alpine

start_or_run modfanart-redis -p 127.0.0.1:6381:6379 redis:7-alpine

start_or_run modfanart-minio -p 127.0.0.1:9000:9000 \
  -e MINIO_ROOT_USER=modfanart -e MINIO_ROOT_PASSWORD=modfanart-secret \
  minio/minio server /data

# MinIO takes a moment to accept connections on first boot.
for _ in 1 2 3 4 5 6 7 8 9 10; do
  if docker exec modfanart-minio mc alias set local http://127.0.0.1:9000 modfanart modfanart-secret >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

docker exec modfanart-minio sh -c \
  'mc mb -p local/modfanart-local >/dev/null && mc anonymous set download local/modfanart-local >/dev/null'
echo "✓ bucket modfanart-local (public read)"

# Postgres also needs a moment before migrations can run against it.
for _ in 1 2 3 4 5 6 7 8 9 10; do
  docker exec modfanart-postgres pg_isready -U modfanart >/dev/null 2>&1 && break
  sleep 1
done
echo "✓ postgres ready"
