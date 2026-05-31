import type { Metadata } from "next";
import type { ReactNode } from "react";

import { TopBar } from "../components/layout/TopBar";
import { SiteShell } from "../components/layout/SiteShell";

import "../styles/globals.css";

export const metadata: Metadata = {
  title: "人教版初中数学学习平台",
  description: "面向七至九年级的数学学习平台骨架。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <SiteShell>
          <TopBar />
          {children}
        </SiteShell>
      </body>
    </html>
  );
}
