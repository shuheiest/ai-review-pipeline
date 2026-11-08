import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import "./forms.css";

// デジタル庁デザインシステムの本文書体
const notoSansJP = Noto_Sans_JP({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });

export const metadata: Metadata = {
  title: "タスク管理",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className={notoSansJP.className}>
      <body>
        <header className="site-header">
          <Link href="/" className="site-title">
            タスク管理
          </Link>
        </header>
        <div className="container">{children}</div>
      </body>
    </html>
  );
}
