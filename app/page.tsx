"use client";

import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { ProfileButton } from "@/components/ProfileButton";
import type { PersonType } from "@/types/course";

export default function SelectPersonPage() {
  const router = useRouter();
  const { setPersonType } = useApp();

  function handleSelect(type: PersonType) {
    setPersonType(type);
    router.push("/upload");
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-12 px-6 py-16">
      <div className="flex flex-col items-center gap-2">
        <h1 className="font-[family-name:var(--font-chakra-petch)] text-4xl font-bold text-alura-cyan">
          Seletor de Atividades
        </h1>
        <p className="text-alura-blue-light/70 text-lg">Quem é você?</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        <ProfileButton type="instructor" onClick={() => handleSelect("instructor")} />
        <ProfileButton type="coordinator" onClick={() => handleSelect("coordinator")} />
      </div>
    </main>
  );
}
