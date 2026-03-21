"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { StepBar } from "@/components/StepBar";
import { clearCourse } from "@/lib/storage";

const INSTRUCTOR_STEPS = ["Upload", "Seleção", "Edição", "Enviar"];

interface Coordenador {
  id: string;
  name: string;
}

export default function EnviarPage() {
  const router = useRouter();
  const { course, selectedLessons, clearAll } = useApp();

  const [coordenadores, setCoordenadores] = useState<Coordenador[]>([]);
  const [selectedCoordId, setSelectedCoordId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [enviado, setEnviado] = useState(false);

  useEffect(() => {
    fetch("/api/coordenadores")
      .then((r) => r.json())
      .then(setCoordenadores)
      .catch(() => setError("Não foi possível carregar a lista de coordenadores."));
  }, []);

  if (!course || selectedLessons.length === 0) {
    return (
      <main className="flex flex-1 items-center justify-center flex-col gap-4">
        <p className="text-alura-blue-light/60">Nenhuma atividade para enviar.</p>
        <button
          onClick={() => router.push("/")}
          className="text-alura-cyan text-sm hover:underline"
        >
          Voltar ao início
        </button>
      </main>
    );
  }

  const totalExercises = selectedLessons.reduce(
    (acc, l) => acc + l.exercises.length,
    0
  );

  async function handleEnviar() {
    if (!selectedCoordId) {
      setError("Selecione um coordenador.");
      return;
    }
    setError("");
    setLoading(true);

    const res = await fetch("/api/submissoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        coordinatorId: selectedCoordId,
        originalData: course,
        submittedData: { courseId: course!.courseId, lessons: selectedLessons },
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Erro ao enviar. Tente novamente.");
      return;
    }

    setEnviado(true);
    clearCourse();
    clearAll();
  }

  if (enviado) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16 max-w-lg mx-auto w-full text-center">
        <div className="text-4xl">✓</div>
        <h1 className="font-[family-name:var(--font-chakra-petch)] text-2xl font-bold text-alura-cyan">
          Enviado com sucesso!
        </h1>
        <p className="text-alura-blue-light/70 text-sm">
          O coordenador receberá sua seleção e poderá revisá-la pelo app.
        </p>
        <button
          onClick={() => router.push("/")}
          className="bg-alura-cyan hover:bg-alura-cyan/80 text-alura-blue-deep font-bold px-8 py-3 rounded-xl transition-colors"
        >
          Voltar ao início
        </button>
      </main>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <header className="sticky top-0 z-10 bg-alura-blue-deep border-b border-alura-blue-light/10 px-6 py-4 flex flex-col gap-3">
        <div>
          <p className="text-alura-blue-light/40 text-xs">{course.courseId}</p>
          <h1 className="font-[family-name:var(--font-chakra-petch)] font-bold text-alura-cyan text-lg leading-tight">
            Enviar para coordenador
          </h1>
        </div>
        <div className="max-w-lg mx-auto w-full">
          <StepBar steps={INSTRUCTOR_STEPS} current={4} />
        </div>
      </header>

      <main className="flex flex-1 flex-col px-6 py-10 max-w-lg mx-auto w-full gap-6">
        <p className="text-alura-blue-light/50 text-sm">
          {totalExercises} exercício{totalExercises !== 1 ? "s" : ""} de{" "}
          {selectedLessons.length} aula{selectedLessons.length !== 1 ? "s" : ""} prontos para envio.
        </p>

        <div className="bg-alura-blue-dark rounded-2xl border border-alura-blue-light/20 p-6 flex flex-col gap-4">
          <label className="text-sm font-medium text-alura-blue-light">
            Selecione o coordenador responsável
          </label>
          <select
            value={selectedCoordId}
            onChange={(e) => setSelectedCoordId(e.target.value)}
            className="w-full rounded-lg bg-alura-blue-deep border border-alura-blue-light/20 px-3 py-2 text-sm text-alura-blue-light focus:outline-none focus:border-alura-cyan"
          >
            <option value="">— escolha um coordenador —</option>
            {coordenadores.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            onClick={handleEnviar}
            disabled={loading || !selectedCoordId}
            className="bg-alura-cyan hover:bg-alura-cyan/80 disabled:opacity-50 text-alura-blue-deep font-bold py-3 rounded-xl transition-colors text-sm"
          >
            {loading ? "Enviando..." : "Enviar seleção"}
          </button>
        </div>
      </main>

      <footer className="sticky bottom-0 bg-alura-blue-dark border-t border-alura-blue-light/10 px-6 py-4">
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => router.push("/review")}
            className="border border-alura-blue-light/20 hover:border-alura-blue-light/40 text-alura-blue-light/60 hover:text-alura-blue-light font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
          >
            ← Voltar para edição
          </button>
        </div>
      </footer>
    </div>
  );
}
