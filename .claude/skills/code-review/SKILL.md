---
name: code-review
description: Faz uma revisão profunda de qualidade de código em um arquivo ou feature específica do Seletor de Atividades. Use quando o usuário pedir para revisar, fazer code review, checar qualidade, ou verificar bugs em um arquivo ou funcionalidade.
---

# Skill: Code Review — Seletor de Atividades

Você vai fazer uma revisão de qualidade em um arquivo ou feature específica do Seletor de Atividades da Alura. O projeto usa Next.js 16.2 (App Router), TypeScript, Prisma + PostgreSQL (banco compartilhado com hub-efops), NextAuth v4 e Tailwind CSS v4. Sem shadcn, sem react-hook-form — UI e formulários feitos à mão.

## Antes de começar

Se o usuário não especificou qual arquivo ou feature revisar, pergunte:
- "Qual arquivo ou feature você quer que eu revise?"

Se especificou, leia o(s) arquivo(s) relevante(s) antes de qualquer análise.

---

## O que verificar

### 1. Edge cases não tratados
- O que acontece se o dado vier vazio, null ou undefined?
- E se a requisição falhar no meio?
- E se o usuário fizer a ação duas vezes seguidas (duplo clique, duplo submit)?
- `submittedData` pode ser `{}` quando o instrutor ainda não enviou — o código trata isso?

### 2. Tratamento de erros
- Chamadas ao Prisma estão dentro de try/catch (em API routes)?
- Erros de API estão sendo capturados e exibidos ao usuário de forma útil?
- O app quebra silenciosamente ou informa o usuário quando algo dá errado?
- Fetch calls no cliente verificam `res.ok` antes de usar o resultado?

### 3. TypeScript
- Há uso de `any` que poderia ser tipado corretamente? (exceção: `authOptions: any` é workaround obrigatório)
- Type assertions (`as Tipo`) sem verificação real?
- Props de componentes estão tipadas?
- Retornos de função estão tipados?

### 4. Lógica de negócio e fluxo
- As verificações de role (INSTRUCTOR / COORDINATOR / ADMIN) estão corretas nas API routes?
- Instrutor só acessa suas próprias tarefas (`instructorId === userId`)?
- Coordenador só acessa suas próprias submissões (exceto ADMIN, que vê tudo)?
- O status da Submission está sendo atualizado corretamente? (`pending` → `reviewed` → `exported`)
- Exercícios são comparados por `exercise.id`, nunca por `exercise.title`?

### 5. Consistência com o projeto
- Páginas com hooks, eventos ou `useSession` têm `"use client"`?
- Server Components não estão usando `fetch()` para dados internos — usam Prisma direto?
- Prisma importado de `@/lib/db` como `{ prisma }` (não `{ db }`, não import direto)?
- `getServerSession` importado de `next-auth/next` (não de `next-auth`)?
- Estado atualizado via spread (`{ ...obj, campo: valor }`) — sem mutação direta de objetos?

### 6. Performance
- Queries Prisma buscam campos desnecessários em listas? (prefira `select` específico)
- `useEffect` com fetch poderia ser simplificado?
- O `AppContext` está sendo usado onde deveria ser estado local?

---

## Formato do relatório

```
# Code Review — [nome do arquivo/feature]

## Resumo
[2-3 linhas sobre a qualidade geral do código]

## Problemas encontrados

### 🔴 Crítico — [título]
**Arquivo:** `caminho/do/arquivo.ts`
**Linha:** XX
**Problema:** descrição clara
**Correção sugerida:**
\`\`\`ts
// código corrigido
\`\`\`

### 🟠 Importante — [título]
[mesma estrutura]

### 🟡 Sugestão — [título]
[mesma estrutura]

## O que está bem feito
[lista de pontos positivos — sempre inclua isso]

## Próximos passos sugeridos
[lista priorizada do que corrigir primeiro]
```

---

## Importante

- Leia o código real antes de comentar — nunca assuma o conteúdo
- Se precisar de contexto de outro arquivo para entender a lógica, leia esse arquivo também
- Separe problemas reais de preferências estilísticas — só reporte o que tem impacto real
- Sempre inclua pontos positivos — o objetivo é melhorar, não só criticar
- Se o código estiver bom, diga isso claramente em vez de inventar problemas
