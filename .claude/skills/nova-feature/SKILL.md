---
name: nova-feature
description: Cria a estrutura completa de uma nova página ou feature no Seletor de Atividades, seguindo os padrões do projeto. Use quando o usuário pedir para criar uma nova tela, rota, funcionalidade ou fluxo.
---

# Skill: Nova Feature — Seletor de Atividades

Você vai criar a estrutura de uma nova feature no Seletor de Atividades da Alura. Siga rigorosamente os padrões do projeto descritos no CLAUDE.md.

## Antes de criar qualquer arquivo

Pergunte ao usuário (se não estiver claro):
1. **Qual o objetivo da feature?** — o que o usuário vai fazer nessa tela?
2. **Quem acessa?** — INSTRUCTOR, COORDINATOR, ADMIN, ou mais de um role?
3. **Precisa de dados do banco?** — se sim, qual model do Prisma será lido/escrito?
4. **Precisa de nova rota de API?** — ou usa uma existente?

---

## Estrutura a criar

### 1. Página (Client Component)

Todas as páginas do Seletor são Client Components — buscam dados via `fetch` de API routes.

```
app/[nome-da-rota]/page.tsx
```

Padrão:
```tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NomePage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/rota")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // ...
}
```

### 2. API Route

```
app/api/[nome]/route.ts
```

Padrão obrigatório:
```ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";   // ← sempre next-auth/next
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";                  // ← sempre { prisma }, não { db }

type AppSession = { user: { id: string; role: string } };

export async function GET() {
  const session = await getServerSession(authOptions) as AppSession | null;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Filtrar por role quando necessário:
  // INSTRUCTOR → dados do próprio usuário
  // COORDINATOR → dados do próprio coordenador
  // ADMIN → todos os dados

  const items = await prisma.model.findMany({ ... });
  return NextResponse.json(items);
}
```

---

## Checklist antes de finalizar

- [ ] A página tem `"use client"` no topo
- [ ] A API route importa `getServerSession` de `next-auth/next` (não de `next-auth`)
- [ ] A API route importa `prisma` de `@/lib/db`
- [ ] A API route verifica sessão e retorna 401 se não autenticado
- [ ] Se a rota é restrita a um role, retorna 403 para outros roles
- [ ] Se INSTRUCTOR, valida que só acessa seus próprios dados
- [ ] Não usar `fetch()` dentro de API routes para dados internos — Prisma direto
- [ ] Não usar `prisma migrate dev` — migrations são gerenciadas pelo hub-efops
- [ ] Estado atualizado via spread, sem mutação direta de objetos

---

## Workarounds obrigatórios do projeto

```ts
// ✅ SEMPRE assim — nextauth v4 + Next.js 16.2 exige next-auth/next
import { getServerSession } from "next-auth/next"

// ✅ authOptions tipado como any (workaround obrigatório)
export const authOptions: any = { ... }

// ✅ Prisma sempre assim
import { prisma } from "@/lib/db"
```

---

## O que NÃO fazer

- Não usar `fetch()` em Server Components para dados internos — este projeto não tem Server Components com data fetching
- Não instalar shadcn — UI é Tailwind puro, feita à mão
- Não usar `react-hook-form` ou `zod` — validações são feitas manualmente
- Não rodar `prisma migrate dev` ou `prisma db push` — o banco pertence ao hub-efops
- Não importar `next-auth` diretamente — sempre `next-auth/next`
- Não comparar exercícios por `title` — sempre por `exercise.id`
