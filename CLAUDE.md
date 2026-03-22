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
  page.tsx                     → Redirect por role: INSTRUCTOR → /tarefas, COORDINATOR/ADMIN → /submissoes
  layout.tsx                   → Root layout com <Providers> e <Header>
  login/page.tsx               → Login (público)
  criar-senha/page.tsx         → Definir senha para usuários sem senha (público)
  primeiro-acesso/page.tsx     → Cadastro de coordenadores via AllowedEmail (público)
  upload/page.tsx              → Upload JSON + seleção de instrutor — COORDINATOR/ADMIN (protegido)
  tarefas/page.tsx             → Lista de tarefas recebidas — INSTRUCTOR (protegido)
  tarefas/[id]/page.tsx        → Revisão da tarefa: seleção + edição + envio — INSTRUCTOR (protegido)
  submissoes/page.tsx          → Lista de submissões criadas — COORDINATOR/ADMIN (protegido)
  submissoes/[id]/page.tsx     → Detalhe da submissão: diff + edição + export — COORDINATOR/ADMIN (protegido)
  instrutores/page.tsx         → Gerenciamento de instrutores — COORDINATOR/ADMIN (protegido)
  api/
    auth/
      [...nextauth]/route.ts   → Handler NextAuth v4
      register/route.ts        → Cadastro público (valida AllowedEmail)
      set-password/route.ts    → Define senha para usuário sem senha
    instrutores/route.ts       → GET: lista instrutores | POST: cria instrutor (requer COORDINATOR ou ADMIN)
    coordenadores/route.ts     → GET: lista coordenadores/admins (qualquer usuário autenticado)
    submissoes/route.ts        → GET: lista submissões do usuário | POST: cria submissão (COORDINATOR/ADMIN)
    submissoes/[id]/route.ts   → GET: detalhe | PATCH: instrutor envia revisão ou coordenador exporta
components/
  Providers.tsx                → SessionProvider + AppProvider (deve ter "use client")
  Header.tsx                   → Header com email e botão Sair (usa useSession)
  DropZone.tsx                 → Drag-drop para upload JSON
  LessonAccordion.tsx          → Accordion de aula com exercícios
  ExerciseCard.tsx             → Card de exercício com alternativas e comentário
  StepBar.tsx                  → Barra de progresso de passos (centralizada via justify-center)
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
public/
  novidades.html               → Patch notes v1.x (abrir no browser e imprimir como PDF)
```

---

## Autenticação e permissões

### Roles do select-activity (via AppRole, app="select-activity")

| Role | Fluxo |
|---|---|
| `INSTRUCTOR` | `/tarefas` (lista) → `/tarefas/[id]` (seleciona + edita + envia ao coordenador) |
| `COORDINATOR` | `/submissoes` (lista) → `/upload` (cria tarefa) → `/submissoes/[id]` (diff + edição + export) |
| `ADMIN` | Mesmo que `COORDINATOR`, vê todas as submissões |

### Fluxo completo coord → instrutor

1. **Coordenador** acessa `/submissoes` → clica em "Nova submissão" → vai para `/upload`
2. **Coordenador** faz upload do JSON → seleciona instrutor (existente ou novo) → envia
   - Novo instrutor: cadastrado via `POST /api/instrutores` com nome + email, sem senha, sem acesso ao hub
   - Submissão criada com `status: "pending"`, `submittedData: {}`
3. **Instrutor** entra no app → vai para `/tarefas` → vê tarefa com status `pendente`
4. **Instrutor** abre `/tarefas/[id]` → seleciona exercícios → edita → clica "Enviar"
   - `PATCH /api/submissoes/[id]` com `submittedData` → status muda para `"reviewed"`
5. **Coordenador** vê status `revisado` em `/submissoes` → abre `/submissoes/[id]`
   - Vê diff das edições do instrutor, pode editar, restaurar ou remover exercícios
   - Clica "Exportar JSON" → status muda para `"exported"`

### Status da Submission

| Status | Significado |
|---|---|
| `"pending"` | Coordenador criou, instrutor ainda não revisou |
| `"reviewed"` | Instrutor enviou revisão, coordenador ainda não exportou |
| `"exported"` | Coordenador exportou o JSON final |

### Fluxo de acesso por tipo de usuário

**Coordenador (interno Alura — email na AllowedEmail):**
1. Acessa `/primeiro-acesso` → preenche nome, email e senha
2. O sistema verifica `AllowedEmail` e cria `User` + `AppRole("select-activity", "COORDINATOR")` + `AppRole("hub-efops", "USER")`
3. Faz login normalmente (mesmo login do Hub Efops)

**Instrutor (externo — criado pelo coordenador):**
1. Coordenador cria via `POST /api/instrutores` (ou inline no `/upload`)
2. Usuário criado sem senha + `AppRole("select-activity", "INSTRUCTOR")` apenas — sem acesso ao hub
3. Instrutor faz login **apenas com o email**, sem senha

### Rotas públicas (sem autenticação)
- `/login`, `/criar-senha`, `/primeiro-acesso`
- `/api/auth/**`

### Proteção via `proxy.ts`
- Arquivo: `proxy.ts` (Next.js 16.2 renomeou `middleware.ts` → `proxy.ts`)
- Função exportada: `proxy()` (não `middleware()`)
- Usa `require("next-auth/jwt")` — workaround obrigatório para compatibilidade com `moduleResolution: bundler`

---

## Banco de dados

O schema contém os modelos usados pelo select-activity. A `AllowedEmail` é gerenciada pelo hub-efops — este app só lê.

### Model Submission

```prisma
model Submission {
  id            String    @id @default(cuid())
  instructorId  String
  instructor    User      @relation("SubmissionInstructor", fields: [instructorId], references: [id])
  coordinatorId String
  coordinator   User      @relation("SubmissionCoordinator", fields: [coordinatorId], references: [id])
  courseId      String
  originalData  Json      // JSON completo subido pelo coordenador (fonte do diff)
  submittedData Json      // {} enquanto pending | { courseId, lessons } após o instrutor enviar
  status        String    @default("pending") // "pending" | "reviewed" | "exported"
  exportedAt    DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

### Diff de edições

`ExerciseCard` aceita `originalExercise?: Exercise`. Quando presente, exibe campos alterados com o texto original riscado (vermelho) acima do valor atual. O `originalData` da `Submission` serve como fonte do original.

### Exercícios têm ID único

IDs são gerados via `crypto.randomUUID()` no upload (`app/upload/page.tsx`). Todas as comparações de exercício usam `exercise.id`, nunca `exercise.title`.

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
- `StepBar` é auto-centrado via `justify-center` — não precisa de wrapper `w-full`

---

## O que NÃO fazer

- **Nunca** rodar `prisma migrate dev` ou `prisma db push` — o banco é do hub-efops
- **Nunca** importar `next-auth` diretamente no handler ou em getServerSession — usar `next-auth/next`
- **Nunca** renomear `proxy.ts` de volta para `middleware.ts` — quebra o Next.js 16.2
- **Nunca** tentar tipar `authOptions` com `NextAuthOptions` — usar `any`
- Não usar `fetch()` dentro de Server Components para buscar dados internos — usar Prisma direto
- Não expor dados sensíveis (senha, hash) nas respostas de API
- Não comparar exercícios por `title` — sempre usar `exercise.id`
- Não mutar objetos de estado diretamente — usar spread (`{ ...obj, campo: valor }`)
