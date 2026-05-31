import type {
  CurriculumSlice,
  GradeDefinition,
  KnowledgePointLesson,
  UnitQuiz,
  VolumeDefinition,
  WorkedExample,
} from "@/types/content";

import {
  g10Required1Unit1Slice,
  g7ShangUnit1Slice,
  g7ShangUnit2Slice,
  g7ShangUnit3Slice,
  g7ShangUnit4Slice,
  g7XiaUnit1Slice,
  g7XiaUnit2Slice,
  g7XiaUnit3Slice,
  g7XiaUnit4Slice,
  g7XiaUnit5Slice,
  g7XiaUnit6Slice,
  g8ShangUnit1Slice,
  g8ShangUnit2Slice,
  g8ShangUnit3Slice,
  g8ShangUnit4Slice,
  g8ShangUnit5Slice,
  g8XiaUnit1Slice,
  g8XiaUnit2Slice,
  g8XiaUnit3Slice,
  g8XiaUnit4Slice,
  g8XiaUnit5Slice,
  g9ShangUnit1Slice,
  g9ShangUnit2Slice,
  g9ShangUnit3Slice,
  g9ShangUnit4Slice,
  g9ShangUnit5Slice,
  g9XiaUnit1Slice,
  g9XiaUnit2Slice,
  g9XiaUnit3Slice,
  g9XiaUnit4Slice,
} from "./curriculum";

export const curriculumSlices: CurriculumSlice[] = [
  g10Required1Unit1Slice,
  g7ShangUnit1Slice,
  g7ShangUnit2Slice,
  g7ShangUnit3Slice,
  g7ShangUnit4Slice,
  g7XiaUnit1Slice,
  g7XiaUnit2Slice,
  g7XiaUnit3Slice,
  g7XiaUnit4Slice,
  g7XiaUnit5Slice,
  g7XiaUnit6Slice,
  g8ShangUnit1Slice,
  g8ShangUnit2Slice,
  g8ShangUnit3Slice,
  g8ShangUnit4Slice,
  g8ShangUnit5Slice,
  g8XiaUnit1Slice,
  g8XiaUnit2Slice,
  g8XiaUnit3Slice,
  g8XiaUnit4Slice,
  g8XiaUnit5Slice,
  g9ShangUnit1Slice,
  g9ShangUnit2Slice,
  g9ShangUnit3Slice,
  g9ShangUnit4Slice,
  g9ShangUnit5Slice,
  g9XiaUnit1Slice,
  g9XiaUnit2Slice,
  g9XiaUnit3Slice,
  g9XiaUnit4Slice,
].sort((left, right) => left.chapter.order - right.chapter.order);

export const grades: GradeDefinition[] = Array.from(
  new Map(curriculumSlices.map((slice) => [slice.grade.id, slice.grade])).values(),
);

export const volumes: VolumeDefinition[] = Array.from(
  new Map(
    curriculumSlices.map((slice) => [
      `${slice.grade.id}:${slice.volume.id}`,
      slice.volume,
    ]),
  ).values(),
);

export const chapters = curriculumSlices
  .map((slice) => slice.chapter)
  .sort((left, right) => left.order - right.order);

export const lessons: KnowledgePointLesson[] = curriculumSlices.flatMap(
  (slice) => slice.lessons,
);

export const workedExamples: WorkedExample[] = curriculumSlices.flatMap(
  (slice) => slice.workedExamples,
);

export const quizzes: UnitQuiz[] = curriculumSlices.map((slice) => slice.quiz);
