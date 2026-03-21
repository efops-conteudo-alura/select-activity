"use client";

import type { Alternative, Exercise, Lesson } from "@/types/course";

type Props = {
  lesson: Lesson;
  exercise: Exercise;
  selectable?: boolean;
  onToggle?: (lesson: Lesson, exercise: Exercise) => void;
  readOnly?: boolean;
  // Modo edição inline (instrutor em /review)
  editable?: boolean;
  // Modo edição por exercício (coordenador em /submissoes/[id])
  isEditing?: boolean;
  onEditToggle?: (exerciseId: string) => void;
  // Restaurar exercício não selecionado (coordenador)
  onRestore?: (lessonNumber: number, exercise: Exercise) => void;
  comment?: string;
  onCommentChange?: (lessonNumber: number, exerciseId: string, comment: string) => void;
  onExerciseChange?: (lessonNumber: number, exerciseId: string, changes: Partial<Exercise>) => void;
  onAlternativeChange?: (lessonNumber: number, exerciseId: string, altIndex: number, changes: Partial<Alternative>) => void;
  // Para diff: exercício original antes das edições do instrutor
  originalExercise?: Exercise;
};

export function ExerciseCard({
  lesson,
  exercise,
  selectable = false,
  onToggle,
  readOnly = false,
  editable = false,
  isEditing = false,
  onEditToggle,
  onRestore,
  comment,
  onCommentChange,
  onExerciseChange,
  onAlternativeChange,
  originalExercise,
}: Props) {
  // Coordenador está no modo de edição por exercício
  const showEditableInputs = editable || isEditing;

  return (
    <div className={`rounded-xl border p-4 flex flex-col gap-3 ${
      isEditing
        ? "bg-alura-blue-dark/60 border-alura-cyan/30"
        : "bg-alura-blue-dark/40 border-alura-blue-light/20"
    }`}>
      {/* Título e enunciado — modo seleção */}
      {selectable && (
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={exercise.isSelected ?? false}
            onChange={() => onToggle?.(lesson, exercise)}
            className="mt-1 w-4 h-4 accent-alura-cyan shrink-0"
          />
          <div className="flex-1 flex flex-col gap-1">
            <p className="font-semibold text-alura-blue-light">{exercise.title}</p>
            <p className="text-sm text-alura-blue-light/70">{exercise.text}</p>
          </div>
        </label>
      )}

      {/* Título e enunciado — modo edição (inputs) */}
      {!selectable && showEditableInputs && (
        <div className="flex flex-col gap-2">
          <label className="text-xs text-alura-blue-light/50 uppercase tracking-wide">Título</label>
          <textarea
            rows={1}
            value={exercise.title}
            onChange={(e) =>
              onExerciseChange?.(lesson.lessonNumber, exercise.id, { title: e.target.value })
            }
            className="w-full rounded-lg bg-alura-blue-deep border border-alura-blue-light/20 px-3 py-2 text-sm font-semibold text-alura-blue-light focus:outline-none focus:border-alura-cyan resize-none"
          />
          <label className="text-xs text-alura-blue-light/50 uppercase tracking-wide">Enunciado</label>
          <textarea
            rows={3}
            value={exercise.text}
            onChange={(e) =>
              onExerciseChange?.(lesson.lessonNumber, exercise.id, { text: e.target.value })
            }
            className="w-full rounded-lg bg-alura-blue-deep border border-alura-blue-light/20 px-3 py-2 text-sm text-alura-blue-light/70 focus:outline-none focus:border-alura-cyan resize-none"
          />
        </div>
      )}

      {/* Título e enunciado — modo leitura (com diff opcional) */}
      {!selectable && !showEditableInputs && (
        <div className="flex flex-col gap-1">
          {originalExercise && originalExercise.title !== exercise.title && (
            <p className="text-xs line-through text-red-400/70">{originalExercise.title}</p>
          )}
          <p className="font-semibold text-alura-blue-light">{exercise.title}</p>
          {originalExercise && originalExercise.text !== exercise.text && (
            <p className="text-xs line-through text-red-400/70 mt-1">{originalExercise.text}</p>
          )}
          <p className="text-sm text-alura-blue-light/70 mt-1">{exercise.text}</p>
        </div>
      )}

      {/* Alternativas */}
      <div className="flex flex-col gap-1 pl-1">
        {exercise.alternatives.map((alt, i) => {
          const origAlt = originalExercise?.alternatives[i];
          const textChanged = origAlt && origAlt.text !== alt.text;
          const opinionChanged = origAlt && origAlt.opinion !== alt.opinion;
          const correctChanged = origAlt && origAlt.correct !== alt.correct;

          if (showEditableInputs) {
            return (
              <div
                key={i}
                className="flex flex-col gap-1 py-2 px-2 rounded-lg border border-alura-blue-light/10 bg-alura-blue-deep/30"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${exercise.id}`}
                    checked={alt.correct}
                    onChange={() =>
                      onAlternativeChange?.(lesson.lessonNumber, exercise.id, i, { correct: true })
                    }
                    className="accent-alura-cyan shrink-0"
                  />
                  <input
                    type="text"
                    value={alt.text}
                    onChange={(e) =>
                      onAlternativeChange?.(lesson.lessonNumber, exercise.id, i, { text: e.target.value })
                    }
                    className={`flex-1 rounded bg-alura-blue-deep border px-2 py-1 text-sm focus:outline-none focus:border-alura-cyan ${
                      alt.correct
                        ? "border-alura-cyan/40 text-alura-cyan"
                        : "border-alura-blue-light/20 text-alura-blue-light/70"
                    }`}
                  />
                  {alt.correct && (
                    <span className="text-xs font-semibold text-alura-cyan shrink-0">correta</span>
                  )}
                </div>
                <input
                  type="text"
                  value={alt.opinion}
                  onChange={(e) =>
                    onAlternativeChange?.(lesson.lessonNumber, exercise.id, i, { opinion: e.target.value })
                  }
                  placeholder="Feedback da alternativa..."
                  className="rounded bg-alura-blue-deep border border-alura-blue-light/10 px-2 py-1 text-xs text-alura-blue-light/50 placeholder:text-alura-blue-light/20 focus:outline-none focus:border-alura-cyan"
                />
              </div>
            );
          }

          return (
            <div
              key={i}
              className={`flex flex-col gap-0.5 text-sm py-1 px-2 rounded-lg ${
                alt.correct ? "bg-alura-cyan/10 text-alura-cyan" : "text-alura-blue-light/60"
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="shrink-0 mt-0.5">{alt.correct ? "✓" : "○"}</span>
                <div className="flex-1">
                  {textChanged && (
                    <p className="text-xs line-through text-red-400/70">{origAlt!.text}</p>
                  )}
                  <span>{alt.text}</span>
                  {correctChanged && (
                    <span className="ml-2 text-xs text-yellow-400">
                      {alt.correct
                        ? "(marcada como correta pelo instrutor)"
                        : "(desmarcada pelo instrutor)"}
                    </span>
                  )}
                </div>
                {alt.correct && (
                  <span className="ml-auto text-xs font-semibold text-alura-cyan shrink-0">
                    correta
                  </span>
                )}
              </div>
              {opinionChanged && (
                <p className="text-xs line-through text-red-400/70 pl-5">{origAlt!.opinion}</p>
              )}
              {alt.opinion && (
                <p className="text-xs text-alura-blue-light/40 pl-5">{alt.opinion}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Comentário — editável (instrutor em /review) */}
      {onCommentChange !== undefined && (
        <div className="flex flex-col gap-1">
          <label className="text-xs text-alura-blue-light/60">Comentário opcional</label>
          <textarea
            rows={2}
            disabled={readOnly}
            value={comment ?? ""}
            onChange={(e) =>
              onCommentChange(lesson.lessonNumber, exercise.id, e.target.value)
            }
            placeholder={readOnly ? "" : "Adicione uma observação..."}
            className="w-full rounded-lg bg-alura-blue-deep border border-alura-blue-light/20 px-3 py-2 text-sm text-alura-blue-light placeholder:text-alura-blue-light/30 focus:outline-none focus:border-alura-cyan resize-none disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      )}

      {/* Comentário do instrutor + diff (modo leitura, para coordenador) */}
      {!showEditableInputs && !onCommentChange && (
        <>
          {originalExercise && !originalExercise.comment && exercise.comment && (
            <div className="flex flex-col gap-1">
              <label className="text-xs text-alura-cyan/70">Comentário adicionado pelo instrutor</label>
              <p className="text-sm text-alura-blue-light/70 bg-alura-cyan/5 rounded-lg px-3 py-2 border border-alura-cyan/20">
                {exercise.comment}
              </p>
            </div>
          )}
          {originalExercise && originalExercise.comment && originalExercise.comment !== exercise.comment && (
            <div className="flex flex-col gap-1">
              <label className="text-xs text-alura-blue-light/60">Comentário (editado pelo instrutor)</label>
              <p className="text-xs line-through text-red-400/70 bg-alura-blue-deep/50 rounded px-3 py-1">
                {originalExercise.comment}
              </p>
              <p className="text-sm text-alura-blue-light/70 bg-alura-blue-deep/50 rounded-lg px-3 py-2 border border-alura-blue-light/10">
                {exercise.comment}
              </p>
            </div>
          )}
          {!originalExercise && exercise.comment && (
            <div className="flex flex-col gap-1">
              <label className="text-xs text-alura-blue-light/60">Comentário do instrutor</label>
              <p className="text-sm text-alura-blue-light/70 bg-alura-blue-deep/50 rounded-lg px-3 py-2 border border-alura-blue-light/10">
                {exercise.comment}
              </p>
            </div>
          )}
        </>
      )}

      {/* Botões de ação do coordenador */}
      {onEditToggle && (
        <div className="flex justify-end pt-1">
          <button
            onClick={() => onEditToggle(exercise.id)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
              isEditing
                ? "bg-alura-cyan/20 text-alura-cyan hover:bg-alura-cyan/30"
                : "bg-alura-blue-light/10 text-alura-blue-light/60 hover:text-alura-blue-light hover:bg-alura-blue-light/20"
            }`}
          >
            {isEditing ? "✓ Concluir edição" : "Editar"}
          </button>
        </div>
      )}

      {/* Botão restaurar (exercício não selecionado) */}
      {onRestore && (
        <div className="flex justify-end pt-1">
          <button
            onClick={() => onRestore(lesson.lessonNumber, exercise)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-alura-cyan/10 text-alura-cyan hover:bg-alura-cyan/20 transition-colors"
          >
            + Incluir na seleção
          </button>
        </div>
      )}
    </div>
  );
}
