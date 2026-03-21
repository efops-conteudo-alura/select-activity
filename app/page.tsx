"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import type { PersonType } from "@/types/course";

type AppSession = { user: { id: string; email: string; role: string } };

const ROLE_TO_PERSON_TYPE: Record<string, PersonType> = {
  INSTRUCTOR: "instructor",
  COORDINATOR: "coordinator",
  ADMIN: "coordinator", // admin tem visão de coordenador por padrão
};

export default function HomePage() {
  const { data: rawSession, status } = useSession();
  const session = rawSession as AppSession | null;
  const router = useRouter();
  const { setPersonType } = useApp();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.replace("/login");
      return;
    }

    const personType = ROLE_TO_PERSON_TYPE[session.user.role];
    if (personType) {
      setPersonType(personType);
    }
    // Coordenadores e admins vão direto para a lista de submissões
    if (session.user.role === "COORDINATOR" || session.user.role === "ADMIN") {
      router.replace("/submissoes");
    } else {
      router.replace("/upload");
    }
  }, [session, status, router, setPersonType]);

  return (
    <main className="flex flex-1 items-center justify-center">
      <p className="text-alura-blue-light/40 text-sm">Carregando...</p>
    </main>
  );
}
