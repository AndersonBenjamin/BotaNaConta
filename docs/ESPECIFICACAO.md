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
| Frontend       | React, Vite, JavaScript ou TypeScript, React Router, Axios        |
| Estilo         | CSS responsivo ou Tailwind CSS *(estética ainda a definir)*       |
| Backend        | Node.js, Express                                                  |
| ORM            | Prisma                                                            |
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

> Os emojis podem ficar no frontend (mapa por nome) ou ganhar um campo `icon` na tabela — decidir na implementação.

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
| Valor       | Numérico, formato `R$ 35,90`. Abre **teclado numérico** (`inputmode="decimal"`). Foco automático ao abrir a tela. |
| Categoria   | Botões rápidos com emoji (ou select).                                          |
| Descrição   | Opcional. Ex.: `Almoço`.                                                       |
| Data        | Preenchida com a data atual; pode ser alterada.                                |
| Botão       | **Adicionar gasto**                                                            |

Após salvar:

1. Limpar o formulário.
2. Mostrar confirmação (ex.: toast "Gasto registrado").
3. Voltar para o dashboard ou lista.

A mesma tela/formulário é reaproveitada para **editar** um gasto, com opção de **excluir** (pedindo confirmação).

### 8.4 Lista de gastos

- Mostra descrição, categoria, valor e data.
- Ordenada do **mais recente para o mais antigo**.
- Agrupada por dia.
- Tocar em um item abre a edição.

```text
02 OUT
  🍔 Almoço              R$ 35,90
  🛒 Mercado            R$ 120,50

01 OUT
  🚗 Combustível         R$ 80,00
```

### 8.5 Filtros

- **Período:** Hoje · Esta semana · Este mês · Mês anterior
- **Categoria:** seleção de uma categoria (ou todas)

### 8.6 Resumo mensal

Total gasto por categoria no mês, sem gráficos complexos.

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
- Valores monetários: enviados como número (`35.90`); a API deve convertê-los para `Decimal` e pode devolvê-los como string (`"35.90"`) para não perder precisão.
- Datas: formato `YYYY-MM-DD`.

### Resumo dos endpoints

| Método | Rota                   | Auth | Descrição                          |
| ------ | ---------------------- | ---- | ---------------------------------- |
| POST   | `/api/auth/login`      |      | Autentica e retorna o JWT          |
| GET    | `/api/me`              | 🔒   | Dados do usuário autenticado       |
| GET    | `/api/categories`      | 🔒   | Lista as categorias                |
| GET    | `/api/expenses`        | 🔒   | Lista gastos (com filtros)         |
| GET    | `/api/expenses/:id`    | 🔒   | Busca um gasto                     |
| POST   | `/api/expenses`        | 🔒   | Cria um gasto                      |
| PUT    | `/api/expenses/:id`    | 🔒   | Atualiza um gasto                  |
| DELETE | `/api/expenses/:id`    | 🔒   | Exclui um gasto                    |
| GET    | `/api/dashboard`       | 🔒   | Totais e gastos recentes           |

> `GET /api/categories` foi incluído porque o frontend precisa da lista para montar os botões de categoria.

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

Response `401`: credenciais inválidas (mensagem genérica, sem indicar se o erro foi no e-mail ou na senha).

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

- `amount`: obrigatório, número > 0, no máximo 2 casas decimais.
- `categoryId`: obrigatório, deve existir.
- `description`: opcional, texto com tamanho máximo definido (ex.: 255).
- `date`: opcional (padrão: hoje), data válida.

Response `201`: gasto criado.

### `GET /api/expenses/:id` · `PUT /api/expenses/:id` · `DELETE /api/expenses/:id` 🔒

- `PUT` aceita o mesmo corpo do `POST`.
- `DELETE` responde `204`.
- Se o gasto não existir **ou pertencer a outro usuário**, responder `404`.

### `GET /api/dashboard` 🔒

Retorna os números do período atual:

```json
{
  "totalMonth": 2845.90,
  "totalToday": 87.50,
  "recentExpenses": [],
  "byCategory": [
    { "categoryId": 1, "name": "Alimentação", "total": 650.00 }
  ]
}
```

> "Hoje" e "este mês" devem ser calculados no fuso **America/Sao_Paulo**, para evitar que gastos feitos à noite caiam no dia seguinte.

