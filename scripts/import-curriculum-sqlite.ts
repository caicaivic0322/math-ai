import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  createSqliteLearningContentRepository,
  type LearningContentSqliteConfig,
} from "../src/lib/content-store";
import type { CurriculumContentSnapshot } from "../src/lib/content/source";
import { buildCurriculumContentSnapshot } from "../src/lib/content/source";

function resolveAbsolutePath(projectRoot: string, value: string) {
  return path.isAbsolute(value) ? value : path.join(projectRoot, value);
}

function resolvePaths(projectRoot: string, args: string[]) {
  const snapshotPath = resolveAbsolutePath(
    projectRoot,
    args[0] ?? path.join("data", "curriculum.snapshot.json"),
  );
  const databasePath = resolveAbsolutePath(
    projectRoot,
    args[1] ?? path.join("data", "content-store.sqlite"),
  );

  return {
    snapshotPath,
    databasePath,
  };
}

async function loadSnapshot(snapshotPath: string) {
  const raw = await readFile(snapshotPath, "utf8");
  const parsed = JSON.parse(raw) as Partial<CurriculumContentSnapshot>;

  return buildCurriculumContentSnapshot(parsed.curriculumSlices ?? []);
}

async function main() {
  const projectRoot = process.cwd();
  const { snapshotPath, databasePath } = resolvePaths(projectRoot, process.argv.slice(2));
  const snapshot = await loadSnapshot(snapshotPath);
  const repositoryConfig: LearningContentSqliteConfig = {
    databasePath,
    storeFilePath: databasePath,
  };
  const repository = createSqliteLearningContentRepository(repositoryConfig);
  const store = repository.replace({
    curriculumSlices: snapshot.curriculumSlices,
    sourceSnapshotPath: snapshotPath,
  });

  console.log(`已导入课程快照到 SQLite 数据库 ${databasePath}`);
  console.log(`来源快照 ${snapshotPath}`);
  console.log(
    `年级 ${store.grades.length} / 册次 ${store.volumes.length} / 章节 ${store.chapters.length} / 课时 ${store.lessons.length} / 测验题 ${store.quizQuestions.length}`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
