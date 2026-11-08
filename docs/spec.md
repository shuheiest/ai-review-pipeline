# タスク管理アプリ 仕様書

このリポジトリの主役は、アプリそのものではなく、**PRごとに「機械的なチェック → AIレビュー → 人間のレビュー」を通す開発の仕組み**です。題材はあえてシンプルなタスク管理にしています。

## 1. 技術

| 分類 | 採用 | 理由 |
|---|---|---|
| 言語 | TypeScript | |
| フロントエンド | Next.js（App Router）/ React | |
| API | Hono（Next.jsのRoute Handler上で動かす） | RESTの形のまま、`hc`（RPCクライアント）でフロントとバックの型を共有するため |
| 入力チェック | Zod（`@hono/zod-validator`） | APIの入力の型と実行時のチェックを、同じ定義から作るため |
| データベース | Prisma + SQLite（案） | インストール不要で、見る人がすぐ手元で動かせるため |
| テスト | Vitest（案） | TypeScriptをそのまま扱え、速いため |
| CI | GitHub Actions | |
| AIレビュー | Claude API（GitHub Actionsから呼び出す） | |

## 2. タスクの項目

| 項目 | 型 | 必須 | ルール |
|---|---|---|---|
| `id` | string | ○ | サーバーで自動採番 |
| `title` | string | ○ | 前後の空白を除いて1〜50文字。文字数は見た目の文字（書記素）で数え、結合した絵文字も1つで1文字 |
| `dueDate` | 日付（YYYY-MM-DD） | × | 正しい日付であること。作成時は過去の日付にできない。更新時は過去の日付も可。「過去」かどうかは日本時間で判定する |
| `status` | `todo` / `in_progress` / `done` | ○ | 作成時は `todo`。変更は「3. ステータスの流れ」に従う |
| `priority` | `low` / `medium` / `high` | ○ | 作成時の初期値は `medium` |
| `createdAt` / `updatedAt` | 日時 | ○ | サーバーで自動設定 |
| `completedAt` | 日時 | × | `done` になったときに設定。`done` から戻したときに消す |

## 3. ステータスの流れ

```
todo ⇄ in_progress ⇄ done
todo → done（着手せずに完了も可）
```

| 変更前 → 変更後 | 許可 |
|---|---|
| `todo` → `in_progress` | ○ |
| `todo` → `done` | ○ |
| `in_progress` → `todo` | ○ |
| `in_progress` → `done` | ○ |
| `done` → `in_progress` | ○（再オープン） |
| `done` → `todo` | ×（やり直すときは、まず `in_progress` に戻す） |
| 同じステータスへの変更 | 変更なしとして扱う（エラーにしない） |

- 許可されていない変更は、HTTP 409で返す
- `done` に変わったら `completedAt` に現在日時を入れる。`done` から変わったら `completedAt` を消す

## 4. API

| メソッド | パス | 内容 | 主なエラー |
|---|---|---|---|
| `GET` | `/api/tasks` | 一覧（`status` と `priority` で絞り込み可） | 400：絞り込みの値が不正 |
| `GET` | `/api/tasks/:id` | 1件取得 | 404 |
| `POST` | `/api/tasks` | 作成 | 400：入力チェックの違反 |
| `PATCH` | `/api/tasks/:id` | タイトル・期限・優先度の更新 | 400、404 |
| `PATCH` | `/api/tasks/:id/status` | ステータスの変更 | 400、404、409：許可されていない変更 |
| `DELETE` | `/api/tasks/:id` | 削除 | 404 |

## 5. 画面

| 画面 | 内容 |
|---|---|
| タスク一覧 | ステータス・優先度・期限を表示。ステータスと優先度で絞り込み |
| タスク作成 | タイトル・期限・優先度を入力。入力チェックのエラーを表示 |
| タスク詳細・編集 | 項目の編集、ステータスの変更、削除 |

## 6. 開発の流れ（このリポジトリの見せ場）

1. **機械的なチェック**：PRを出すと、GitHub Actionsで型チェック・lint・テストが走る。失敗したら、そこで止まる
2. **AIレビュー**：1が通ったら、Claude APIがPRの差分をレビューし、PRにコメントする。この仕様書（特に2・3のルール）に照らして指摘する
3. **人間のレビュー**：AIの指摘を見て、本人が判断してマージする

公開時には、それぞれの段階で止まったり指摘されたりしたPRを、記録として残す。

## 7. セキュリティ

