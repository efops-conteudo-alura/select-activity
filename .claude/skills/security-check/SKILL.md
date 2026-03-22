---
name: security-check
description: Realiza uma auditoria de segurança no Seletor de Atividades. Use quando o usuário pedir para verificar segurança, fazer security check, auditar o projeto, ou antes de um deploy importante.
---

# Skill: Security Check — Seletor de Atividades

Você vai realizar uma auditoria de segurança sistemática no Seletor de Atividades da Alura. O projeto usa Next.js 16.2 (App Router), NextAuth v4, Prisma + PostgreSQL (banco compartilhado com hub-efops) e Tailwind CSS v4.

Execute cada verificação abaixo em ordem. Para cada item encontrado, registre o arquivo, a linha e a severidade.

---

## 1. Autenticação nas API Routes

Leia todos os arquivos em `app/api/` e verifique se **todas** as rotas fazem:

```ts
const session = await getServerSession(authOptions) as AppSession | null;
if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
```

Sinalize como **CRÍTICO** qualquer rota que:
- Não verifica sessão
- Verifica sessão mas não retorna 401 se não autenticado
- Usa `session` sem verificar se é null antes

Exceções permitidas (não sinalizar):
- `app/api/auth/` — rotas do NextAuth

---

## 2. Verificação de role nas rotas protegidas

Verifique se as rotas que exigem role específico fazem a validação correta:

```ts
// Rota só para COORDINATOR/ADMIN
if (session.user.role !== "COORDINATOR" && session.user.role !== "ADMIN") {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// Rota só para INSTRUCTOR
if (session.user.role !== "INSTRUCTOR") {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

Roles esperados por rota:
- `POST /api/submissoes` — apenas COORDINATOR/ADMIN
- `POST /api/instrutores` — apenas COORDINATOR/ADMIN
- `GET /api/instrutores` — apenas COORDINATOR/ADMIN
- `GET /api/coordenadores` — qualquer autenticado

Sinalize como **CRÍTICO** qualquer rota que aceite roles incorretos.

---

## 3. Isolamento de dados por usuário

Verifique se cada role só acessa o que lhe pertence:

**INSTRUCTOR:**
- `GET /api/submissoes` — deve filtrar por `instructorId === session.user.id`
- `PATCH /api/submissoes/[id]` — deve validar que `submission.instructorId === session.user.id`
- `GET /api/submissoes/[id]` — deve negar acesso se não for o instrutor nem o coordenador da submission

**COORDINATOR:**
- `GET /api/submissoes` — deve filtrar por `coordinatorId === session.user.id`
- `PATCH /api/submissoes/[id]` — deve validar que é o coordenador da submission

**ADMIN:**
- Pode ver e modificar qualquer submissão — sem filtro de `coordinatorId`

Sinalize como **CRÍTICO** qualquer caso onde um usuário pode acessar dados de outro.

---

## 4. Dados sensíveis nas respostas de API

Verifique se alguma rota retorna campos sensíveis desnecessariamente:
- Campo `password` em respostas de usuário
- Hash de senha exposto
- Dados de outros usuários sem autorização

Sinalize como **ALTO** qualquer exposição de dados sensíveis.

---

## 5. Variáveis de ambiente no cliente

Verifique se há variáveis de ambiente sendo usadas em componentes `"use client"` sem o prefixo `NEXT_PUBLIC_`:

- Variáveis sem `NEXT_PUBLIC_` só devem aparecer em API routes e `lib/`
- Sinalize como **ALTO** qualquer vazamento de secrets para o cliente

---

## 6. Validação de inputs nas API routes

Verifique se as rotas POST e PATCH validam o body antes de usar:
- Sinalize como **MÉDIO** rotas que usam `req.json()` direto sem qualquer validação
- Sinalize como **ALTO** se dados do body são passados direto para o Prisma sem sanitização (ex: `prisma.model.create({ data: body })` sem filtrar campos)

---

## Formato do relatório

```
# Security Check — Seletor de Atividades
Data: [hoje]

## Resumo
- 🔴 Críticos: X
- 🟠 Altos: X
- 🟡 Médios: X
- ✅ Sem problemas encontrados em: [lista das categorias limpas]

## Problemas encontrados

### 🔴 CRÍTICO — [título]
**Arquivo:** `caminho/do/arquivo.ts`
**Linha:** XX
**Problema:** descrição clara do problema
**Correção sugerida:**
\`\`\`ts
// código corrigido
\`\`\`

---

## O que foi verificado e está OK
[lista dos itens sem problemas]
```

---

## Importante

- Leia os arquivos reais — não assuma que estão corretos
- Se um arquivo for muito grande, leia as partes relevantes (imports, handlers de sessão, queries Prisma)
- Não sinalize falsos positivos — só reporte o que é genuinamente um risco
- Se encontrar algo fora das categorias acima que pareça um risco, adicione numa seção "Outros achados"
