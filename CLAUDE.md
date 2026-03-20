# CLAUDE.md — Seletor de Atividades (select-activity)

Ferramenta interna da Alura para coordenadores e instrutores selecionarem e revisarem atividades de cursos. Compartilha o banco de dados Neon com o hub-efops.

---

## Stack

- **Framework:** Next.js 16.2.0 (App Router) + TypeScript + React 19
- **Banco de dados:** PostgreSQL via Prisma ORM v6.19.2 (Neon — mesmo banco do hub-efops)
- **Autenticação:** NextAuth v4 (credentials provider)
- **UI:** Tailwind CSS v4 com cores customizadas (`alura-cyan`, `alura-blue-*`)
- **Deploy:** Vercel (branch `main`)

---

## Comandos úteis

```bash
npm run dev          # inicia em desenvolvimento
npm run build        # prisma generate + next build
npx prisma generate  # regenera o client (NUNCA migrate ou db push aqui)
```

> **IMPORTANTE:** As migrations são gerenciadas exclusivamente pelo **hub-efops**. Nunca rode `prisma migrate dev`, `prisma db push` ou qualquer comando que altere o banco a partir deste projeto. Use apenas `npx prisma generate`.

---

## Estrutura de pastas

```
app/
  page.tsx                     → Redirect por role (/upload para coordinator/admin, /select para instructor)
  layout.tsx                   → Root layout com <Providers> e <Header>
  login/page.tsx               → Login (público)
  criar-senha/page.tsx         → Definir senha para usuários sem senha (público)
  primeiro-acesso/page.tsx     → Cadastro de coordenadores via AllowedEmail (público)
  upload/page.tsx              → Upload de arquivo JSON (protegido)
  select/page.tsx              → Seleção de atividades — INSTRUCTOR (protegido)
  review/page.tsx              → Revisão final + export (protegido)
  api/
    auth/
      [...nextauth]/route.ts   → Handler NextAuth v4
      register/route.ts        → Cadastro público (valida AllowedEmail)
      set-password/route.ts    → Define senha para usuário sem senha
    instrutores/route.ts       → POST: cria instrutor (requer COORDINATOR ou ADMIN)
components/
  Providers.tsx                → SessionProvider + AppProvider (deve ter "use client")
  Header.tsx                   → Header com email e botão Sair (usa useSession)
  DropZone.tsx                 → Drag-drop para upload JSON
  LessonAccordion.tsx          → Accordion de aula com exercícios
  ExerciseCard.tsx             → Card de exercício com alternativas e comentário
context/
  AppContext.tsx               → Estado global: personType, course, selectedLessons
lib/
  auth.ts                      → Configuração NextAuth (authOptions tipado como any — workaround)
  db.ts                        → Singleton PrismaClient (export: { prisma })
  storage.ts                   → sessionStorage para persistir JSON do curso
  export.ts                    → Export JSON das atividades selecionadas
types/
  course.ts                    → Course, Lesson, Exercise, Alternative, PersonType
  next-auth.d.ts               → Extensão Session e JWT com id e role
prisma/
  schema.prisma                → Modelos read-only: User, AppRole, AllowedEmail
proxy.ts                       → Middleware de autenticação (Next.js 16.2)
```

---

## Autenticação e permissões

### Roles do select-activity (via AppRole, app="select-activity")

| Role | Acesso |
|---|---|
| `INSTRUCTOR` | Upload → Seleção de atividades (`/select`) → Revisão |
| `COORDINATOR` | Upload → Revisão (`/review`, read-only) |
| `ADMIN` | Mesmo que COORDINATOR |

### Fluxo de acesso por tipo de usuário

**Coordenador (interno Alura — email na AllowedEmail):**
1. Acessa `/primeiro-acesso` → preenche nome, email e senha
2. O sistema verifica `AllowedEmail` e cria `User` + `AppRole("select-activity", "COORDINATOR")` + `AppRole("hub-efops", "USER")`
3. Faz login normalmente

**Instrutor (externo — criado por coordenador):**
1. Coordenador chama `POST /api/instrutores` com nome e email
2. Usuário criado sem senha + `AppRole("select-activity", "INSTRUCTOR")`
3. Instrutor acessa `/criar-senha`, define sua senha e entra

### Rotas públicas (sem autenticação)
- `/login`, `/criar-senha`, `/primeiro-acesso`
- `/api/auth/**`

### Proteção via `proxy.ts`
- Arquivo: `proxy.ts` (Next.js 16.2 renomeou `middleware.ts` → `proxy.ts`)
- Função exportada: `proxy()` (não `middleware()`)
- Usa `require("next-auth/jwt")` — workaround obrigatório para compatibilidade com `moduleResolution: bundler`

---

## Banco de dados

O schema é mínimo — apenas os modelos necessários para o select-activity:

```prisma
model User {
  id        String    @id @default(cuid())
  name      String
  email     String    @unique
  password  String?
  image     String?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  appRoles  AppRole[]
}

model AppRole {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  app       String   // "select-activity" ou "hub-efops"
  role      String   // "INSTRUCTOR", "COORDINATOR", "ADMIN"
  createdAt DateTime @default(now())
  @@unique([userId, app])
}

model AllowedEmail {
  id        String   @id @default(cuid())
  email     String   @unique
  createdAt DateTime @default(now())
}
```

A `AllowedEmail` é gerenciada pelo hub-efops — este app só lê.

---

## Workarounds obrigatórios — Next.js 16.2 + NextAuth v4

Next.js 16.2 usa `moduleResolution: bundler`, que quebra as importações padrão do next-auth v4. Os workarounds abaixo são necessários e não devem ser "corrigidos":

```ts
// ✅ Correto — importar de "next-auth/next", não de "next-auth"
import NextAuth from "next-auth/next"
import { getServerSession } from "next-auth/next"

// ✅ Correto — authOptions tipado como any
export const authOptions: any = { ... }

// ✅ Correto — getToken via require() em proxy.ts
const { getToken } = require("next-auth/jwt") as { getToken: ... }
```

A migração para next-auth v5 está registrada na issue #17 do hub-efops.

---

## Convenções de código

- `"use client"` apenas para componentes com hooks, eventos ou `useSession`
- `SessionProvider` deve estar dentro de um componente com `"use client"` (ver `Providers.tsx`)
- Importar Prisma sempre de `@/lib/db`: `import { prisma } from "@/lib/db"` (não `{ db }`)
- Estado do curso persiste em `sessionStorage` — não sobrevive a refresh de tab
- Todos os componentes de UI são feitos à mão (sem shadcn) — Tailwind puro

---

## O que NÃO fazer

- **Nunca** rodar `prisma migrate dev` ou `prisma db push` — o banco é do hub-efops
- **Nunca** importar `next-auth` diretamente no handler ou em getServerSession — usar `next-auth/next`
- **Nunca** renomear `proxy.ts` de volta para `middleware.ts` — quebra o Next.js 16.2
- **Nunca** tentar tipar `authOptions` com `NextAuthOptions` — usar `any`
- Não usar `fetch()` dentro de Server Components para buscar dados internos — usar Prisma direto
- Não expor dados sensíveis (senha, hash) nas respostas de API
