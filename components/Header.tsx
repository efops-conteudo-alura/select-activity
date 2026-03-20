"use client";

import { signOut, useSession } from "next-auth/react";

export function Header() {
  const { data: session } = useSession();
  if (!session) return null;

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-alura-blue-light/10 bg-alura-blue-dark shrink-0">
      <span className="font-[family-name:var(--font-chakra-petch)] text-alura-cyan font-bold text-sm">
        Seletor de Atividades
      </span>
      <div className="flex items-center gap-4">
        <span className="text-alura-blue-light/50 text-xs hidden sm:block">
          {session.user?.email}
        </span>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-xs text-alura-blue-light/50 hover:text-alura-blue-light transition-colors"
        >
          Sair
        </button>
      </div>
    </header>
  );
}
