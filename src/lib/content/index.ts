import type {
  CurriculumSlice,
  GradeId,
  KnowledgePointLesson,
  UnitQuiz,
  VolumeId,
  WorkedExample,
} from "@/types/content";
import { getCurriculumContentSource } from "./source";

function getContentSnapshot() {
  return getCurriculumContentSource().getSnapshot();
}

function getSlicesByGradeVolume() {
  return getContentSnapshot().curriculumSlices.reduce<Map<string, CurriculumSlice[]>>(
    (acc, slice) => {
      const key = `${slice.grade.id}:${slice.volume.id}`;
      const existing = acc.get(key) ?? [];

      existing.push(slice);
      existing.sort((left, right) => left.chapter.order - right.chapter.order);
      acc.set(key, existing);

      return acc;
    },
    new Map(),
  );
}

function getChapterByIdMap() {
  return new Map(getContentSnapshot().chapters.map((chapter) => [chapter.id, chapter]));
}

function getLessonByIdMap() {
  return new Map(getContentSnapshot().lessons.map((lesson) => [lesson.id, lesson]));
}

function getExampleByIdMap() {
  return new Map(
    getContentSnapshot().workedExamples.map((example) => [example.id, example]),
  );
}

function getQuizByIdMap() {
  return new Map(getContentSnapshot().quizzes.map((quiz) => [quiz.id, quiz]));
}

export function getGrades() {
  return getContentSnapshot().grades;
}

export function getVolumesByGrade(gradeId: GradeId) {
  return getContentSnapshot().volumes.filter((volume) => volume.gradeId === gradeId);
}

export function getPublishedGradeVolumeEntries() {
  return getGrades().flatMap((grade) =>
    getVolumesByGrade(grade.id).map((volume) => ({
      grade,
      volume,
      sliceCount: getCurriculumSlices(grade.id, volume.id).length,
    })),
  );
}

export function getCurriculumSlices(
  gradeId: GradeId,
  volumeId: VolumeId,
) {
  return getSlicesByGradeVolume().get(`${gradeId}:${volumeId}`) ?? [];
}

export function getChaptersByGradeVolume(gradeId: GradeId, volumeId: VolumeId) {
  return getCurriculumSlices(gradeId, volumeId).map((slice) => slice.chapter);
}

export function getChapterWithContent(
  gradeId: GradeId,
  volumeId: VolumeId,
  chapterId: string,
) {
  const slice = getCurriculumSlices(gradeId, volumeId).find(
    (candidate) => candidate.chapter.id === chapterId,
  );

  if (!slice) {
    return undefined;
  }

  return {
    chapter: slice.chapter,
    lessons: slice.lessons,
    workedExamples: slice.workedExamples,
    quiz: slice.quiz,
  };
}

export function getLessonBySlug(
  gradeId: GradeId,
  volumeId: VolumeId,
  chapterId: string,
  lessonSlug: string,
): KnowledgePointLesson | undefined {
  return getChapterWithContent(gradeId, volumeId, chapterId)?.lessons.find(
    (lesson) => lesson.slug === lessonSlug,
  );
}

export function getWorkedExampleBySlug(
  gradeId: GradeId,
  volumeId: VolumeId,
  chapterId: string,
  exampleSlug: string,
): WorkedExample | undefined {
  return getChapterWithContent(gradeId, volumeId, chapterId)?.workedExamples.find(
    (example) => example.slug === exampleSlug,
  );
}

export function getQuizByChapter(
  gradeId: GradeId,
  volumeId: VolumeId,
  chapterId: string,
): UnitQuiz | undefined {
  return getChapterWithContent(gradeId, volumeId, chapterId)?.quiz;
}

export function getRelatedLessons(lessonIds: string[]) {
  const lessonById = getLessonByIdMap();

  return lessonIds
    .map((lessonId) => lessonById.get(lessonId))
    .filter((lesson): lesson is KnowledgePointLesson => Boolean(lesson));
}

export function getRelatedWorkedExamples(exampleIds: string[]) {
  const exampleById = getExampleByIdMap();

  return exampleIds
    .map((exampleId) => exampleById.get(exampleId))
    .filter((example): example is WorkedExample => Boolean(example));
}

export function getChapterById(chapterId: string) {
  return getChapterByIdMap().get(chapterId);
}

export function getQuizById(quizId: string) {
  return getQuizByIdMap().get(quizId);
}

export function getCurriculumCoverageSummary() {
  const snapshot = getContentSnapshot();
  const questionCount = snapshot.quizzes.reduce((sum, quiz) => sum + quiz.questions.length, 0);

  return {
    gradeCount: snapshot.grades.length,
    volumeCount: snapshot.volumes.length,
    chapterCount: snapshot.chapters.length,
    lessonCount: snapshot.lessons.length,
    workedExampleCount: snapshot.workedExamples.length,
    quizCount: snapshot.quizzes.length,
    questionCount,
  };
}
