"use client";

import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { LessonAccordion } from "@/components/LessonAccordion";
import { StepBar } from "@/components/StepBar";
import { clearCourse } from "@/lib/storage";

const INSTRUCTOR_STEPS = ["Upload", "Seleção", "Edição", "Enviar"];

export default function ReviewPage() {
  const router = useRouter();
  const {
    course,
    personType,
    selectedLessons,
    updateComment,
    updateExercise,
    updateAlternative,
    clearAll,
  } = useApp();

  const isInstructor = personType === "instructor";

  const lessonsToShow = isInstructor ? selectedLessons : course?.lessons ?? [];

  if (!course || lessonsToShow.length === 0) {
    return (
      <main className="flex flex-1 items-center justify-center flex-col gap-4">
        <p className="text-alura-blue-light/60">Nenhuma atividade para exibir.</p>
        <button
          onClick={() => router.push("/")}
          className="text-alura-cyan text-sm hover:underline"
        >
          Voltar ao início
        </button>
      </main>
    );
  }

  function handleClear() {
    clearCourse();
    clearAll();
    router.push("/");
  }

  // comments keyed by exercise.id
  const comments: Record<string, string> = {};
  selectedLessons.forEach((lesson) => {
    lesson.exercises.forEach((ex) => {
      if (ex.comment) comments[ex.id] = ex.comment;
    });
  });

  return (
    <div className="flex flex-col flex-1">
      <header className="sticky top-0 z-10 bg-alura-blue-deep border-b border-alura-blue-light/10 px-6 py-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-alura-blue-light/40 text-xs">{course.courseId}</p>
            <h1 className="font-[family-name:var(--font-chakra-petch)] font-bold text-alura-cyan text-lg leading-tight">
              {isInstructor ? "Edição das atividades selecionadas" : "Visualização (somente leitura)"}
            </h1>
          </div>
          <button
            onClick={handleClear}
            className="text-red-400 hover:text-red-300 text-sm transition-colors"
          >
            🗑 Limpar
          </button>
        </div>
        {isInstructor && (
          <div className="max-w-lg mx-auto w-full">
            <StepBar steps={INSTRUCTOR_STEPS} current={3} />
          </div>
        )}
      </header>

      <main className="flex flex-col gap-4 px-6 py-6 max-w-3xl mx-auto w-full flex-1">
        {lessonsToShow.map((lesson) => (
          <LessonAccordion
            key={lesson.lessonNumber}
            lesson={lesson}
            readOnly={!isInstructor}
            editable={isInstructor}
            comments={isInstructor ? comments : undefined}
            onCommentChange={isInstructor ? updateComment : undefined}
            onExerciseChange={isInstructor ? updateExercise : undefined}
            onAlternativeChange={isInstructor ? updateAlternative : undefined}
            defaultOpen
          />
        ))}
      </main>

      {isInstructor && (
        <footer className="sticky bottom-0 bg-alura-blue-dark border-t border-alura-blue-light/10 px-6 py-4">
          <div className="max-w-3xl mx-auto flex justify-between">
            <button
              onClick={() => router.push("/select")}
              className="border border-alura-blue-light/20 hover:border-alura-blue-light/40 text-alura-blue-light/60 hover:text-alura-blue-light font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
            >
              ← Voltar para seleção
            </button>
            <button
              onClick={() => router.push("/enviar")}
              className="bg-alura-cyan hover:bg-alura-cyan/80 text-alura-blue-deep font-bold px-8 py-3 rounded-xl transition-colors"
            >
              Próximo →
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}
