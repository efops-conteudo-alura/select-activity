"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { LessonAccordion } from "@/components/LessonAccordion";

export default function SelectPage() {
  const router = useRouter();
  const { course, selectedLessons, toggleExercise, clearAll } = useApp();
  const [validationError, setValidationError] = useState(false);

  if (!course) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-alura-blue-light/60">Nenhum curso carregado.</p>
      </main>
    );
  }

  function handleNext() {
    if (!course) return;
    const allLessonsCovered = course.lessons.every((lesson) =>
      selectedLessons.some((sl) => sl.lessonNumber === lesson.lessonNumber)
    );
    if (!allLessonsCovered) {
      setValidationError(true);
      return;
    }
    setValidationError(false);
    router.push("/review");
  }

  function handleClear() {
    clearAll();
    router.push("/");
  }

  const totalSelected = selectedLessons.reduce(
    (acc, l) => acc + l.exercises.length,
    0
  );

  return (
    <div className="flex flex-col flex-1">
      <header className="sticky top-0 z-10 bg-alura-blue-deep border-b border-alura-blue-light/10 px-6 py-4 flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-chakra-petch)] font-bold text-alura-cyan text-lg">
          {course.courseId}
        </h1>
        <button
          onClick={handleClear}
          className="text-red-400 hover:text-red-300 text-sm transition-colors"
        >
          🗑 Limpar
        </button>
      </header>

      <main className="flex flex-col gap-4 px-6 py-6 max-w-3xl mx-auto w-full flex-1">
        <p className="text-alura-blue-light/70 text-sm">
          Selecione ao menos uma atividade por aula.
        </p>

        {course.lessons.map((lesson) => (
          <LessonAccordion
            key={lesson.lessonNumber}
            lesson={lesson}
            selectable
            onToggle={toggleExercise}
          />
        ))}
      </main>

      <footer className="sticky bottom-0 bg-alura-blue-dark border-t border-alura-blue-light/10 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-alura-blue-light/60 text-xs">Selecionadas</span>
            <span className="text-alura-cyan font-bold">
              {totalSelected} atividade{totalSelected !== 1 ? "s" : ""}
            </span>
            {validationError && (
              <span className="text-red-400 text-xs mt-1">
                Selecione ao menos uma atividade por aula!
              </span>
            )}
          </div>
          <button
            onClick={handleNext}
            className="bg-alura-blue hover:bg-alura-blue/80 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            Próximo →
          </button>
        </div>
      </footer>
    </div>
  );
}
