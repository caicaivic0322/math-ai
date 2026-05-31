export type StageId = "junior" | "senior";

export type GradeId = "g7" | "g8" | "g9" | "g10" | "g11" | "g12";

export type VolumeId =
  | "shang"
  | "xia"
  | "required-1"
  | "required-2"
  | "required-3"
  | "elective-1"
  | "elective-2"
  | "elective-3"
  | "choice-required-1"
  | "choice-required-2"
  | "choice-required-3";

export type CurriculumProgramKind =
  | "volume"
  | "required"
  | "elective"
  | "choice-required";

export interface LessonDerivationStep {
  id: string;
  title?: string;
  expression?: string;
  explanation: string;
}

export interface LessonTableRow {
  id: string;
  cells: string[];
  emphasis?: boolean;
}

export type LessonContentBlock =
  | {
      type: "richText";
      id: string;
      title?: string;
      content: string[];
    }
  | {
      type: "formula";
      id: string;
      title?: string;
      formulas: string[];
      note?: string;
      label?: string;
    }
  | {
      type: "derivation";
      id: string;
      title?: string;
      steps: LessonDerivationStep[];
      note?: string;
    }
  | {
      type: "table";
      id: string;
      title?: string;
      columns: string[];
      rows: LessonTableRow[];
      note?: string;
    }
  | {
      type: "tip";
      id: string;
      title: string;
      content: string;
    }
  | {
      type: "image";
      id: string;
      src: string;
      alt: string;
      caption?: string;
    }
  | {
      type: "figure";
      id: string;
      title?: string;
      figure: MathFigure;
      note?: string;
      label?: string;
    };

export type QuizQuestionOption = {
  id: string;
  label: string;
  content: string;
};

export type QuizQuestionType =
  | "single-choice"
  | "multiple-choice"
  | "fill-blank"
  | "numeric"
  | "expression"
  | "step-by-step";
export type QuizDifficulty = "basic" | "advanced" | "challenge";

export type QuizBlankAnswerMap = Record<string, string>;
export type QuizMultipleChoiceAnswer = string[];
export type QuizAnswerValue = string | QuizBlankAnswerMap | QuizMultipleChoiceAnswer;
export type QuizAnswerMap = Record<string, QuizAnswerValue>;

export type QuizAnswerKind = "text" | "numeric" | "expression";

interface QuizQuestionFigureBase {
  alt: string;
  caption?: string;
  title?: string;
}

export interface CoordinatePointMarker {
  x: number;
  y: number;
  label?: string;
  emphasis?: boolean;
}

export interface NumberLineQuizFigure extends QuizQuestionFigureBase {
  kind: "number-line";
  leftLabel: string;
  middleLabel: string;
  rightLabel: string;
  focusLabel: string;
}

export interface ExpressionQuizFigure extends QuizQuestionFigureBase {
  kind: "expression";
  expression: string;
  leftBox: string;
  middleBox: string;
  rightBox: string;
}

export interface EquationBalanceQuizFigure extends QuizQuestionFigureBase {
  kind: "equation-balance";
  leftText: string;
  rightText: string;
}

export interface AngleQuizFigure extends QuizQuestionFigureBase {
  kind: "angle";
  centerLabel: string;
  angleLabel: string;
}

export interface ParallelLinesQuizFigure extends QuizQuestionFigureBase {
  kind: "parallel-lines";
  upperLabel: string;
  lowerLabel: string;
}

export interface TriangleQuizFigure extends QuizQuestionFigureBase {
  kind: "triangle";
  leftSide: string;
  rightSide: string;
  baseSide: string;
}

export interface CongruentTrianglesQuizFigure extends QuizQuestionFigureBase {
  kind: "congruent-triangles";
  leftTriangle: {
    vertexLabels: [string, string, string];
    leftSide: string;
    rightSide: string;
    baseSide: string;
  };
  rightTriangle: {
    vertexLabels: [string, string, string];
    leftSide: string;
    rightSide: string;
    baseSide: string;
  };
  relationLabel?: string;
}

export interface RectangleQuizFigure extends QuizQuestionFigureBase {
  kind: "rectangle";
  widthLabel: string;
  heightLabel: string;
}

export interface CoordinatePlaneQuizFigure extends QuizQuestionFigureBase {
  kind: "coordinate-plane";
  xLabel?: string;
  yLabel?: string;
  points?: CoordinatePointMarker[];
}

export interface FunctionGraphQuizFigure extends QuizQuestionFigureBase {
  kind: "function-graph";
  graphType: "linear" | "quadratic";
  equationLabel: string;
  domain: [number, number];
  coefficients: number[];
  highlightedPoints?: CoordinatePointMarker[];
}

export type MathFigure =
  | NumberLineQuizFigure
  | ExpressionQuizFigure
  | EquationBalanceQuizFigure
  | AngleQuizFigure
  | ParallelLinesQuizFigure
  | TriangleQuizFigure
  | CongruentTrianglesQuizFigure
  | RectangleQuizFigure
  | CoordinatePlaneQuizFigure
  | FunctionGraphQuizFigure;

