"use client";

import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { LessonAccordion } from "@/components/LessonAccordion";
import { clearCourse } from "@/lib/storage";

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
      <header className="sticky top-0 z-10 bg-alura-blue-deep border-b border-alura-blue-light/10 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-chakra-petch)] font-bold text-alura-cyan text-lg">
            {course.courseId}
          </h1>
          <p className="text-alura-blue-light/50 text-xs">
            {isInstructor ? "Revise e edite os exercícios selecionados" : "Visualização (somente leitura)"}
          </p>
        </div>
        <button
          onClick={handleClear}
          className="text-red-400 hover:text-red-300 text-sm transition-colors"
        >
          🗑 Limpar
        </button>
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
          <div className="max-w-3xl mx-auto flex justify-end">
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
