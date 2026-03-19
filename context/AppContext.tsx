"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { Course, Exercise, Lesson, PersonType } from "@/types/course";

type AppState = {
  personType: PersonType | null;
  course: Course | null;
  selectedLessons: Lesson[];
  setPersonType: (type: PersonType) => void;
  setCourse: (course: Course) => void;
  toggleExercise: (lesson: Lesson, exercise: Exercise) => void;
  updateComment: (lessonNumber: number, exerciseTitle: string, comment: string) => void;
  clearAll: () => void;
};

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [personType, setPersonType] = useState<PersonType | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [selectedLessons, setSelectedLessons] = useState<Lesson[]>([]);

  const toggleExercise = useCallback(
    (lesson: Lesson, exercise: Exercise) => {
      exercise.isSelected = !exercise.isSelected;

      setSelectedLessons((prev) => {
        const lessonIndex = prev.findIndex(
          (l) => l.lessonNumber === lesson.lessonNumber
        );

        if (exercise.isSelected) {
          if (lessonIndex !== -1) {
            const updated = [...prev];
            updated[lessonIndex] = {
              ...updated[lessonIndex],
              exercises: [...updated[lessonIndex].exercises, exercise],
            };
            return updated;
          } else {
            return [
              ...prev,
              { lessonNumber: lesson.lessonNumber, exercises: [exercise] },
            ];
          }
        } else {
          if (lessonIndex === -1) return prev;
          const updatedExercises = prev[lessonIndex].exercises.filter(
            (e) => e.title !== exercise.title
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
    (lessonNumber: number, exerciseTitle: string, comment: string) => {
      setSelectedLessons((prev) =>
        prev.map((lesson) => {
          if (lesson.lessonNumber !== lessonNumber) return lesson;
          return {
            ...lesson,
            exercises: lesson.exercises.map((ex) =>
              ex.title === exerciseTitle ? { ...ex, comment } : ex
            ),
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