export type QuizQuestionFigure = MathFigure;

export interface QuizBlankField {
  id: string;
  prompt: string;
  hint: string;
  acceptableAnswers: string[];
  placeholder?: string;
  answerKind?: QuizAnswerKind;
  tolerance?: number;
  variable?: string;
}

export interface QuizStepField extends QuizBlankField {
  title?: string;
}

export interface GradeDefinition {
  id: GradeId;
  stageId?: StageId;
  label: string;
  shortLabel: string;
  description: string;
}

export interface VolumeDefinition {
  id: VolumeId;
  stageId?: StageId;
  gradeId: GradeId;
  kind?: CurriculumProgramKind;
  label: string;
  shortLabel?: string;
  description: string;
}

export interface CurriculumChapter {
  id: string;
  stageId?: StageId;
  gradeId: GradeId;
  volumeId: VolumeId;
  slug: string;
  title: string;
  summary: string;
  order: number;
  lessonIds: string[];
  workedExampleIds: string[];
  quizId: string;
  coverImage?: {
    src: string;
    alt: string;
  };
}

export interface KnowledgePointLesson {
  id: string;
  chapterId: string;
  slug: string;
  title: string;
  summary: string;
  learningObjectives: string[];
  keyRules: string[];
  bodyBlocks: LessonContentBlock[];
  relatedExampleIds: string[];
  order: number;
  videoPlaceholder?: {
    title: string;
    durationLabel: string;
    description: string;
    src?: string;
    posterSrc?: string;
    status?: "planned" | "rendered";
  };
}

export interface WorkedExampleStep {
  id: string;
  title: string;
  content: string;
}

export interface WorkedExample {
  id: string;
  chapterId: string;
  slug: string;
  title: string;
  summary: string;
  problem: string;
  steps: WorkedExampleStep[];
  answer: string;
  commonMistakes: string[];
  relatedLessonIds: string[];
  order: number;
}

interface QuizQuestionBase {
  id: string;
  quizId: string;
  type: QuizQuestionType;
  difficulty: QuizDifficulty;
  stem: string;
  figure?: QuizQuestionFigure;
  explanation: string;
  relatedLessonIds: string[];
  relatedExampleIds?: string[];
}

export interface SingleChoiceQuizQuestion extends QuizQuestionBase {
  type: "single-choice";
  options: QuizQuestionOption[];
  correctOptionId: string;
}

export interface MultipleChoiceQuizQuestion extends QuizQuestionBase {
  type: "multiple-choice";
  options: QuizQuestionOption[];
  correctOptionIds: string[];
}

export interface FillBlankQuizQuestion extends QuizQuestionBase {
  type: "fill-blank";
  blanks: QuizBlankField[];
}

export interface NumericQuizQuestion extends QuizQuestionBase {
  type: "numeric";
  prompt: string;
  acceptableAnswers: string[];
  placeholder?: string;
  tolerance?: number;
}

export interface ExpressionQuizQuestion extends QuizQuestionBase {
  type: "expression";
  prompt: string;
  acceptableAnswers: string[];
  placeholder?: string;
  variable?: string;
}

export interface StepByStepQuizQuestion extends QuizQuestionBase {
  type: "step-by-step";
  steps: QuizStepField[];
}

export type QuizQuestion =
  | SingleChoiceQuizQuestion
  | MultipleChoiceQuizQuestion
  | FillBlankQuizQuestion
  | NumericQuizQuestion
  | ExpressionQuizQuestion
  | StepByStepQuizQuestion;

export interface UnitQuiz {
  id: string;
  chapterId: string;
  title: string;
  instructions: string;
  passingScore: number;
  questions: QuizQuestion[];
}

export interface CurriculumSlice {
  grade: GradeDefinition;
  volume: VolumeDefinition;
  chapter: CurriculumChapter;
  lessons: KnowledgePointLesson[];
  workedExamples: WorkedExample[];
  quiz: UnitQuiz;
}

export interface QuizQuestionResult {
  questionId: string;
  type: QuizQuestionType;
  stem: string;
  difficulty: QuizDifficulty;
  figure?: QuizQuestionFigure;
  earnedFraction: number;
  learnerAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
  relatedLessonIds: string[];
  relatedExampleIds: string[];
  answerBreakdown?: Array<{
    id: string;
    prompt: string;
    learnerAnswer: string | null;
    correctAnswer: string;
    isCorrect: boolean;
  }>;
}

export interface QuizResultSummary {
  quizId: string;
  chapterId: string;
  totalQuestions: number;
  correctCount: number;
  earnedPoints: number;
  score: number;
  passingScore: number;
  passed: boolean;
  questionResults: QuizQuestionResult[];
  suggestedLessonIds: string[];
}
