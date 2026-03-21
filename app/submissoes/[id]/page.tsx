"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { LessonAccordion } from "@/components/LessonAccordion";
import { exportSelectedCourse } from "@/lib/export";
import type { Course, Lesson } from "@/types/course";

interface SubmissionDetail {
  id: string;
  courseId: string;
  status: string;
  instructor: { name: string; email: string };
  originalData: Course;
  submittedData: { courseId: string; lessons: Lesson[] };
  createdAt: string;
}

export default function SubmissaoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // submittedData editável pelo coordenador
  const [editedLessons, setEditedLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    fetch(`/api/submissoes/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setSubmission(data);
        setEditedLessons(data.submittedData?.lessons ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  async function handleExport() {
    if (!submission) return;
    setExporting(true);

    const courseToExport: Course = {
      courseId: submission.courseId,
      lessons: editedLessons,
    };

    exportSelectedCourse(courseToExport, editedLessons);

    // Marcar como exportado no banco
    await fetch(`/api/submissoes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "exported", submittedData: { courseId: submission.courseId, lessons: editedLessons } }),
    });

    setSubmission((prev) => prev ? { ...prev, status: "exported" } : prev);
    setExporting(false);
  }

  function handleExerciseChange(lessonNumber: number, exerciseId: string, changes: Partial<import("@/types/course").Exercise>) {
    setEditedLessons((prev) =>
      prev.map((lesson) => {
        if (lesson.lessonNumber !== lessonNumber) return lesson;
        return {
          ...lesson,
          exercises: lesson.exercises.map((ex) =>
            ex.id === exerciseId ? { ...ex, ...changes } : ex
          ),
        };
      })
    );
  }

  function handleAlternativeChange(
    lessonNumber: number,
    exerciseId: string,
    altIndex: number,
    changes: Partial<import("@/types/course").Alternative>
  ) {
    setEditedLessons((prev) =>
      prev.map((lesson) => {
        if (lesson.lessonNumber !== lessonNumber) return lesson;
        return {
          ...lesson,
          exercises: lesson.exercises.map((ex) => {
            if (ex.id !== exerciseId) return ex;
            const updatedAlternatives = ex.alternatives.map((alt, i) => {
              if (changes.correct === true && i !== altIndex) return { ...alt, correct: false };
              if (i === altIndex) return { ...alt, ...changes };
              return alt;
            });
            return { ...ex, alternatives: updatedAlternatives };
          }),
        };
      })
    );
  }

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-alura-blue-light/40 text-sm">Carregando...</p>
      </main>
    );
  }

  if (!submission) {
    return (
      <main className="flex flex-1 items-center justify-center flex-col gap-4">
        <p className="text-alura-blue-light/60">Submissão não encontrada.</p>
        <button onClick={() => router.push("/submissoes")} className="text-alura-cyan text-sm hover:underline">
          Voltar
        </button>
      </main>
    );
  }

  // Montar mapa de exercícios originais por ID para diff
  const originalExercisesById: Record<string, import("@/types/course").Exercise> = {};
  submission.originalData.lessons.forEach((lesson) => {
    lesson.exercises.forEach((ex) => {
      originalExercisesById[ex.id] = ex;
    });
  });

  // Montar originalLesson por lessonNumber para passar ao accordion
  const originalLessonsByNumber: Record<number, Lesson> = {};
  submission.originalData.lessons.forEach((lesson) => {
    originalLessonsByNumber[lesson.lessonNumber] = lesson;
  });

  // IDs de exercícios selecionados pelo instrutor
  const selectedIds = new Set(
    editedLessons.flatMap((l) => l.exercises.map((e) => e.id))
  );

  // Aulas do original que NÃO foram selecionadas (ou parcialmente selecionadas)
  const originalLessons = submission.originalData.lessons;

  return (
    <div className="flex flex-col flex-1">
      <header className="sticky top-0 z-10 bg-alura-blue-deep border-b border-alura-blue-light/10 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-chakra-petch)] font-bold text-alura-cyan text-lg">
            {submission.courseId}
          </h1>
          <p className="text-alura-blue-light/50 text-xs">
            Instrutor: {submission.instructor.name} ·{" "}
            {new Date(submission.createdAt).toLocaleDateString("pt-BR")}
            {submission.status === "exported" && (
              <span className="ml-2 text-green-400">· exportado</span>
            )}
          </p>
        </div>
        <button
          onClick={() => router.push("/submissoes")}
          className="text-alura-blue-light/50 hover:text-alura-blue-light text-sm transition-colors"
        >
          ← Voltar
        </button>
      </header>

      <main className="flex flex-col gap-6 px-6 py-6 max-w-3xl mx-auto w-full flex-1">
        {/* Legenda do diff */}
        <div className="flex flex-wrap gap-4 text-xs text-alura-blue-light/50">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-alura-cyan/60 inline-block"></span>
            exercício selecionado pelo instrutor
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-alura-blue-light/20 inline-block"></span>
            não selecionado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-400/60 inline-block"></span>
            texto original (riscado = alterado)
          </span>
        </div>

        {/* Aulas selecionadas pelo instrutor (editáveis pelo coordenador) */}
        {editedLessons.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-xs font-semibold text-alura-blue-light/60 uppercase tracking-wide">
              Exercícios selecionados pelo instrutor
            </h2>
            {editedLessons.map((lesson) => (
              <LessonAccordion
                key={lesson.lessonNumber}
                lesson={lesson}
                editable
                onExerciseChange={handleExerciseChange}
                onAlternativeChange={handleAlternativeChange}
                originalLesson={originalLessonsByNumber[lesson.lessonNumber]}
                defaultOpen
              />
            ))}
          </section>
        )}

        {/* Exercícios NÃO selecionados — para referência */}
        {originalLessons.some((l) =>
          l.exercises.some((ex) => !selectedIds.has(ex.id))
        ) && (
          <section className="flex flex-col gap-3">
            <h2 className="text-xs font-semibold text-alura-blue-light/40 uppercase tracking-wide">
              Não selecionados pelo instrutor
            </h2>
            {originalLessons.map((lesson) => {
              const notSelected = {
                ...lesson,
                exercises: lesson.exercises.filter((ex) => !selectedIds.has(ex.id)),
              };
              if (notSelected.exercises.length === 0) return null;
              return (
                <div key={lesson.lessonNumber} className="opacity-40">
                  <LessonAccordion
                    lesson={notSelected}
                    readOnly
                    defaultOpen={false}
                  />
                </div>
              );
            })}
          </section>
        )}
      </main>

      <footer className="sticky bottom-0 bg-alura-blue-dark border-t border-alura-blue-light/10 px-6 py-4">
        <div className="max-w-3xl mx-auto flex justify-end">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="bg-alura-cyan hover:bg-alura-cyan/80 disabled:opacity-50 text-alura-blue-deep font-bold px-8 py-3 rounded-xl transition-colors"
          >
            {exporting ? "Exportando..." : "⬇ Exportar JSON"}
          </button>
        </div>
      </footer>
    </div>
  );
}
