"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DropZone } from "@/components/DropZone";
import { StepBar } from "@/components/StepBar";
import type { Course } from "@/types/course";

const STEPS = ["Upload", "Instrutor", "Enviado"];

interface Instructor {
  id: string;
  name: string;
  email: string;
}

export default function UploadPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [course, setCourse] = useState<Course | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [selectedInstructorId, setSelectedInstructorId] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch("/api/instrutores")
      .then((r) => r.json())
      .then((data) => setInstructors(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  function handleFile(content: string) {
    setError(null);
    try {
      const parsed: Course = JSON.parse(content);
      if (!parsed.courseId || !Array.isArray(parsed.lessons)) {
        setError("O arquivo JSON não tem o formato esperado (courseId + lessons).");
        return;
      }

      // Gerar IDs únicos para cada exercício (necessário para edição e diff)
      const courseWithIds: Course = {
        ...parsed,
        lessons: parsed.lessons.map((lesson) => ({
          ...lesson,
          exercises: lesson.exercises.map((ex) => ({
            ...ex,
            id: ex.id ?? crypto.randomUUID(),
          })),
        })),
      };

      setCourse(courseWithIds);
      setStep(2);
    } catch {
      setError("Não foi possível ler o arquivo JSON.");
    }
  }

  async function handleSend() {
    if (!course || !selectedInstructorId) return;
    setSending(true);
    setError(null);

    try {
      const res = await fetch("/api/submissoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instructorId: selectedInstructorId, originalData: course }),
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.error ?? "Erro ao criar tarefa.");
        setSending(false);
        return;
      }

      setStep(3);
    } catch {
      setError("Erro de conexão. Tente novamente.");
      setSending(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16 max-w-lg mx-auto w-full">
      <div className="w-full">
        <StepBar steps={STEPS} current={step} />
      </div>

      {/* Step 1: Upload */}
      {step === 1 && (
        <>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="font-[family-name:var(--font-chakra-petch)] text-3xl font-bold text-alura-cyan">
              Upload do arquivo
            </h1>
            <p className="text-alura-blue-light/70">
              Faça upload do arquivo JSON com todas as atividades do curso.
            </p>
          </div>

          <div className="w-full">
            <DropZone onFile={handleFile} onError={setError} />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center bg-red-400/10 px-4 py-3 rounded-lg w-full">
              {error}
            </p>
          )}

          <button
            onClick={() => router.push("/submissoes")}
            className="text-alura-blue-light/50 text-sm hover:text-alura-blue-light transition-colors"
          >
            ← Voltar
          </button>
        </>
      )}

      {/* Step 2: Selecionar instrutor */}
      {step === 2 && course && (
        <>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="font-[family-name:var(--font-chakra-petch)] text-3xl font-bold text-alura-cyan">
              Selecionar instrutor
            </h1>
            <p className="text-alura-blue-light/70">
              Curso: <span className="text-alura-blue-light">{course.courseId}</span>
            </p>
            <p className="text-alura-blue-light/50 text-sm">
              {course.lessons.length} aula{course.lessons.length !== 1 ? "s" : ""} ·{" "}
              {course.lessons.reduce((acc, l) => acc + l.exercises.length, 0)} exercícios
            </p>
          </div>

          <div className="w-full flex flex-col gap-3">
            <label className="text-alura-blue-light/70 text-sm">
              Quem vai revisar este curso?
            </label>
            <select
              value={selectedInstructorId}
              onChange={(e) => setSelectedInstructorId(e.target.value)}
              className="w-full bg-alura-blue-dark border border-alura-blue-light/20 rounded-xl px-4 py-3 text-alura-blue-light focus:outline-none focus:border-alura-cyan/50 transition-colors"
            >
              <option value="">Selecione um instrutor...</option>
              {instructors.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.name} — {inst.email}
                </option>
              ))}
            </select>

            {instructors.length === 0 && (
              <p className="text-alura-blue-light/40 text-xs">
                Nenhum instrutor cadastrado ainda.{" "}
                <a href="/instrutores" className="text-alura-cyan hover:underline">
                  Gerenciar instrutores →
                </a>
              </p>
            )}
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center bg-red-400/10 px-4 py-3 rounded-lg w-full">
              {error}
            </p>
          )}

          <div className="flex gap-3 w-full">
            <button
              onClick={() => { setStep(1); setError(null); }}
              className="flex-1 border border-alura-blue-light/20 hover:border-alura-blue-light/40 text-alura-blue-light/60 hover:text-alura-blue-light font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
            >
              ← Voltar
            </button>
            <button
              onClick={handleSend}
              disabled={!selectedInstructorId || sending}
              className="flex-1 bg-alura-cyan hover:bg-alura-cyan/80 disabled:opacity-50 text-alura-blue-deep font-bold px-8 py-3 rounded-xl transition-colors"
            >
              {sending ? "Enviando..." : "Enviar tarefa"}
            </button>
          </div>
        </>
      )}

      {/* Step 3: Sucesso */}
      {step === 3 && (
        <>
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center text-3xl">
              ✓
            </div>
            <h1 className="font-[family-name:var(--font-chakra-petch)] text-3xl font-bold text-alura-cyan">
              Tarefa enviada!
            </h1>
            <p className="text-alura-blue-light/70">
              O instrutor verá a tarefa ao entrar no app.
            </p>
          </div>

          <button
            onClick={() => router.push("/submissoes")}
            className="bg-alura-cyan hover:bg-alura-cyan/80 text-alura-blue-deep font-bold px-8 py-3 rounded-xl transition-colors"
          >
            Ver submissões
          </button>
        </>
      )}
    </main>
  );
}
