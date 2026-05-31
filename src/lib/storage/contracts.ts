import type { FormulaAssetFormat } from "@/lib/formula-render";
import type {
  CurriculumChapter,
  GradeDefinition,
  GradeId,
  KnowledgePointLesson,
  QuizQuestion,
  UnitQuiz,
  VolumeDefinition,
  VolumeId,
  WorkedExample,
} from "@/types/content";

export type ContentSourceKind = "local-static" | "json-file" | "cms" | "database";
export type AssetStorageKind = "filesystem" | "object-storage";

export interface FormulaAssetPointer {
  hash: string;
  latexSource: string;
  format: FormulaAssetFormat;
  publicPath: string;
}

export interface StoredGradeRecord {
  id: GradeId;
  grade: GradeDefinition;
  updatedAt: string;
}

export interface StoredVolumeRecord {
  id: string;
  gradeId: GradeId;
  volumeId: VolumeId;
  volume: VolumeDefinition;
  updatedAt: string;
}

export interface StoredLessonRecord {
  id: string;
  gradeId: GradeId;
  volumeId: VolumeId;
  chapterId: string;
  lesson: KnowledgePointLesson;
  formulaHashes: string[];
  updatedAt: string;
}

export interface StoredWorkedExampleRecord {
  id: string;
  gradeId: GradeId;
  volumeId: VolumeId;
  chapterId: string;
  workedExample: WorkedExample;
  formulaHashes: string[];
  updatedAt: string;
}

export interface StoredQuizQuestionRecord {
  id: string;
  quizId: string;
  chapterId: string;
  gradeId: GradeId;
  volumeId: VolumeId;
  question: QuizQuestion;
  formulaHashes: string[];
  updatedAt: string;
}

export interface StoredQuizRecord {
  id: string;
  gradeId: GradeId;
  volumeId: VolumeId;
  chapterId: string;
  quiz: UnitQuiz;
  questionIds: string[];
  updatedAt: string;
}

export interface StoredChapterRecord {
  id: string;
  gradeId: GradeId;
  volumeId: VolumeId;
  chapter: CurriculumChapter;
  lessonIds: string[];
  workedExampleIds: string[];
  quizId: string;
  updatedAt: string;
}

export interface LearningContentStorageManifest {
  schemaVersion: "phase4-v1" | "phase6-v1";
  contentSourceKind: ContentSourceKind;
  assetStorageKind: AssetStorageKind;
}
