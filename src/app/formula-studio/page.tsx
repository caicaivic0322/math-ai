import { FormulaStudioClient } from "./FormulaStudioClient";

export const metadata = {
  title: "公式资源工作台",
  description: "教师录入 LaTeX，使用 KaTeX 预览，并保存稳定的 SVG/PNG 公式资源。",
};

export default function FormulaStudioPage() {
  return (
    <main className="flex-1 pb-12">
      <section className="poster-panel rounded-[2.5rem] border border-[color-mix(in_oklch,var(--color-primary)_16%,var(--color-border))] bg-[linear-gradient(135deg,color-mix(in_oklch,var(--color-surface)_86%,white)_0%,color-mix(in_oklch,var(--color-primary-soft)_44%,white)_58%,color-mix(in_oklch,var(--color-accent)_16%,white)_100%)] p-6 shadow-[var(--shadow-lg)] sm:p-8 lg:p-10">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--color-primary)]">
            Formula Infrastructure
          </p>
          <h1 className="mt-3 text-[clamp(2.5rem,4.8vw,4.6rem)] font-semibold tracking-[-0.06em]">
            公式资源工作台
          </h1>
          <p className="mt-4 text-base leading-8 text-[var(--color-text-muted)] sm:text-lg">
            面向老师端的最小验证页。左侧继续用 KaTeX 做编辑态预览，保存后由后端调用 RaTeX 生成稳定 SVG/PNG，并写入本地公式记录仓储。
          </p>
        </div>
      </section>

      <section className="mt-8">
        <FormulaStudioClient />
      </section>
    </main>
  );
}
