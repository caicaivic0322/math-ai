/**
 * Foundation tokens for the learning platform.
 * Assumption: the app will load its own font assets later, so these stacks
 * keep the UI readable and distinctive without adding a font dependency here.
 */
export const themeTokens = {
  color: {
    background: "oklch(98% 0.01 250)",
    surface: "oklch(97% 0.01 250)",
    surfaceStrong: "oklch(94% 0.015 250)",
    text: "oklch(22% 0.02 250)",
    textMuted: "oklch(45% 0.02 250)",
    border: "oklch(88% 0.01 250)",
    primary: "oklch(57% 0.15 250)",
    primaryForeground: "oklch(98% 0.01 250)",
    primarySoft: "oklch(93% 0.03 250)",
    accent: "oklch(76% 0.11 82)",
    accentForeground: "oklch(22% 0.02 82)",
    success: "oklch(65% 0.12 145)",
    warning: "oklch(76% 0.12 82)",
    danger: "oklch(63% 0.18 25)",
    info: "oklch(68% 0.11 230)",
  },
  font: {
    sans: [
      '"Noto Sans SC"',
      '"Source Han Sans SC"',
      '"PingFang SC"',
      '"Hiragino Sans GB"',
      '"Microsoft YaHei"',
      "ui-sans-serif",
      "system-ui",
      "sans-serif",
    ].join(", "),
    display: [
      '"Noto Serif SC"',
      '"Source Han Serif SC"',
      '"Songti SC"',
      '"STSong"',
      "serif",
    ].join(", "),
    mono: [
      '"SFMono-Regular"',
      '"JetBrains Mono"',
      '"Cascadia Code"',
      '"Roboto Mono"',
      "monospace",
    ].join(", "),
  },
  text: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    bodyLineHeight: 1.65,
    headingLineHeight: 1.15,
  },
  space: {
    0: "0rem",
    1: "0.25rem",
    2: "0.5rem",
    3: "0.75rem",
    4: "1rem",
    5: "1.25rem",
    6: "1.5rem",
    8: "2rem",
    10: "2.5rem",
    12: "3rem",
    16: "4rem",
    20: "5rem",
    24: "6rem",
  },
  radius: {
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    pill: "9999px",
  },
  shadow: {
    sm: "0 1px 2px oklch(24% 0.03 250 / 0.08)",
    md: "0 10px 24px -16px oklch(24% 0.03 250 / 0.22)",
    lg: "0 24px 48px -24px oklch(24% 0.03 250 / 0.28)",
  },
  layout: {
    containerSm: "40rem",
    containerMd: "56rem",
    containerLg: "72rem",
    containerXl: "80rem",
  },
} as const;

export type ThemeTokens = typeof themeTokens;

