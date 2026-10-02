# BotaNaConta — Especificação do Projeto

> Aplicação web pessoal, simples e **mobile-first** para registrar e consultar gastos.

| Item              | Valor                                              |
| ----------------- | -------------------------------------------------- |
| Status            | Especificação do MVP                               |
| Público           | Uso pessoal (um usuário)                           |
| Plataforma alvo   | Navegador de celular (360px – 430px de largura)    |
| Hospedagem        | VPS Linux própria, com Docker                      |
| Última atualização| 02/10/2026                                         |

---

## Sumário

1. [Objetivo](#1-objetivo)
2. [Escopo do MVP](#2-escopo-do-mvp)
3. [Stack](#3-stack)
4. [Arquitetura](#4-arquitetura)
5. [Estrutura de pastas](#5-estrutura-de-pastas)
6. [Modelo de dados](#6-modelo-de-dados)
7. [Autenticação](#7-autenticação)
8. [Telas e fluxos](#8-telas-e-fluxos)
9. [API REST](#9-api-rest)
10. [Segurança](#10-segurança)
11. [Interface mobile](#11-interface-mobile)
12. [Infraestrutura (Docker, Nginx e deploy)](#12-infraestrutura-docker-nginx-e-deploy)
13. [Variáveis de ambiente](#13-variáveis-de-ambiente)
14. [Entregáveis](#14-entregáveis)
15. [Orientações para quem for desenvolver](#15-orientações-para-quem-for-desenvolver)

---

## 1. Objetivo

Criar uma aplicação web simples, responsiva e otimizada para celular que permita registrar e consultar gastos pessoais.

O foco principal é **registrar um gasto rapidamente pelo celular**. A aplicação não deve parecer um sistema financeiro corporativo, e sim uma ferramenta pessoal simples.

### Experiência desejada

O usuário deve conseguir:

1. Abrir o site.
2. Fazer login (só na primeira vez ou quando o token expirar).
3. Tocar em **+**.
4. Digitar `35,90`.
5. Selecionar **Alimentação**.
6. Tocar em **Salvar**.

E terminar o lançamento em poucos segundos.

---

## 2. Escopo do MVP

### ✅ Incluído

- Login
- Dashboard
- Cadastro de gasto
- Lista de gastos
- Edição de gasto
- Exclusão de gasto
- Categorias (pré-cadastradas via seed)
- Filtro por período
- Filtro por categoria
- Total mensal
- Total diário
- Resumo por categoria
- PostgreSQL + Prisma
- Docker
- Responsividade mobile

### ❌ Fora do escopo (por enquanto)

- Cadastro público de usuários
- Tela de gerenciamento de categorias
- Integração bancária
- Cartões
- Contas a pagar
- Investimentos
- Múltiplos usuários / compartilhamento familiar
- Notificações
- Inteligência artificial
- Gráficos complexos
- Aplicativo nativo

> **Prioridade:** uma aplicação pequena, rápida e confiável.

---

## 3. Stack

| Camada         | Tecnologia                                                        |
| -------------- | ----------------------------------------------------------------- |
| Frontend       | React, Vite, JavaScript, React Router, Axios                      |
| Estilo         | CSS puro com variáveis *(estética ainda a definir)*               |
| Backend        | Node.js 22+, Express (JavaScript, ES Modules)                     |
| ORM            | Prisma 6 (o 7 gera cliente em TypeScript)                         |
| Autenticação   | JWT + bcrypt                                                      |
| Banco de dados | PostgreSQL 16                                                     |
| Infraestrutura | Docker, Docker Compose, Nginx, HTTPS com Let's Encrypt            |

---

## 4. Arquitetura

A aplicação é dividida em serviços independentes, orquestrados pelo Docker Compose. Frontend e backend são **desacoplados** e se comunicam somente pela API REST.

```text
                 INTERNET
                    |
                    v
             NGINX (HTTPS)
                    |
          +---------+---------+
          |                   |
          v                   v
      FRONTEND               API
   React (estático)        Express
                              |
                              v
                         PostgreSQL
```

- Requisições para `/api/*` → backend (Express).
- Demais requisições → frontend (build estático do React).

---

## 5. Estrutura de pastas

```text
BotaNaConta/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/      # cliente Axios, chamadas à API
│   │   ├── hooks/
│   │   ├── context/       # ex.: AuthContext
│   │   ├── routes/        # rotas públicas e protegidas
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/    # auth, validação, tratamento de erros
│   │   ├── services/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
│
├── docs/
│   └── ESPECIFICACAO.md
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

> O Prisma fica dentro de `backend/`, pois só o backend acessa o banco.

---

## 6. Modelo de dados

### Diagrama

```text
User 1 ──── N Expense N ──── 1 Category
```

### `users`

| Campo          | Tipo       | Regras                                  |
| -------------- | ---------- | --------------------------------------- |
| `id`           | Int (PK)   | Autoincremento                          |
| `name`         | String     | Obrigatório                             |
| `email`        | String     | Obrigatório, **único**                  |
| `passwordHash` | String     | Somente o hash bcrypt                   |
| `createdAt`    | DateTime   | Automático                              |
| `updatedAt`    | DateTime   | Automático                              |

- Nunca retornar `passwordHash` nas respostas da API.

### `categories`

| Campo       | Tipo     | Regras                 |
| ----------- | -------- | ---------------------- |
| `id`        | Int (PK) | Autoincremento         |
| `name`      | String   | Obrigatório, único     |
| `icon`      | String?  | Emoji da categoria     |
| `createdAt` | DateTime | Automático             |

Categorias iniciais (criadas via seed):

| Emoji | Categoria    |
| ----- | ------------ |
| 🍔    | Alimentação  |
| 🛒    | Mercado      |
| 🚗    | Transporte   |
| 🏠    | Casa         |
| 💊    | Saúde        |
| 🎮    | Lazer        |
| 🛍️    | Compras      |
| 💳    | Assinaturas  |
| 🧾    | Contas       |
| 📦    | Outros       |

> Os emojis ficam no campo `icon` da tabela, preenchido pelo seed.

### `expenses`

| Campo         | Tipo            | Regras                                          |
| ------------- | --------------- | ----------------------------------------------- |
| `id`          | Int (PK)        | Autoincremento                                  |
| `userId`      | Int (FK)        | Referência a `users.id`                         |
| `categoryId`  | Int (FK)        | Referência a `categories.id`                    |
| `amount`      | Decimal(10, 2)  | Obrigatório, maior que zero. **Nunca `float`**  |
| `description` | String?         | Opcional                                        |
| `date`        | Date            | Data do gasto (padrão: hoje)                    |
| `createdAt`   | DateTime        | Automático                                      |
| `updatedAt`   | DateTime        | Automático                                      |

- Criar índice em `(userId, date)` para acelerar listagens e totais.

### Prisma

O `schema.prisma` deve definir os modelos `User`, `Category` e `Expense` com seus relacionamentos. O `seed.js` deve criar:

- as categorias iniciais;
- o primeiro usuário (nome, e-mail e senha lidos de variáveis de ambiente).

---

## 7. Autenticação

### Login

- Campos: **e-mail** e **senha**.
- Após o login, a API retorna um **JWT** com expiração.
- O frontend envia o token no cabeçalho `Authorization: Bearer <token>` em todas as requisições protegidas.
- Se a API responder `401`, o frontend descarta o token e redireciona para o login.

### Cadastro de usuário

Não haverá cadastro público no MVP. O primeiro usuário será criado por:

- **script de seed do Prisma** *(recomendado)*; ou
- endpoint administrativo protegido.

### Regras

- Senhas armazenadas somente como hash `bcrypt`.
- Todas as rotas de gastos e dashboard exigem autenticação.

---

## 8. Telas e fluxos

### Fluxo principal

```text
Abrir site → Login → Dashboard → + Novo gasto → Valor → Categoria
→ (Descrição opcional) → Salvar → Gasto registrado
```

Esse fluxo deve ser **extremamente rápido** e exigir poucos toques.

### Rotas do frontend

| Rota           | Tela                                  |
| -------------- | ------------------------------------- |
| `/login`       | Login (única rota pública)            |
| `/`            | Dashboard                             |
| `/novo`        | Novo gasto                            |
| `/gastos`      | Lista com filtros (`?periodo=&categoria=`) |
| `/gastos/:id`  | Editar / excluir gasto                |
| `/resumo`      | Resumo mensal por categoria           |

- Sem sessão, qualquer rota leva ao `/login`; após entrar, o usuário volta para a rota que tentou abrir.
- O token fica no `localStorage` (`botanaconta.token`). Se a API responder `401` (token expirado), o app descarta o token e volta ao login.

### 8.1 Login

- E-mail e senha.
- Botão **Entrar**.
- Mensagem clara em caso de credenciais inválidas.

### 8.2 Dashboard

Tela exibida após o login.

```text
Olá, Anderson

OUTUBRO

Hoje               Este mês
R$ 87,50           R$ 2.845,90

──────────────────────────────
Gastos recentes

🍔 Almoço                R$ 35,90
🛒 Mercado              R$ 120,50
🚗 Combustível           R$ 80,00

      [ + Novo gasto ]
```

### 8.3 Novo gasto *(tela principal)*

| Campo       | Comportamento                                                                 |
| ----------- | ----------------------------------------------------------------------------- |
| Valor       | Formato `R$ 35,90`, com **dígitos entrando pela direita** (digitar `3590` mostra `35,90`), então só precisa do **teclado numérico** (`inputmode="numeric"`). Foco automático ao abrir a tela e de novo se o salvamento falhar por falta de valor. |
| Categoria   | Grade de botões com emoji.                                                     |
| Descrição   | Opcional. Ex.: `Almoço`.                                                       |
| Data        | Preenchida com a data atual; pode ser alterada.                                |
| Botão       | **Adicionar gasto**                                                            |

Após salvar:

1. Mostrar confirmação (toast "Gasto registrado").
2. Voltar para o dashboard (o formulário é descartado).

A mesma tela/formulário é reaproveitada para **editar** um gasto, com opção de **excluir** (pedindo confirmação). Ao salvar ou excluir, volta para a tela anterior, mantendo os filtros da lista.

### 8.4 Lista de gastos

- Mostra descrição, categoria, valor e data.
- Ordenada do **mais recente para o mais antigo**.
- Agrupada por dia, com os títulos "Hoje", "Ontem" ou a data (`02 OUT`; o ano aparece quando não é o atual).
- Mostra a quantidade e a soma dos gastos filtrados.
- Tocar em um item abre a edição.

```text
02 OUT
  🍔 Almoço              R$ 35,90
  🛒 Mercado            R$ 120,50

01 OUT
  🚗 Combustível         R$ 80,00
```

### 8.5 Filtros

- **Período:** Hoje · Esta semana · Este mês *(padrão)* · Mês anterior
- **Categoria:** seleção de uma categoria (ou todas)
- A semana vai de segunda a domingo. Os períodos são calculados no fuso America/Sao_Paulo, o mesmo da API.
- Os filtros ficam na URL, para continuarem aplicados ao voltar da edição.

### 8.6 Resumo mensal

Total gasto por categoria no mês atual, do maior para o menor, com uma barra simples indicando a proporção de cada categoria. Tocar numa categoria abre a lista do mês filtrada por ela.

```text
Gastos de Outubro

Alimentação       R$ 650,00
Mercado           R$ 820,00
Transporte        R$ 350,00
Casa              R$ 420,00
Lazer             R$ 250,00
Outros            R$ 355,90
---------------------------
Total           R$ 2.845,90
```

---

## 9. API REST

- Base: `/api`
- Formato: JSON
- Rotas marcadas com 🔒 exigem `Authorization: Bearer <token>`.
- Valores monetários: enviados como número (`35.90`) ou texto com ponto (`"35.90"`); a API converte para `Decimal` e **sempre devolve como texto com 2 casas** (`"35.90"`) para não perder precisão. O frontend formata para `R$ 35,90`.
- Datas: formato `YYYY-MM-DD`.

### Resumo dos endpoints

| Método | Rota                   | Auth | Descrição                          |
| ------ | ---------------------- | ---- | ---------------------------------- |
| GET    | `/api/health`          |      | Verificação de saúde (Docker)      |
| POST   | `/api/auth/login`      |      | Autentica e retorna o JWT          |
| GET    | `/api/me`              | 🔒   | Dados do usuário autenticado       |
| GET    | `/api/categories`      | 🔒   | Lista as categorias                |
| GET    | `/api/expenses`        | 🔒   | Lista gastos (com filtros)         |
| GET    | `/api/expenses/:id`    | 🔒   | Busca um gasto                     |
| POST   | `/api/expenses`        | 🔒   | Cria um gasto                      |
| PUT    | `/api/expenses/:id`    | 🔒   | Atualiza um gasto                  |
| DELETE | `/api/expenses/:id`    | 🔒   | Exclui um gasto                    |
| GET    | `/api/dashboard`       | 🔒   | Totais e gastos recentes           |

> `GET /api/categories` foi incluído porque o frontend precisa da lista para montar os botões de categoria. Retorna `[{ "id": 1, "name": "Alimentação", "icon": "🍔" }, ...]`.

### `POST /api/auth/login`

Request:

```json
{
  "email": "usuario@email.com",
  "password": "senha"
}
```

Response `200`:

```json
{
  "token": "JWT_TOKEN",
  "user": {
    "id": 1,
    "name": "Anderson",
    "email": "usuario@email.com"
  }
}
```

Response `401`: credenciais inválidas (mensagem genérica, sem indicar se o erro foi no e-mail ou na senha). O e-mail é comparado sem diferenciar maiúsculas e ignorando espaços nas pontas.

### `GET /api/me` 🔒

Retorna `id`, `name` e `email` do usuário autenticado.

### `GET /api/expenses` 🔒

Filtros opcionais via query string:

| Parâmetro    | Exemplo      | Descrição              |
| ------------ | ------------ | ---------------------- |
| `startDate`  | `2026-10-01` | Data inicial (inclusa) |
| `endDate`    | `2026-10-31` | Data final (inclusa)   |
| `categoryId` | `1`          | Filtra por categoria   |

Exemplo: `GET /api/expenses?startDate=2026-10-01&endDate=2026-10-31&categoryId=1`

Retorna somente os gastos do usuário autenticado, ordenados por `date` desc e `createdAt` desc, incluindo os dados da categoria.

### `POST /api/expenses` 🔒

```json
{
  "amount": 35.90,
  "categoryId": 1,
  "description": "Almoço",
  "date": "2026-10-02"
}
```

Validações:

- `amount`: obrigatório, > 0, no máximo 2 casas decimais, até `99999999.99`.
- `categoryId`: obrigatório, deve existir.
- `description`: opcional, até 255 caracteres; espaços nas pontas são removidos e texto vazio vira `null`.
- `date`: opcional (padrão: hoje no fuso da aplicação), data existente no formato `YYYY-MM-DD`.

Response `201`:

```json
{
  "id": 1,
  "amount": "35.90",
  "description": "Almoço",
  "date": "2026-10-02",
  "category": { "id": 1, "name": "Alimentação", "icon": "🍔" },
  "createdAt": "2026-10-02T16:30:08.278Z",
  "updatedAt": "2026-10-02T16:30:08.278Z"
}
```

Todas as rotas de gastos devolvem os gastos neste formato.

### `GET /api/expenses/:id` · `PUT /api/expenses/:id` · `DELETE /api/expenses/:id` 🔒

- `PUT` aceita o mesmo corpo do `POST`, mas com `date` **obrigatória** (é uma substituição completa).
- `DELETE` responde `204`.
- Se o gasto não existir **ou pertencer a outro usuário**, responder `404`.
- ID que não seja número inteiro positivo responde `400`.

### `GET /api/dashboard` 🔒

Retorna os números do período atual:

```json
{
  "today": "2026-10-02",
  "month": "2026-10",
  "totalToday": "87.50",
  "totalMonth": "2845.90",
  "recentExpenses": [],
  "byCategory": [
    { "categoryId": 1, "name": "Alimentação", "icon": "🍔", "total": "650.00" }
  ]
}
```

- `today` e `month` informam a data de referência usada pela API nos totais; o frontend usa `month` para exibir o nome do mês.
- `recentExpenses`: os 10 gastos mais recentes.
- `byCategory`: total do mês por categoria, do maior para o menor; categorias sem gastos no mês não aparecem.

> "Hoje" e "este mês" devem ser calculados no fuso **America/Sao_Paulo**, para evitar que gastos feitos à noite caiam no dia seguinte.

### Padrão de erros

```json
{
  "error": "Dados inválidos.",
  "details": [
    { "field": "amount", "message": "Informe um valor maior que zero, com até 2 casas decimais." }
  ]
}
```

`details` só aparece em erros de validação, com um item por campo inválido, para o frontend mostrar a mensagem ao lado de cada campo.

| Código | Uso                                       |
| ------ | ----------------------------------------- |
| 400    | Dados inválidos ou JSON malformado        |
| 401    | Não autenticado / token inválido/expirado |
| 404    | Recurso ou rota não encontrados           |
| 413    | Corpo da requisição maior que 10 KB       |
| 500    | Erro interno (sem expor stack trace)      |

---

## 10. Segurança

- [x] Senhas com `bcrypt`.
- [x] JWT com expiração.
- [x] Rotas protegidas por middleware de autenticação.
- [x] Toda consulta de gasto filtrada pelo `userId` do token (um usuário nunca acessa gasto de outro).
- [x] Validação dos dados recebidos pela API.
- [x] CORS desativado em produção (frontend e API na mesma origem); em desenvolvimento, liberado só para as origens de `CORS_ORIGIN`.
- [x] Variáveis sensíveis somente via `.env`.
- [x] Nunca registrar senhas ou tokens em logs.
- [x] Nunca retornar informações sensíveis (ex.: `passwordHash`, stack traces).
- [x] HTTPS em produção (Nginx da VPS + Certbot; ver README).
- [x] Banco de dados e app **sem porta exposta** para a internet (portas publicadas somente em `127.0.0.1`).
- [x] Limite de tentativas de login por IP no Nginx do container: 5 por minuto, com folga de 5 seguidas; acima disso responde `429`.
- [x] Cabeçalhos de segurança (CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`) e corpo de requisição limitado a 16 KB no Nginx.
- [x] Containers da API rodando com usuário sem privilégios (`node`).

---

## 11. Interface mobile

Prioridade para celular, com largura de referência entre **360px e 430px**. A estética definitiva (cores, fontes) ainda será escolhida; por enquanto há um visual neutro com todas as cores, raios e espaçamentos em variáveis CSS no início de `frontend/src/styles/global.css`, incluindo um **modo escuro** que segue a configuração do celular. Em telas maiores, o conteúdo fica centralizado com até 480px.

A interface deve:

- ter botões grandes e campos fáceis de tocar (alvo mínimo de ~44px);
- usar teclado numérico para valores;
- usar cards e listas — **sem tabelas horizontais**;
- ter navegação simples;
- evitar telas carregadas;
- funcionar bem em telas pequenas e se adaptar a telas maiores.

### Navegação inferior

```text
┌─────────────────────────────┐
│                             │
│          CONTEÚDO           │
│                             │
├─────────────────────────────┤
│  🏠       ＋       📊       │
│ Início   Gasto   Resumo     │
└─────────────────────────────┘
```

- **Início:** dashboard (com acesso à lista completa de gastos).
- **Gasto (+):** novo gasto — botão central em destaque.
- **Resumo:** resumo mensal por categoria.

---

## 12. Infraestrutura (Docker, Nginx e deploy)

> O passo a passo completo de instalação, deploy, comandos, migrations e backup está no [README](../README.md).

### Arquitetura de produção

```text
Internet ──HTTPS──► Nginx da VPS (Certbot) ──► 127.0.0.1:8080
                                                   │
                         ┌──────── Docker Compose ─┴──────────────┐
                         │ frontend  Nginx: build do React        │
                         │           /api/* ──► backend:3000      │
                         │ backend   Express + Prisma             │
                         │ postgres  PostgreSQL 16 (volume)       │
                         └────────────────────────────────────────┘
```

- **Nginx da VPS** (instalado no servidor, fora do Docker): termina o HTTPS com Let's Encrypt (`certbot --nginx`) e encaminha tudo para `127.0.0.1:8080`. Exemplo em `deploy/nginx-vps.conf`. Fica fora do Docker para simplificar a emissão e renovação do certificado e permitir outros sites na mesma VPS.
- **Container `frontend`** (Nginx): serve o build do React, devolve `index.html` para as rotas do app, repassa `/api/*` ao backend, limita tentativas de login e adiciona cabeçalhos de segurança. Configuração em `frontend/nginx.conf`.
- **Container `backend`**: sem porta publicada (só a rede interna do Docker). Ao iniciar, aplica as migrations pendentes (`prisma migrate deploy`) e sobe a API.
- **Container `postgres`**: dados no volume `postgres_data`; porta publicada só em `127.0.0.1`, para backups e acesso local.

### Docker Compose

- Serviços: `postgres`, `backend` e `frontend`, todos com `restart: unless-stopped` e healthcheck.
- Ordem de subida: `postgres` saudável → `backend` saudável → `frontend`.
- As variáveis vêm do `.env` da raiz; o Compose recusa subir se faltar `POSTGRES_*` ou `JWT_SECRET`.
- A `DATABASE_URL` do backend é montada pelo Compose a partir das variáveis `POSTGRES_*`.
- Em desenvolvimento, é possível subir só o banco: `docker compose up -d postgres`.

### Imagens

| Serviço    | Base                                   | Observações                                             |
| ---------- | -------------------------------------- | ------------------------------------------------------- |
| `backend`  | `node:22-bookworm-slim` + OpenSSL      | Roda como usuário `node`; inclui o CLI do Prisma para as migrations. |
| `frontend` | build em `node:22-bookworm-slim`, servido por `nginx:stable-alpine` | Arquivos com hash em cache por 1 ano; `index.html` sem cache; gzip. |

---

## 13. Variáveis de ambiente

| Arquivo        | Uso                                        |
| -------------- | ------------------------------------------ |
| `.env`         | Stack completa no Docker Compose           |
| `backend/.env` | Backend rodando fora do Docker (`npm run dev`) |

`.env.example` da raiz:

```env
POSTGRES_USER=gastos
POSTGRES_PASSWORD=troque-esta-senha   # só letras e números
POSTGRES_DB=gastos
POSTGRES_PORT=5432

JWT_SECRET=troque-por-uma-chave-aleatoria-com-pelo-menos-32-caracteres
JWT_EXPIRES_IN=7d
APP_TIMEZONE=America/Sao_Paulo

APP_PORT=8080

SEED_USER_NAME=Anderson
SEED_USER_EMAIL=usuario@email.com
SEED_USER_PASSWORD=troque-esta-senha
```

- **Nunca versionar o `.env`** (já está no `.gitignore`). Versionar apenas os `.env.example`.
- O frontend usa `VITE_API_URL` (padrão `/api`), definido em tempo de build; não precisa ser alterado quando frontend e API estão no mesmo domínio.

---

## 14. Entregáveis

- [x] `Dockerfile` do frontend
- [x] `Dockerfile` do backend
- [x] `docker-compose.yml`
- [x] `.env.example`
- [x] Prisma schema
- [x] Prisma seed (categorias + usuário inicial)
- [x] Configuração do Nginx (container e VPS)
- [x] `README.md` com:
  - [x] instruções de instalação;
  - [x] como executar localmente;
  - [x] como executar na VPS;
  - [x] comandos do Docker Compose (`build`, `up -d`, `down`, `logs`);
  - [x] como executar as migrations do Prisma;
  - [x] backup e restauração do banco.

---

## 15. Orientações para quem for desenvolver

> Vale para pessoas e para IAs que forem implementar o projeto.

- Seguir esta especificação e **priorizar o MVP** antes de qualquer funcionalidade extra.
- Não adicionar bibliotecas desnecessárias.
- Manter frontend e backend desacoplados.
- Usar boas práticas de organização, **sem arquitetura excessivamente complexa** — é um projeto pessoal pequeno.
- Todos os endpoints devem validar autenticação e dados de entrada.
- Todo o código deve rodar em Docker.
- A aplicação deve ficar pronta para produção em uma VPS.
