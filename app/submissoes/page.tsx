"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Submission {
  id: string;
  courseId: string;
  status: string;
  instructor: { name: string; email: string };
  coordinator: { name: string; email: string };
  createdAt: string;
  exportedAt: string | null;
}

function statusLabel(status: string) {
  if (status === "exported") return "exportado";
  if (status === "reviewed") return "revisado";
  return "pendente";
}

function statusClass(status: string) {
  if (status === "exported") return "bg-green-500/10 text-green-400";
  if (status === "reviewed") return "bg-yellow-500/10 text-yellow-400";
  return "bg-red-500/10 text-red-400";
}

export default function SubmissoesPage() {
  const router = useRouter();
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
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-chakra-petch)] text-2xl font-bold text-alura-cyan">
          Submissões
        </h1>
        <button
          onClick={() => router.push("/upload")}
          className="bg-alura-cyan hover:bg-alura-cyan/80 text-alura-blue-deep font-bold px-5 py-2.5 rounded-xl transition-colors text-sm"
        >
          + Nova tarefa
        </button>
      </div>

      {loading && (
        <p className="text-alura-blue-light/40 text-sm">Carregando...</p>
      )}

      {!loading && submissions.length === 0 && (
        <p className="text-alura-blue-light/40 text-sm">
          Nenhuma tarefa criada ainda.
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
                className={`text-xs font-semibold px-2 py-1 rounded-full ${statusClass(s.status)}`}
              >
                {statusLabel(s.status)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
