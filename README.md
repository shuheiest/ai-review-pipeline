# ai-review-pipeline

PR ごとに「機械的なチェック → AI レビュー → 人間のレビュー」を通す開発の仕組みを、小さなタスク管理アプリを題材に作ったリポジトリです。仕様は [docs/spec.md](docs/spec.md) にあります。

## なぜ 3 段階に分けるのか

| 段階 | 誰が | 見るもの | 止め方 |
|---|---|---|---|
| 1. 機械的なチェック | GitHub Actions（型チェック・lint・テスト） | 機械で白黒つくもの。型の不整合、200 行超え、複雑度 5 超え、`any`、テスト失敗 | CI が赤になり、そこで止まる |
| 2. AI レビュー | Claude API | 機械では判定しにくいが、仕様書に書いてあること。ステータス遷移の表との食い違い、入力規則の漏れ、依存の向きの違反 | PR にコメントが付く。止めはしない |
| 3. 人間のレビュー | 本人 | 設計判断。AI の指摘が正しいか、仕様そのものを直すべきか | 本人がマージを判断する |

- 1 を先に置くのは、機械で分かることに AI の呼び出し料金と人の時間を使わないためです。1 が落ちた PR には AI レビューは走りません。
- 2 を 1 の後ろに置くのは、AI に「仕様に照らすこと」だけをさせるためです。lint で拾える指摘が混ざると、仕様の指摘が埋もれます。
- 3 を最後に残すのは、AI の指摘は根拠付きの意見であって判定ではないからです。マージの責任は人が持ちます。

## 動かし方

```bash
npm install          # postinstall で prisma generate も走る
npm run db:push      # prisma/dev.db を作る
npm run dev          # http://localhost:3000
```

チェックは次の 3 つで、CI でも同じものが走ります。

```bash
npm run typecheck
npm run lint
npm test
```

## テスト

方針は [docs/test-strategy.md](docs/test-strategy.md)、ケースは [docs/test-cases.md](docs/test-cases.md) にあります。ケースは人が決め、テストのコードは AI が書く分担です。

- 単体テスト：`src/server/domain/**/*.test.ts`。DB を使わない
- シナリオテスト：`tests/scenarios/*.test.ts`。`prisma/test.db` を毎回作り直し、各テストの前に空にする

## AI レビューの設定

1. GitHub の Secrets に `ANTHROPIC_API_KEY` を登録する
2. Anthropic のコンソールで月の利用額の上限を設定する

`ai-review.yml` は `ci` が成功した同じリポジトリ内の PR にだけ走ります。フォークからの PR ではキーを使いません。手元で試すには次のようにします。

```bash
git diff main > /tmp/pr.diff
ANTHROPIC_API_KEY=... node scripts/ai-review.mts /tmp/pr.diff docs/spec.md
```

## 画面

一覧・作成・詳細の 3 画面です。見た目は[デジタル庁デザインシステム](https://design.digital.go.jp/)の公式トークン（色・書体・角丸・フォーカスの見え方）に合わせています。画面は `src/client/api.ts` の型付きクライアント経由で API を呼び、`fetch` を直接書きません。

## 役割分担

仕様書 10 節のとおり、「何が正しいか」を決める文書は本人が、コードは Claude Code が担当します。

- 本人：`docs/spec.md`、`docs/test-cases.md` の内容を決める。AI レビューの指摘に判断を出し、マージする
- Claude Code：`src/` の実装、単体テスト・シナリオテストのコード。文書の変更が必要だと思ったら提案し、本人が承認したものだけを書き込む

## 3 段階が実際に働いた記録

| 段階 | PR | 何が起きたか |
|---|---|---|
| 1. 機械的なチェック | [#8](https://github.com/shuheiest/ai-review-pipeline/pull/8) | 複雑度 6 の関数を含む PR を出し、ci が lint で止まった。AI レビューは走らず（API は呼ばれない）、マージせずに閉じた。1 段階目が働くことを記録するための PR |
| 2. AI レビュー | [#2](https://github.com/shuheiest/ai-review-pipeline/pull/2) | domain が現在時刻を読んでいて「純粋な関数だけ」に反すると指摘。「今日」を引数で受け取る形に直し、仕様書 9 節にも明記した。タイトルの文字数の数え方と「今日」のタイムゾーンが仕様書にないことも指摘され、本人が決めて仕様書 2 節に書いた |
| 2. AI レビュー | [#4](https://github.com/shuheiest/ai-review-pipeline/pull/4) | 項目更新の経路から型のうえではステータスを変えられる余地があると指摘。repository の更新からステータスを外し、専用メソッドに分けた |
| 2. AI レビュー | [#5](https://github.com/shuheiest/ai-review-pipeline/pull/5) | AGENTS.md の domain の制約が仕様書より緩いと指摘。仕様書と同じ文言に揃えた |
| 2. AI レビュー | [#6](https://github.com/shuheiest/ai-review-pipeline/pull/6) | 存在しない id の 404 を画面で扱っていないと指摘。「タスクが見つかりません」の表示を足した |
| 3. 人間のレビュー | [#4](https://github.com/shuheiest/ai-review-pipeline/pull/4) | AI が「仕様書に書かれていない依存」とした `repository → domain` を本人が認め、仕様書に追記する判断をした |
