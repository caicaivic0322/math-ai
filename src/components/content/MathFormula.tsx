"use client";

import katex from "katex";

import { cn } from "@/lib/theme";

type MathFormulaProps = {
  latex: string;
  displayMode?: boolean;
  className?: string;
};

export function MathFormula({
  latex,
  displayMode = false,
  className,
}: MathFormulaProps) {
  const markup = renderKatexMarkup(latex, displayMode);

  if (!markup) {
    if (displayMode) {
      return <div className={cn("formula-fallback", className)}>{latex}</div>;
    }

    return <span className={cn("formula-fallback", className)}>{latex}</span>;
  }

  if (displayMode) {
    return (
      <div
        className={cn("formula-katex formula-katex-block", className)}
        dangerouslySetInnerHTML={{ __html: markup }}
      />
    );
  }

  return (
    <span
      className={cn("formula-katex formula-katex-inline", className)}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}

function renderKatexMarkup(latex: string, displayMode: boolean): string | null {
  try {
    return katex.renderToString(latex, {
      displayMode,
      output: "html",
      strict: "ignore",
      throwOnError: false,
      trust: false,
    });
  } catch {
    return null;
  }
}