### Padrão de erros

```json
{
  "error": "Mensagem legível",
  "details": []
}
```

| Código | Uso                                       |
| ------ | ----------------------------------------- |
| 400    | Dados inválidos                           |
| 401    | Não autenticado / token inválido/expirado |
| 404    | Recurso não encontrado                    |
| 500    | Erro interno (sem expor stack trace)      |

---

## 10. Segurança

- [ ] Senhas com `bcrypt`.
- [ ] JWT com expiração.
- [ ] Rotas protegidas por middleware de autenticação.
- [ ] Toda consulta de gasto filtrada pelo `userId` do token (um usuário nunca acessa gasto de outro).
- [ ] Validação dos dados recebidos pela API.
- [ ] CORS liberado somente para o domínio do frontend.
- [ ] Variáveis sensíveis somente via `.env`.
- [ ] Nunca registrar senhas ou tokens em logs.
- [ ] Nunca retornar informações sensíveis (ex.: `passwordHash`, stack traces).
- [ ] HTTPS em produção.
- [ ] Banco de dados **sem porta exposta** para a internet (acesso só pela rede interna do Docker).

---

## 11. Interface mobile

Prioridade para celular, com largura de referência entre **360px e 430px**. A estética (cores, fontes, tema) ainda será definida.

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

### Docker Compose

Serviços: `frontend`, `backend` e `postgres`.

```yaml
services:
  frontend:
    build: ./frontend
    restart: unless-stopped

  backend:
    build: ./backend
    restart: unless-stopped
    env_file: .env
    depends_on:
      - postgres

  postgres:
    image: postgres:16
    restart: unless-stopped
    env_file: .env
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

- Os dados do banco persistem no volume `postgres_data`.
- `restart: unless-stopped` garante que os containers voltem após reinício.
- Credenciais do banco somente via variáveis de ambiente.

### Nginx

Em produção, o Nginx atua como reverse proxy:

```text
https://gastos.seudominio.com
             |
             v
           Nginx
         /       \
   /api/*         /*
     |             |
  backend      frontend
```

O HTTPS será configurado depois com **Let's Encrypt** (Certbot).

### Deploy na VPS

```bash
git clone <url-do-repositorio>
cd BotaNaConta
cp .env.example .env   # e preencher os valores
docker compose up -d --build
```

### Comandos úteis

```bash
docker compose build          # gera as imagens
docker compose up -d          # sobe os serviços em segundo plano
docker compose down           # derruba os serviços (dados permanecem no volume)
docker compose logs -f        # acompanha os logs

# Prisma
docker compose exec backend npx prisma migrate deploy   # aplica migrations (produção)
docker compose exec backend npx prisma db seed          # cria categorias e usuário inicial
npx prisma migrate dev --name <nome>                    # cria nova migration (desenvolvimento)
```

---

## 13. Variáveis de ambiente

`.env.example`:

```env
# Banco
POSTGRES_USER=gastos
POSTGRES_PASSWORD=troque-esta-senha
POSTGRES_DB=gastos
DATABASE_URL=postgresql://gastos:troque-esta-senha@postgres:5432/gastos

# API
PORT=3000
JWT_SECRET=uma-chave-secreta-forte
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://gastos.seudominio.com

# Usuário inicial (usado pelo seed)
SEED_USER_NAME=Anderson
SEED_USER_EMAIL=usuario@email.com
SEED_USER_PASSWORD=troque-esta-senha

# Frontend
VITE_API_URL=/api
```

- **Nunca versionar o `.env`** (incluir no `.gitignore`).
- Versionar apenas o `.env.example`.

---

## 14. Entregáveis

- [ ] `Dockerfile` do frontend
- [ ] `Dockerfile` do backend
- [ ] `docker-compose.yml`
- [ ] `.env.example`
- [ ] Prisma schema
- [ ] Prisma seed (categorias + usuário inicial)
- [ ] Configuração do Nginx
- [ ] `README.md` com:
  - [ ] instruções de instalação;
  - [ ] como executar localmente;
  - [ ] como executar na VPS;
  - [ ] comandos do Docker Compose (`build`, `up -d`, `down`, `logs`);
  - [ ] como executar as migrations do Prisma.

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
