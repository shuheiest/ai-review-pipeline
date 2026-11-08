<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# このリポジトリのルール

- 仕様は `docs/spec.md`。動作を変えるときは先に仕様書を直す
- 依存の向きは `routes → usecase → domain`、`usecase → repository`。`domain` は Hono・Prisma・Next.js を参照しない
- `docs/spec.md` と `docs/test-cases.md` は本人が書く。AIは編集せず、変更が必要なら提案だけする
- lint のルール（200 行・複雑度 5・`any` 禁止）に `eslint-disable` で逃げない。超えそうなら関数やファイルを分ける
- 画面は Hono の `hc` クライアント（`src/client/api.ts`）経由で API を呼ぶ。`fetch` を直接書かない
- チェックは `npm run typecheck`・`npm run lint`・`npm test`
- テストは `docs/test-strategy.md` の方針に従う。ケースは `docs/test-cases.md` が決め、エージェントはそのファイルを編集しない。足りない・間違っていると思ったら提案として報告する
- テスト名は日本語で、先頭に `docs/test-cases.md` のケース ID を付ける。実装に合わせてテストを書き換えない
- シナリオテストは `tests/scenarios/*.test.ts` に置き、`app.request()` で呼ぶ。各テストの前に `resetDb()`（`tests/scenarios/db.ts`）で空にする
