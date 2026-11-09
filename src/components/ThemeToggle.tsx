"use client";

import { useLayoutEffect } from "react";

type Theme = "light" | "dark";

// 保存した設定があればそれ、なければ OS の設定。layout.tsx の inline script と同じ判定
function resolve(): Theme {
  const stored = localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") return stored;
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function apply(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

// ヘッダーのライト／ダーク切り替え。描画前の初期値は layout.tsx の inline script が入れる
export function ThemeToggle() {
  // 開発時の Strict Mode の再マウントで <html> の属性が消えるので入れ直す。本番では何も変わらない
  useLayoutEffect(() => apply(resolve()), []);

  function toggle() {
    const next: Theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    localStorage.setItem("theme", next);
    apply(next);
  }

  return (
    <button type="button" className="btn btn-outline" onClick={toggle}>
      <span className="only-light">ダークモードにする</span>
      <span className="only-dark">ライトモードにする</span>
    </button>
  );
}
