#!/bin/sh
# Собирает fullchain.pem из файлов Timeweb для Nginx.
# Использование (на сервере):
#   1. Положите сюда: certificate.crt, ca-bundle.crt (или .ca-bundle), private.key
#   2. sh combine-timeweb.sh
#   3. docker compose up -d nginx

set -e
cd "$(dirname "$0")"

CRT=$(ls ./*.crt 2>/dev/null | grep -v ca-bundle | grep -v fullchain | head -n 1 || true)
BUNDLE=$(ls ./*ca-bundle* ./*.ca-bundle 2>/dev/null | head -n 1 || true)
KEY=$(ls ./*.key 2>/dev/null | head -n 1 || true)

if [ -z "$CRT" ] || [ -z "$KEY" ]; then
  echo "Нужны файлы: *.crt (сертификат) и *.key (ключ)"
  echo "Опционально: *ca-bundle* (цепочка)"
  exit 1
fi

cp "$KEY" ./privkey.pem

if [ -n "$BUNDLE" ]; then
  cat "$CRT" "$BUNDLE" > ./fullchain.pem
  echo "fullchain.pem = $CRT + $BUNDLE"
else
  cp "$CRT" ./fullchain.pem
  echo "fullchain.pem = $CRT (без ca-bundle)"
fi

chmod 644 ./fullchain.pem
chmod 600 ./privkey.pem
echo "Готово: deploy/certs/fullchain.pem и deploy/certs/privkey.pem"
