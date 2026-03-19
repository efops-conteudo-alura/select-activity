"use client";

import { useState } from "react";
import type { Exercise, Lesson } from "@/types/course";
import { ExerciseCard } from "./ExerciseCard";

type Props = {
  lesson: Lesson;
  selectable?: boolean;
  onToggle?: (lesson: Lesson, exercise: Exercise) => void;
  readOnly?: boolean;
  comments?: Record<string, string>;
  onCommentChange?: (lessonNumber: number, exerciseTitle: string, comment: string) => void;
  defaultOpen?: boolean;
};

export function LessonAccordion({
  lesson,
  selectable = false,
  onToggle,
  readOnly = false,
  comments,
  onCommentChange,
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
          {lesson.exercises.map((exercise, i) => (
            <ExerciseCard
              key={i}
              lesson={lesson}
              exercise={exercise}
              selectable={selectable}
              onToggle={onToggle}
              readOnly={readOnly}
              comment={comments?.[exercise.title]}
              onCommentChange={onCommentChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
