"use client";

import type { PersonType } from "@/types/course";

type Props = {
  type: PersonType;
  onClick: () => void;
};

const config = {
  instructor: {
    label: "Pessoa Instrutora",
    icon: "👩‍🏫",
    bg: "bg-alura-cyan",
    text: "text-alura-blue-deep",
    hover: "hover:bg-alura-cyan/80",
  },
  coordinator: {
    label: "Pessoa Coordenadora",
    icon: "🎓",
    bg: "bg-alura-cyan-light",
    text: "text-alura-blue-deep",
    hover: "hover:bg-alura-cyan-light/80",
  },
};

export function ProfileButton({ type, onClick }: Props) {
  const c = config[type];
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-3 px-10 py-8 rounded-2xl font-bold text-lg transition-colors cursor-pointer ${c.bg} ${c.text} ${c.hover}`}
    >
      <span className="text-4xl">{c.icon}</span>
      {c.label}
    </button>
  );
}
