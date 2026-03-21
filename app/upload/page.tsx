"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { DropZone } from "@/components/DropZone";
import { StepBar } from "@/components/StepBar";
import { saveCourse } from "@/lib/storage";
import type { Course } from "@/types/course";

const INSTRUCTOR_STEPS = ["Upload", "Seleção", "Edição", "Enviar"];

export default function UploadPage() {
  const router = useRouter();
  const { personType, setCourse } = useApp();
  const [error, setError] = useState<string | null>(null);

  function handleFile(content: string, _fileName: string) {
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

      saveCourse(JSON.stringify(courseWithIds));
      setCourse(courseWithIds);
      if (personType === "instructor") {
        router.push("/select");
      } else {
        router.push("/review");
      }
    } catch {
      setError("Não foi possível ler o arquivo JSON.");
    }
  }

  const label =
    personType === "instructor"
      ? "Faça upload do arquivo JSON com todas as atividades do curso."
      : "Faça upload do arquivo JSON com as atividades já selecionadas.";

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16 max-w-lg mx-auto w-full">
      {personType === "instructor" && (
        <StepBar steps={INSTRUCTOR_STEPS} current={1} />
      )}

      {personType === "coordinator" && (
        <div className="w-full bg-alura-blue-dark border border-alura-blue-light/20 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
          <p className="text-alura-blue-light/60 text-sm">
            Precisa adicionar um instrutor?
          </p>
          <Link
            href="/instrutores"
            className="text-alura-cyan text-sm font-medium hover:underline shrink-0"
          >
            Gerenciar instrutores →
          </Link>
        </div>
      )}

      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="font-[family-name:var(--font-chakra-petch)] text-3xl font-bold text-alura-cyan">
          Upload do arquivo
        </h1>
        <p className="text-alura-blue-light/70">{label}</p>
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
        onClick={() => router.back()}
        className="text-alura-blue-light/50 text-sm hover:text-alura-blue-light transition-colors"
      >
        ← Voltar
      </button>
    </main>
  );
}
