import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import "./globals.css";
import "./forms.css";

// デジタル庁デザインシステムの本文書体
const notoSansJP = Noto_Sans_JP({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });

export const metadata: Metadata = {
  title: "タスク管理",
};

// 描画前にテーマを決めて、ちらつきをなくす（Next.js の preventing-flash-before-hydration の手順）
// 判定は src/components/ThemeToggle.tsx の resolve() と同じ
const themeScript =
  '(function(){try{var t=localStorage.getItem("theme");' +
  'if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";' +
  "document.documentElement.dataset.theme=t}catch(e){}})()";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className={notoSansJP.className} data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <header className="site-header">
          <Link href="/" className="site-title">
            タスク管理
          </Link>
          <ThemeToggle />
        </header>
        <div className="container">{children}</div>
      </body>
    </html>
  );
}
