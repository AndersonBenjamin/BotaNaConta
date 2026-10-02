# BotaNaConta

Aplicação web pessoal, simples e **mobile-first** para anotar gastos em poucos segundos pelo celular.

- **Frontend:** React + Vite (JavaScript, CSS puro)
- **Backend:** Node.js + Express + Prisma
- **Banco:** PostgreSQL 16
- **Infra:** Docker Compose + Nginx + HTTPS com Let's Encrypt

A especificação completa (telas, API, regras e decisões) está em [docs/ESPECIFICACAO.md](docs/ESPECIFICACAO.md).

---

## Sumário

- [Arquitetura](#arquitetura)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Desenvolvimento local](#desenvolvimento-local)
- [Rodar a stack completa com Docker](#rodar-a-stack-completa-com-docker)
- [Deploy na VPS](#deploy-na-vps)
- [Comandos do dia a dia](#comandos-do-dia-a-dia)
- [Migrations do Prisma](#migrations-do-prisma)
- [Backup e restauração](#backup-e-restauração)
- [Solução de problemas](#solução-de-problemas)

---

## Arquitetura

```text
Internet
   │  HTTPS (443)
   ▼
Nginx da VPS ── certificado Let's Encrypt (certbot)
   │  http://127.0.0.1:8080
   ▼
┌──────────────── Docker Compose ────────────────┐
│ frontend  Nginx: arquivos do React             │
│           /api/* ──► backend                   │
│           limite de tentativas de login        │
│                                                │
│ backend   Express (porta 3000, só rede interna)│
│           aplica as migrations ao iniciar      │
│                                                │
│ postgres  PostgreSQL 16 (volume postgres_data) │
└────────────────────────────────────────────────┘
```

- Só o Nginx da VPS fica exposto à internet. O app (`8080`) e o banco (`5432`) escutam apenas em `127.0.0.1`.
- Frontend e API ficam no mesmo domínio, então o CORS não é usado em produção.

## Estrutura do projeto

```text
BotaNaConta/
├── backend/            API Express + Prisma
│   ├── prisma/         schema, migrations e seed
│   ├── src/            routes, controllers, services, middleware, utils
│   └── Dockerfile
├── frontend/           App React
│   ├── src/            pages, components, services, context, hooks
│   ├── nginx.conf      Nginx do container (SPA + proxy da API)
│   └── Dockerfile
├── deploy/
│   └── nginx-vps.conf  Exemplo de configuração do Nginx da VPS
├── docs/
│   └── ESPECIFICACAO.md
├── docker-compose.yml
└── .env.example
```

## Variáveis de ambiente

Existem dois arquivos `.env`, e **nenhum deles vai para o Git**:

| Arquivo        | Usado por                                   | Modelo                                         |
| -------------- | ------------------------------------------- | ---------------------------------------------- |
| `.env`         | `docker-compose.yml` (stack completa)       | [.env.example](.env.example)                   |
| `backend/.env` | backend rodando fora do Docker (`npm run dev`) | [backend/.env.example](backend/.env.example) |

Principais variáveis do `.env` da raiz:

| Variável             | Descrição                                                              |
| -------------------- | ---------------------------------------------------------------------- |
| `POSTGRES_USER`      | Usuário do banco                                                       |
| `POSTGRES_PASSWORD`  | Senha do banco. **Só letras e números** (entra na URL de conexão)      |
| `POSTGRES_DB`        | Nome do banco                                                          |
| `POSTGRES_PORT`      | Porta do banco em `127.0.0.1` (padrão `5432`)                          |
| `JWT_SECRET`         | Chave de assinatura dos tokens, **mínimo 32 caracteres**               |
| `JWT_EXPIRES_IN`     | Validade do login (padrão `7d`)                                        |
| `APP_TIMEZONE`       | Fuso para "hoje" e "este mês" (padrão `America/Sao_Paulo`)             |
| `APP_PORT`           | Porta do app em `127.0.0.1` (padrão `8080`)                            |
| `SEED_USER_*`        | Nome, e-mail e senha do usuário criado pelo seed                       |

Para gerar valores seguros:

```bash
openssl rand -hex 24   # POSTGRES_PASSWORD
openssl rand -hex 48   # JWT_SECRET
```

---

## Desenvolvimento local

Pré-requisitos: **Node.js 22.12+** e **Docker** com Docker Compose.

```bash
# 1. Variáveis de ambiente
cp .env.example .env                  # preencha as senhas e o JWT_SECRET
cp backend/.env.example backend/.env  # use a MESMA senha do banco do .env da raiz

# 2. Banco de dados (só o Postgres no Docker)
docker compose up -d postgres

# 3. Backend
cd backend
npm install
npx prisma migrate dev   # cria as tabelas
npm run db:seed          # categorias + usuário inicial
npm run dev              # API em http://localhost:3000 (reinicia ao salvar)

# 4. Frontend (em outro terminal)
cd frontend
npm install
npm run dev              # App em http://localhost:5173
```

- O Vite repassa `/api` para `http://localhost:3000`, imitando o Nginx de produção.
- Para testar no celular, na mesma rede Wi-Fi, abra `http://IP-DO-COMPUTADOR:5173`.
- Para ver e editar os dados num painel: `cd backend && npm run db:studio` (abre em `http://localhost:5555`).

## Rodar a stack completa com Docker

Para testar localmente exatamente o que vai para produção:

```bash
cp .env.example .env     # se ainda não existir
docker compose up -d --build
docker compose exec backend npm run db:seed   # só na primeira vez
```

O app fica em **http://localhost:8080**.

---

## Deploy na VPS

Exemplo para Ubuntu/Debian. Troque `gastos.seudominio.com` pelo seu domínio.

### 1. Pré-requisitos

- Um registro DNS do tipo **A** apontando `gastos.seudominio.com` para o IP da VPS.
- Docker e Docker Compose instalados ([guia oficial](https://docs.docker.com/engine/install/)).
- Nginx e Certbot:

```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx
```

- Firewall liberando só SSH, HTTP e HTTPS:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 2. Código e configuração

```bash
git clone <url-do-repositorio> BotaNaConta
cd BotaNaConta

cp .env.example .env
nano .env   # senhas fortes, JWT_SECRET e os dados do seu usuário em SEED_USER_*
chmod 600 .env
```

### 3. Subir a aplicação

```bash
docker compose up -d --build
docker compose ps                              # os 3 serviços devem ficar "healthy"
docker compose exec backend npm run db:seed    # cria categorias e seu usuário
```

As migrations são aplicadas automaticamente quando o backend inicia.

Depois do seed, **apague a linha `SEED_USER_PASSWORD` do `.env`**: a senha já está salva no banco (com hash) e não precisa ficar no servidor.

Teste localmente na VPS:

```bash
curl http://127.0.0.1:8080/api/health   # {"status":"ok"}
```

### 4. Nginx da VPS e HTTPS

```bash
sudo cp deploy/nginx-vps.conf /etc/nginx/sites-available/botanaconta
sudo nano /etc/nginx/sites-available/botanaconta   # troque o server_name pelo seu domínio
sudo ln -s /etc/nginx/sites-available/botanaconta /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Certificado HTTPS (o Certbot também configura o redirecionamento HTTP → HTTPS)
sudo certbot --nginx -d gastos.seudominio.com
```

A renovação do certificado é automática (timer do Certbot). Para conferir: `sudo certbot renew --dry-run`.

Pronto: acesse `https://gastos.seudominio.com` pelo celular. Dica: use "Adicionar à tela de início" no navegador para abrir como um app.

### 5. Atualizar para uma nova versão

```bash
cd BotaNaConta
git pull
docker compose up -d --build   # recria só o que mudou e aplica migrations novas
docker image prune -f          # remove imagens antigas
```

---

## Comandos do dia a dia

```bash
docker compose build            # gera as imagens
docker compose up -d            # sobe os serviços em segundo plano
docker compose up -d --build    # gera as imagens e sobe (use após atualizar o código)
docker compose down             # derruba os serviços (os dados continuam no volume)
docker compose ps               # status e saúde dos serviços
docker compose logs             # logs de todos os serviços
docker compose logs -f backend  # acompanha os logs da API
docker compose restart backend  # reinicia só a API
```

> ⚠️ **Nunca** rode `docker compose down -v` em produção: o `-v` apaga o volume do banco com todos os gastos.

## Migrations do Prisma

| Situação                                     | Comando                                                   |
| -------------------------------------------- | --------------------------------------------------------- |
| Criar migration após alterar o `schema.prisma` (dev) | `cd backend && npx prisma migrate dev --name descricao` |
| Aplicar migrations no Docker / produção      | Automático ao iniciar o backend                           |
| Aplicar manualmente no Docker                | `docker compose exec backend npx prisma migrate deploy`   |
| Ver o status das migrations                  | `docker compose exec backend npx prisma migrate status`   |
| Rodar o seed no Docker                       | `docker compose exec backend npm run db:seed`             |

O seed pode ser executado mais de uma vez: ele não duplica categorias e não altera um usuário que já existe.

## Backup e restauração

Os gastos ficam só no banco da VPS, então faça backups regulares.

```bash
# Backup (gera um arquivo .sql.gz com data)
docker compose exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' | gzip > backup-$(date +%F).sql.gz

# Restauração (num banco vazio)
gunzip -c backup-2026-10-02.sql.gz | docker compose exec -T postgres sh -c 'psql -U "$POSTGRES_USER" "$POSTGRES_DB"'
```

Para backup diário automático às 3h, adicione ao `crontab -e` da VPS (ajuste o caminho):

```cron
0 3 * * * cd /home/usuario/BotaNaConta && docker compose exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' | gzip > backups/backup-$(date +\%F).sql.gz && find backups -name '*.sql.gz' -mtime +30 -delete
```

(Crie a pasta antes com `mkdir backups`. O comando mantém os últimos 30 dias.) Guarde cópias também fora da VPS.

---

## Solução de problemas

| Sintoma                                          | O que verificar                                                                  |
| ------------------------------------------------ | -------------------------------------------------------------------------------- |
| `docker compose up` diz que falta uma variável   | O `.env` da raiz existe e tem `POSTGRES_*` e `JWT_SECRET` preenchidos.           |
| Backend reiniciando sem parar                    | `docker compose logs backend`. Causas comuns: `JWT_SECRET` com menos de 32 caracteres ou senha do banco com símbolos. |
| Senha do banco mudou no `.env` e o backend não conecta | O Postgres só usa `POSTGRES_PASSWORD` na **primeira** criação do volume. Mantenha a senha original ou altere-a dentro do banco (`ALTER USER`). |
| Porta 5432 ou 8080 já em uso                     | Altere `POSTGRES_PORT` ou `APP_PORT` no `.env` (e o `proxy_pass` do Nginx da VPS). |
| "Muitas tentativas" no login                     | Proteção contra força bruta: aguarde 1 minuto.                                  |
| Esqueci a senha                                  | Defina `SEED_USER_*` com outro e-mail e rode o seed, ou apague o usuário pelo `npm run db:studio` (os gastos dele também são apagados) e rode o seed de novo. |
| 502 Bad Gateway no domínio                       | `docker compose ps`: o frontend está "healthy" e ouvindo em `127.0.0.1:8080`?   |
