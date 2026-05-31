import { NextRequest, NextResponse } from "next/server";

import { generateCurriculumFormulaAssets } from "@/lib/formula-records";

export const runtime = "nodejs";

type GenerateCurriculumBody = {
  includePng?: unknown;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as GenerateCurriculumBody;
    const includePng = body.includePng === true;
    const result = await generateCurriculumFormulaAssets({
      includePng,
    });

    return NextResponse.json({
      totalCandidates: result.totalCandidates,
      generatedCount: result.generatedRecords.length,
      records: result.generatedRecords,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "批量生成课程公式资源失败。";

    return NextResponse.json(
      {
        error: message,
      },
      { status: 400 },
    );
  }
}
