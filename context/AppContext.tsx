"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { Alternative, Course, Exercise, Lesson, PersonType } from "@/types/course";

type AppState = {
  personType: PersonType | null;
  course: Course | null;
  selectedLessons: Lesson[];
  setPersonType: (type: PersonType) => void;
  setCourse: (course: Course) => void;
  toggleExercise: (lesson: Lesson, exercise: Exercise) => void;
  updateComment: (lessonNumber: number, exerciseId: string, comment: string) => void;
  updateExercise: (lessonNumber: number, exerciseId: string, changes: Partial<Exercise>) => void;
  updateAlternative: (lessonNumber: number, exerciseId: string, altIndex: number, changes: Partial<Alternative>) => void;
  clearAll: () => void;
};

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [personType, setPersonType] = useState<PersonType | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [selectedLessons, setSelectedLessons] = useState<Lesson[]>([]);

  const toggleExercise = useCallback(
    (lesson: Lesson, exercise: Exercise) => {
      const isNowSelected = !exercise.isSelected;

      // Fix Issue #5: não mutar o objeto direto — criar novo objeto
      const updatedExercise: Exercise = { ...exercise, isSelected: isNowSelected };

      // Atualizar isSelected no objeto original para o checkbox refletir
      exercise.isSelected = isNowSelected;

      setSelectedLessons((prev) => {
        const lessonIndex = prev.findIndex(
          (l) => l.lessonNumber === lesson.lessonNumber
        );

        if (isNowSelected) {
          if (lessonIndex !== -1) {
            const updated = [...prev];
            updated[lessonIndex] = {
              ...updated[lessonIndex],
              exercises: [...updated[lessonIndex].exercises, updatedExercise],
            };
            return updated;
          } else {
            return [
              ...prev,
              { lessonNumber: lesson.lessonNumber, exercises: [updatedExercise] },
            ];
          }
        } else {
          if (lessonIndex === -1) return prev;
          // Fix Issue #6: comparar por id, não por title
          const updatedExercises = prev[lessonIndex].exercises.filter(
            (e) => e.id !== exercise.id
          );
          if (updatedExercises.length === 0) {
            return prev.filter((_, i) => i !== lessonIndex);
          }
          const updated = [...prev];
          updated[lessonIndex] = {
            ...updated[lessonIndex],
            exercises: updatedExercises,
          };
          return updated;
        }
      });
    },
    []
  );

  const updateComment = useCallback(
    (lessonNumber: number, exerciseId: string, comment: string) => {
      setSelectedLessons((prev) =>
        prev.map((lesson) => {
          if (lesson.lessonNumber !== lessonNumber) return lesson;
          return {
            ...lesson,
            // Fix Issue #6: comparar por id, não por title
            exercises: lesson.exercises.map((ex) =>
              ex.id === exerciseId ? { ...ex, comment } : ex
            ),
          };
        })
      );
    },
    []
  );

  const updateExercise = useCallback(
    (lessonNumber: number, exerciseId: string, changes: Partial<Exercise>) => {
      setSelectedLessons((prev) =>
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
    },
    []
  );

  const updateAlternative = useCallback(
    (lessonNumber: number, exerciseId: string, altIndex: number, changes: Partial<Alternative>) => {
      setSelectedLessons((prev) =>
        prev.map((lesson) => {
          if (lesson.lessonNumber !== lessonNumber) return lesson;
          return {
            ...lesson,
            exercises: lesson.exercises.map((ex) => {
              if (ex.id !== exerciseId) return ex;
              const updatedAlternatives = ex.alternatives.map((alt, i) => {
                // Se estamos marcando uma alternativa como correta,
                // desmarcar todas as outras automaticamente
                if (changes.correct === true && i !== altIndex) {
                  return { ...alt, correct: false };
                }
                if (i === altIndex) return { ...alt, ...changes };
                return alt;
              });
              return { ...ex, alternatives: updatedAlternatives };
            }),
          };
        })
      );
    },
    []
  );

  const clearAll = useCallback(() => {
    setCourse(null);
    setSelectedLessons([]);
    setPersonType(null);
  }, []);

  return (
    <AppContext.Provider
      value={{
        personType,
        course,
        selectedLessons,
        setPersonType,
        setCourse,
        toggleExercise,
        updateComment,
        updateExercise,
        updateAlternative,
        clearAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp deve ser usado dentro de AppProvider");
  return ctx;
}
