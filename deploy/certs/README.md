# Сертификаты Timeweb для shastudio.ru

Положите сюда файлы от Timeweb:

- `certificate.crt` (или ваш `.crt`)
- `private.key` (или ваш `.key`)
- `ca-bundle.crt` / `*.ca-bundle` (промежуточная цепочка)

Затем на сервере (Linux):

```bash
chmod +x deploy/certs/combine-timeweb.sh
./deploy/certs/combine-timeweb.sh
docker compose up -d nginx
```

На Windows (локально) `chmod` не нужен — используйте PowerShell:

```powershell
cd deploy\certs
.\combine-timeweb.ps1
```

Скрипт создаст:

- `fullchain.pem` — сертификат + ca-bundle
- `privkey.pem` — приватный ключ

Эти файлы в `.gitignore` и не должны попадать в Git.
