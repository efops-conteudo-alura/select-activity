"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Submission {
  id: string;
  courseId: string;
  status: string;
  instructor: { name: string; email: string };
  createdAt: string;
  exportedAt: string | null;
}

export default function SubmissoesPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/submissoes")
      .then((r) => r.json())
      .then((data) => {
        setSubmissions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <main className="flex flex-1 flex-col px-6 py-10 max-w-3xl mx-auto w-full gap-6">
      <h1 className="font-[family-name:var(--font-chakra-petch)] text-2xl font-bold text-alura-cyan">
        Submissões recebidas
      </h1>

      {loading && (
        <p className="text-alura-blue-light/40 text-sm">Carregando...</p>
      )}

      {!loading && submissions.length === 0 && (
        <p className="text-alura-blue-light/40 text-sm">
          Nenhuma submissão recebida ainda.
        </p>
      )}

      {!loading && submissions.length > 0 && (
        <div className="flex flex-col gap-3">
          {submissions.map((s) => (
            <Link
              key={s.id}
              href={`/submissoes/${s.id}`}
              className="flex items-center justify-between bg-alura-blue-dark rounded-xl border border-alura-blue-light/10 px-5 py-4 hover:border-alura-cyan/30 transition-colors"
            >
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-medium text-alura-blue-light">
                  {s.courseId}
                </p>
                <p className="text-xs text-alura-blue-light/50">
                  {s.instructor.name} · {new Date(s.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <span
                className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  s.status === "exported"
                    ? "bg-green-500/10 text-green-400"
                    : "bg-alura-cyan/10 text-alura-cyan"
                }`}
              >
                {s.status === "exported" ? "exportado" : "pendente"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