- Claude APIのキーはGitHub Secretsに保存し、コードには書かない
- 他人のPR（フォーク）からのワークフローで、キーが使われないようにする（`pull_request_target` は使わない）
- Anthropicのコンソールで、月の利用額の上限を設定する

## 8. コードのルール

次のルールはESLintで設定し、**CIのlintで違反したらPRを止める**（機械的なチェックの一部）。

| ルール | 内容 | ESLintの設定 |
|---|---|---|
| ファイルの行数 | 1ファイル200行以内（空行・コメントを除く） | `max-lines: ["error", { max: 200, skipBlankLines: true, skipComments: true }]` |
| 複雑度 | 1関数の循環的複雑度は5以内 | `complexity: ["error", 5]` |
| `any` の禁止 | `any` を使わない | `@typescript-eslint/no-explicit-any: "error"` |

あわせて、`tsconfig.json` は `"strict": true` にする。

- 複雑度は、`if`・三項演算子・`&&`・`||`・`??`・ループなどの分岐の数で数える。5は厳しめなので、分岐が増えたら関数を分ける
- 例外を作るときは `eslint-disable` を使わず、PRで理由を説明して、ルール自体の見直しとして扱う

## 9. フォルダ構成

```
（リポジトリ名）/
├── .github/workflows/
│   ├── ci.yml              # 型チェック・lint・テスト
│   └── ai-review.yml       # ciが通ったらAIレビュー
├── docs/
│   ├── spec.md             # この仕様書
│   ├── test-strategy.md    # テスト方針
│   └── test-cases.md       # テストケース（本人が書く）
├── prisma/
│   └── schema.prisma
├── scripts/
│   └── ai-review.mts       # Claude APIを呼んでレビュー文を作る
├── src/
│   ├── app/                # Next.jsの画面
│   │   ├── page.tsx                  # タスク一覧
│   │   ├── tasks/new/page.tsx        # タスク作成
│   │   ├── tasks/[id]/page.tsx       # タスク詳細・編集
│   │   └── api/[[...route]]/route.ts # HonoをNext.jsのRoute Handlerに載せる入口
│   ├── server/
│   │   ├── domain/task/    # タスクのルール（仕様は本人、コードはClaude Code）
│   │   │   ├── task.ts             # 型の定義
│   │   │   ├── status.ts           # ステータスの流れ
│   │   │   ├── validation.ts       # 入力チェック
│   │   │   └── *.test.ts
│   │   ├── usecase/        # 作成・更新・ステータス変更などの処理
│   │   ├── repository/     # データベースの読み書き（Prisma）
│   │   └── routes/         # HonoのAPIの定義（domainのZodスキーマで入力チェック）
│   ├── client/
│   │   └── api.ts          # hc<AppType> で型付きのAPIクライアント
│   └── components/         # 画面の部品
├── tests/
│   ├── global-setup.ts     # テスト用SQLiteを作り直す
│   └── scenarios/          # シナリオテスト（app.request() でAPIを通す）
├── AGENTS.md               # コーディングエージェント向けのルール
├── eslint.config.mjs
├── tsconfig.json
├── vitest.config.mts
└── README.md
```

- `domain` は、データベースやHonoに依存しない純粋な関数だけにする（テストしやすく、AIレビューも仕様と照らし合わせやすい）。現在時刻も読まず、「今日」は呼び出す側から受け取る
- 依存の向きは `routes → usecase → domain`、`usecase → repository`。`domain` からは何も参照しない

## 10. 本人が手で書く部分

面接で深掘りされたときに自分の言葉で説明できるよう、「何が正しいか」を決める文書は本人が書く。実装とテストのコードはClaude Codeが書き、本人がレビューする。

| 本人が書く | Claude Codeが書く |
|---|---|
| この仕様書（特に2・3のルール） | `src/` の実装 |
| テストケース `docs/test-cases.md`（`docs/test-strategy.md` 参照） | テストのコード（単体テスト・シナリオテスト） |

AIは `docs/spec.md` と `docs/test-cases.md` を編集しない。変更が必要だと思ったら提案だけする。

## 11. 完成の線（最小版）

- [ ] タスクの作成・一覧・更新・ステータス変更・削除が動く
- [ ] PRで型チェック・lint（200行・複雑度5・any禁止を含む）・テストが自動で走る
- [ ] それが通ったら、AIレビューがPRにコメントする
- [ ] READMEに、なぜこの3段階に分けたのかを書く
- [ ] 3段階それぞれが働いたPRが、記録として残っている
