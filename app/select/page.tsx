"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { LessonAccordion } from "@/components/LessonAccordion";
import { StepBar } from "@/components/StepBar";

const INSTRUCTOR_STEPS = ["Upload", "Seleção", "Edição", "Enviar"];

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
      <header className="sticky top-0 z-10 bg-alura-blue-deep border-b border-alura-blue-light/10 px-6 py-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-alura-blue-light/40 text-xs">{course.courseId}</p>
            <h1 className="font-[family-name:var(--font-chakra-petch)] font-bold text-alura-cyan text-lg leading-tight">
              Seleção de atividades
            </h1>
          </div>
          <button
            onClick={handleClear}
            className="text-red-400 hover:text-red-300 text-sm transition-colors"
          >
            🗑 Limpar
          </button>
        </div>
        <div className="max-w-lg mx-auto w-full">
          <StepBar steps={INSTRUCTOR_STEPS} current={2} />
        </div>
      </header>

      <main className="flex flex-col gap-4 px-6 py-6 max-w-3xl mx-auto w-full flex-1">
        <p className="text-alura-blue-light/70 text-sm">
          Selecione ao menos uma atividade por aula.{" "}
          <span className="text-alura-blue-light/40">Você poderá editá-las no próximo passo.</span>
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
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/upload")}
              className="border border-alura-blue-light/20 hover:border-alura-blue-light/40 text-alura-blue-light/60 hover:text-alura-blue-light font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
            >
              ← Voltar
            </button>
            <button
              onClick={handleNext}
              className="bg-alura-cyan hover:bg-alura-cyan/80 text-alura-blue-deep font-bold px-8 py-3 rounded-xl transition-colors"
            >
              Próximo →
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
