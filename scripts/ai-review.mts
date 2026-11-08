// 使い方: node scripts/ai-review.mts <diffファイル> <仕様書> > review.md
// ANTHROPIC_API_KEY を環境変数で渡す。レビュー結果を Markdown で標準出力に書く。
import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "node:fs";

const [diffPath, specPath] = process.argv.slice(2);
const diff = readFileSync(diffPath, "utf8");
const spec = readFileSync(specPath, "utf8");

const system = `あなたはこのリポジトリのコードレビュアーです。PR の差分を、以下の仕様書に照らしてレビューしてください。

- 「2. タスクの項目」「3. ステータスの流れ」の規則との食い違いを最優先で指摘する
- 「9. フォルダ構成」の依存の向き（routes → usecase → domain、usecase → repository、domain は何も参照しない）の違反も指摘する
- 指摘には根拠となる仕様書の節と、該当するファイル・行を書く
- 文体や好みの話はしない。仕様に照らして言えることだけを書く
- 問題がなければ「仕様との食い違いは見つかりませんでした」と書く
- docs/spec.md と docs/test-cases.md の変更者の確認は不要。本人が決めて承認した内容だけが書き込まれる運用になっている
- 日本語の Markdown で、1 行の総評のあとに指摘を箇条書きにする

# 仕様書

${spec}`;

const client = new Anthropic();
const response = await client.beta.messages.create({
  model: "claude-opus-5-5",
  max_tokens: 16000,
  betas: ["server-side-fallback-2026-07-01"],
  fallbacks: "default",
  system,
  messages: [{ role: "user", content: `PR の差分:\n\n\`\`\`diff\n${diff}\n\`\`\`` }],
});

const text = response.content
  .filter((block) => block.type === "text")
  .map((block) => block.text)
  .join("\n");

console.log(`## AI レビュー（${response.model}）\n\n${text || "（レビューを生成できませんでした）"}`);
