import { curriculumSlices } from "@/content";

import { saveFormulaRecord, type FormulaRecord } from "./repository";

export interface CurriculumFormulaCandidate {
  entityType: "lesson";
  entityId: string;
  field: string;
  latex: string;
  note: string;
}

export interface GenerateCurriculumFormulaAssetsResult {
  totalCandidates: number;
  generatedRecords: FormulaRecord[];
}

export function collectCurriculumFormulaCandidates(): CurriculumFormulaCandidate[] {
  const candidates: CurriculumFormulaCandidate[] = [];

  for (const slice of curriculumSlices) {
    for (const lesson of slice.lessons) {
      for (const block of lesson.bodyBlocks) {
        if (block.type !== "formula") {
          continue;
        }

        for (const [index, formula] of block.formulas.entries()) {
          candidates.push({
            entityType: "lesson",
            entityId: lesson.id,
            field: `${block.id}:${index + 1}`,
            latex: formula,
            note: [
              slice.chapter.title,
              lesson.title,
              block.title ?? "公式块",
              `第 ${index + 1} 条`,
            ].join(" / "),
          });
        }
      }
    }
  }

  return candidates;
}

export async function generateCurriculumFormulaAssets(options: {
  includePng?: boolean;
} = {}): Promise<GenerateCurriculumFormulaAssetsResult> {
  const candidates = collectCurriculumFormulaCandidates();
  const generatedRecords: FormulaRecord[] = [];

  for (const candidate of candidates) {
    const record = await saveFormulaRecord({
      entityType: candidate.entityType,
      entityId: candidate.entityId,
      field: candidate.field,
      latex: candidate.latex,
      note: candidate.note,
      formats: options.includePng ? ["svg", "png"] : ["svg"],
    });

    generatedRecords.push(record);
  }

  return {
    totalCandidates: candidates.length,
    generatedRecords,
  };
}
