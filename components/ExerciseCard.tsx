"use client";

import type { Exercise, Lesson } from "@/types/course";

type Props = {
  lesson: Lesson;
  exercise: Exercise;
  selectable?: boolean;
  onToggle?: (lesson: Lesson, exercise: Exercise) => void;
  readOnly?: boolean;
  comment?: string;
  onCommentChange?: (lessonNumber: number, exerciseTitle: string, comment: string) => void;
};

export function ExerciseCard({
  lesson,
  exercise,
  selectable = false,
  onToggle,
  readOnly = false,
  comment,
  onCommentChange,
}: Props) {
  return (
    <div className="bg-alura-blue-dark/40 rounded-xl border border-alura-blue-light/20 p-4 flex flex-col gap-3">
      {selectable && (
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={exercise.isSelected ?? false}
            onChange={() => onToggle?.(lesson, exercise)}
            className="mt-1 w-4 h-4 accent-alura-cyan shrink-0"
          />
          <div>
            <p className="font-semibold text-alura-blue-light">{exercise.title}</p>
            <p className="text-sm text-alura-blue-light/70 mt-1">{exercise.text}</p>
          </div>
        </label>
      )}

      {!selectable && (
        <div>
          <p className="font-semibold text-alura-blue-light">{exercise.title}</p>
          <p className="text-sm text-alura-blue-light/70 mt-1">{exercise.text}</p>
        </div>
      )}

      <div className="flex flex-col gap-1 pl-1">
        {exercise.alternatives.map((alt, i) => (
          <div
            key={i}
            className={`flex items-start gap-2 text-sm py-1 px-2 rounded-lg ${
              alt.correct ? "bg-alura-cyan/10 text-alura-cyan" : "text-alura-blue-light/60"
            }`}
          >
            <span className="shrink-0">{alt.correct ? "✓" : "○"}</span>
            <span>{alt.text}</span>
            {alt.correct && (
              <span className="ml-auto text-xs font-semibold text-alura-cyan shrink-0">
                correta
              </span>
            )}
          </div>
        ))}
      </div>

      {onCommentChange !== undefined && (
        <div className="flex flex-col gap-1">
          <label className="text-xs text-alura-blue-light/60">Comentário opcional</label>
          <textarea
            rows={2}
            disabled={readOnly}
            value={comment ?? ""}
            onChange={(e) =>
              onCommentChange(lesson.lessonNumber, exercise.title, e.target.value)
            }
            placeholder={readOnly ? "" : "Adicione uma observação..."}
            className="w-full rounded-lg bg-alura-blue-deep border border-alura-blue-light/20 px-3 py-2 text-sm text-alura-blue-light placeholder:text-alura-blue-light/30 focus:outline-none focus:border-alura-cyan resize-none disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      )}
    </div>
  );
}
