import type { GradeId, StageId, VolumeId } from "@/types/content";

type GradeCatalogEntry = {
  id: GradeId;
  stageId: StageId;
  label: string;
  enabled: boolean;
};

type ProgramCatalogEntry = {
  id: VolumeId;
  stageId: StageId;
  label: string;
  kind: "volume" | "required" | "elective" | "choice-required";
  enabled: boolean;
};

const GRADE_CATALOG: GradeCatalogEntry[] = [
  { id: "g7", stageId: "junior", label: "七年级", enabled: true },
  { id: "g8", stageId: "junior", label: "八年级", enabled: true },
  { id: "g9", stageId: "junior", label: "九年级", enabled: true },
  { id: "g10", stageId: "senior", label: "高一", enabled: false },
  { id: "g11", stageId: "senior", label: "高二", enabled: false },
  { id: "g12", stageId: "senior", label: "高三", enabled: false },
];

const PROGRAM_CATALOG: ProgramCatalogEntry[] = [
  { id: "shang", stageId: "junior", label: "上册", kind: "volume", enabled: true },
  { id: "xia", stageId: "junior", label: "下册", kind: "volume", enabled: true },
  {
    id: "required-1",
    stageId: "senior",
    label: "必修一",
    kind: "required",
    enabled: false,
  },
  {
    id: "required-2",
    stageId: "senior",
    label: "必修二",
    kind: "required",
    enabled: false,
  },
  {
    id: "required-3",
    stageId: "senior",
    label: "必修三",
    kind: "required",
    enabled: false,
  },
  {
    id: "elective-1",
    stageId: "senior",
    label: "选修一",
    kind: "elective",
    enabled: false,
  },
  {
    id: "elective-2",
    stageId: "senior",
    label: "选修二",
    kind: "elective",
    enabled: false,
  },
  {
    id: "elective-3",
    stageId: "senior",
    label: "选修三",
    kind: "elective",
    enabled: false,
  },
  {
    id: "choice-required-1",
    stageId: "senior",
    label: "选择性必修一",
    kind: "choice-required",
    enabled: false,
  },
  {
    id: "choice-required-2",
    stageId: "senior",
    label: "选择性必修二",
    kind: "choice-required",
    enabled: false,
  },
  {
    id: "choice-required-3",
    stageId: "senior",
    label: "选择性必修三",
    kind: "choice-required",
    enabled: false,
  },
];

export const ALL_GRADES = GRADE_CATALOG.map((entry) => entry.id);
export const ALL_PROGRAMS = PROGRAM_CATALOG.map((entry) => entry.id);
export const JUNIOR_GRADES = GRADE_CATALOG.filter((entry) => entry.stageId === "junior").map(
  (entry) => entry.id,
);
export const SENIOR_GRADES = GRADE_CATALOG.filter((entry) => entry.stageId === "senior").map(
  (entry) => entry.id,
);
export const GRADES = GRADE_CATALOG.filter((entry) => entry.enabled).map((entry) => entry.id);
export const VOLUMES = PROGRAM_CATALOG.filter((entry) => entry.enabled).map((entry) => entry.id);

export const routePaths = {
  home: () => "/",
  login: () => "/login",
  register: () => "/register",
  formulaStudio: () => "/formula-studio",
  adminContent: () => "/admin/content",
  adminIdentity: () => "/admin/identity",
  adminContentChapter: (gradeId: string, volumeId: string, chapterId: string) =>
    `/admin/content/chapters/${gradeId}/${volumeId}/${chapterId}`,
  adminContentLesson: (lessonId: string) => `/admin/content/lessons/${lessonId}`,
  adminContentQuiz: (gradeId: string, volumeId: string, quizId: string) =>
    `/admin/content/quizzes/${gradeId}/${volumeId}/${quizId}`,
  adminContentQuizQuestion: (gradeId: string, volumeId: string, questionId: string) =>
    `/admin/content/questions/${gradeId}/${volumeId}/${questionId}`,
  adminContentWorkedExample: (gradeId: string, volumeId: string, exampleId: string) =>
    `/admin/content/worked-examples/${gradeId}/${volumeId}/${exampleId}`,
  gradeVolume: (grade: string, volume: string) => `/${grade}/${volume}`,
  catalog: (grade: string, volume: string) => `/${grade}/${volume}/catalog`,
  chapter: (grade: string, volume: string, chapterId: string) =>
    `/${grade}/${volume}/catalog/${chapterId}`,
  lesson: (
    grade: string,
    volume: string,
    chapterId: string,
    lessonSlug: string,
  ) => `/${grade}/${volume}/catalog/${chapterId}/lessons/${lessonSlug}`,
  example: (
    grade: string,
    volume: string,
    chapterId: string,
    exampleSlug: string,
  ) => `/${grade}/${volume}/catalog/${chapterId}/examples/${exampleSlug}`,
  quiz: (grade: string, volume: string, chapterId: string) =>
    `/${grade}/${volume}/catalog/${chapterId}/quiz`,
  quizResult: (grade: string, volume: string, chapterId: string) =>
    `/${grade}/${volume}/catalog/${chapterId}/quiz/result`,
};

export function getGradeLabel(grade: string) {
  return GRADE_CATALOG.find((entry) => entry.id === grade)?.label ?? grade;
}

export function getVolumeLabel(volume: string) {
  return PROGRAM_CATALOG.find((entry) => entry.id === volume)?.label ?? volume;
}

export function getGradeStage(grade: string): StageId | undefined {
  return GRADE_CATALOG.find((entry) => entry.id === grade)?.stageId;
}

export function getProgramKind(volume: string) {
  return PROGRAM_CATALOG.find((entry) => entry.id === volume)?.kind;
}

export function isGradeId(value: string): value is GradeId {
  return ALL_GRADES.includes(value as GradeId);
}

export function isVolumeId(value: string): value is VolumeId {
  return ALL_PROGRAMS.includes(value as VolumeId);
}
