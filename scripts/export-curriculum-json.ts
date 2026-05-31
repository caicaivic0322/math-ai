import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { curriculumSlices } from "../src/content";
import {
  buildCurriculumContentSnapshot,
  serializeCurriculumContentSnapshot,
} from "../src/lib/content/source";

async function main() {
  const projectRoot = process.cwd();
  const outputPath = resolveOutputPath(projectRoot, process.argv[2]);
  const snapshot = buildCurriculumContentSnapshot(curriculumSlices);
  const serialized = serializeCurriculumContentSnapshot(snapshot);

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, serialized, "utf8");

  console.log(`已导出课程快照到 ${outputPath}`);
  console.log(
    `切片 ${snapshot.curriculumSlices.length} / 课程 ${snapshot.lessons.length} / 测验 ${snapshot.quizzes.length}`,
  );
}

function resolveOutputPath(projectRoot: string, cliArg: string | undefined) {
  if (!cliArg) {
    return path.join(projectRoot, "data", "curriculum.snapshot.json");
  }

  return path.isAbsolute(cliArg) ? cliArg : path.join(projectRoot, cliArg);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
