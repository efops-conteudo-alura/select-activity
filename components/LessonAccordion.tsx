"use client";

import { useState } from "react";
import type { Alternative, Exercise, Lesson } from "@/types/course";
import { ExerciseCard } from "./ExerciseCard";

type Props = {
  lesson: Lesson;
  selectable?: boolean;
  onToggle?: (lesson: Lesson, exercise: Exercise) => void;
  readOnly?: boolean;
  editable?: boolean;
  // comments keyed by exercise.id
  comments?: Record<string, string>;
  onCommentChange?: (lessonNumber: number, exerciseId: string, comment: string) => void;
  onExerciseChange?: (lessonNumber: number, exerciseId: string, changes: Partial<Exercise>) => void;
  onAlternativeChange?: (lessonNumber: number, exerciseId: string, altIndex: number, changes: Partial<Alternative>) => void;
  // Para diff e edição por exercício (coordenador)
  originalLesson?: Lesson;
  editingExerciseId?: string | null;
  onEditToggle?: (exerciseId: string) => void;
  onRestore?: (lessonNumber: number, exercise: Exercise) => void;
  defaultOpen?: boolean;
};

export function LessonAccordion({
  lesson,
  selectable = false,
  onToggle,
  readOnly = false,
  editable = false,
  comments,
  onCommentChange,
  onExerciseChange,
  onAlternativeChange,
  originalLesson,
  editingExerciseId,
  onEditToggle,
  onRestore,
  defaultOpen = false,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border border-alura-blue-light/20 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 bg-alura-blue-dark/60 hover:bg-alura-blue-dark/80 transition-colors text-left"
      >
        <span className="font-[family-name:var(--font-chakra-petch)] font-bold text-alura-cyan">
          Aula {lesson.lessonNumber}
        </span>
        <span className="text-alura-blue-light/60 text-lg">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="flex flex-col gap-3 p-4 bg-alura-blue-deep/60">
          {lesson.exercises.map((exercise) => {
            const origExercise = originalLesson?.exercises.find((e) => e.id === exercise.id);
            return (
              <ExerciseCard
                key={exercise.id}
                lesson={lesson}
                exercise={exercise}
                selectable={selectable}
                onToggle={onToggle}
                readOnly={readOnly}
                editable={editable}
                isEditing={editingExerciseId === exercise.id}
                onEditToggle={onEditToggle}
                onRestore={onRestore}
                comment={comments?.[exercise.id]}
                onCommentChange={onCommentChange}
                onExerciseChange={onExerciseChange}
                onAlternativeChange={onAlternativeChange}
                originalExercise={origExercise}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
