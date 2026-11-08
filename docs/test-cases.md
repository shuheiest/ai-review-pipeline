# テストケース

`docs/test-strategy.md` の方針に従って、何を確かめるかを決める文書。本人が書く。AIはこのファイルを編集せず、足りない・間違っていると思ったら提案として報告する。

## 書き方

- ID は `UT-01`（単体テスト）、`ST-01`（シナリオテスト）のように付ける。番号は抜けても詰め直さない（テスト名との対応がずれるため）
- 1 行に 1 ケース。「入力」と「期待する結果」が決まっていること
- 根拠の列には `docs/spec.md` の節番号を書く（例：2、3）
- 境界の値（0 文字・1 文字・50 文字・51 文字など）は、許される側と許されない側の両方を書く
- 現在日時に依存するケースは、固定する日付を「入力」に書く（例：今日 = 2026-11-08）

## 1. 単体テスト（`src/server/domain/`）

### 1-1. ステータスの流れ（`status.ts`）

| ID | 変更前 | 変更後 | 期待する結果 | 根拠 |
|---|---|---|---|---|
| UT-01 | `todo` | `in_progress` | 許可 | 3 |
| UT-02 | `todo` | `done` | 許可 | 3 |
| UT-03 | `in_progress` | `todo` | 許可 | 3 |
| UT-04 | `in_progress` | `done` | 許可 | 3 |
| UT-05 | `done` | `in_progress` | 許可 | 3 |
| UT-06 | `done` | `todo` | 不許可 | 3 |
| UT-07 | `todo` / `in_progress` / `done` | 同じステータス | 変更なし（遷移としては扱わず、何もしない。エラーにもしない） | 3 |

### 1-2. タイトル（`validation.ts`）

| ID | 操作 | 入力 | 期待する結果 | 根拠 |
|---|---|---|---|---|
| UT-11 | 作成 | 前後に空白のある「  買い物  」 | 通る。値は「買い物」になる | 2 |
| UT-12 | 作成 | 空文字 `""` | 弾く | 2 |
| UT-13 | 作成 | 空白だけ `"   "` | 弾く | 2 |
| UT-14 | 作成 | 1 文字 | 通る | 2 |
| UT-15 | 作成 | 50 文字 | 通る | 2 |
| UT-16 | 作成 | 51 文字 | 弾く | 2 |
| UT-17 | 作成 | 前後の空白を除くと 50 文字（空白込みで 52 文字） | 通る | 2 |
| UT-18 | 作成 | `title` を省略 | 弾く | 2 |
| UT-19 | 作成 | 文字列でない値（数値 `123`） | 弾く | 2 |
| UT-20 | 更新 | `title` を省略 | 通る（他の項目だけ更新できる） | 2、4 |
| UT-21 | 更新 | 空白だけ `"   "` | 弾く | 2 |

### 1-3. 期限（`validation.ts`）

| ID | 操作 | 入力（今日 = 2026-11-08） | 期待する結果 | 根拠 |
|---|---|---|---|---|
| UT-31 | 作成 | `2026-11-07`（昨日） | 弾く（過去の日付） | 2 |
| UT-32 | 作成 | `2026-11-08`（今日） | 通る | 2 |
| UT-33 | 作成 | `2026-11-09`（明日） | 通る | 2 |
| UT-34 | 作成 | `dueDate` を省略 | 通る | 2 |
| UT-35 | 作成 | `2026/12/01`（区切りが違う） | 弾く | 2 |
| UT-36 | 作成 | `2026-12-1`（桁が足りない） | 弾く | 2 |
| UT-37 | 作成 | `2026-02-30`（存在しない日） | 弾く | 2 |
| UT-38 | 作成 | `2026-13-01`（存在しない月） | 弾く | 2 |
| UT-39 | 作成 | `2028-02-29`（うるう年の 2 月 29 日） | 通る | 2 |
| UT-40 | 作成 | `2027-02-29`（うるう年でない） | 弾く | 2 |
| UT-41 | 更新 | `2020-01-01`（過去） | 通る | 2 |
| UT-42 | 更新 | `null` | 通る（期限を消す） | 2 |
| UT-43 | 更新 | `2026/12/01`（形式が違う） | 弾く | 2 |

### 1-4. 優先度・ステータスの値と、決められていない項目（`validation.ts`）

| ID | 操作 | 入力 | 期待する結果 | 根拠 |
|---|---|---|---|---|
| UT-51 | 作成 | `priority` を省略 | 通る。`medium` になる | 2 |
| UT-52 | 作成 | `priority` に `low` / `medium` / `high` | 通る | 2 |
| UT-53 | 作成 | `priority` に `urgent` | 弾く | 2 |
| UT-54 | 更新 | `priority` に `urgent` | 弾く | 2 |
| UT-55 | ステータス変更 | `status` に `todo` / `in_progress` / `done` | 通る | 3 |
| UT-56 | ステータス変更 | `status` に `closed` | 弾く | 3 |
| UT-57 | ステータス変更 | `status` を省略 | 弾く | 3、4 |
| UT-58 | 一覧の絞り込み | `status=done&priority=high` | 通る | 4 |
| UT-59 | 一覧の絞り込み | `status=closed` | 弾く | 4 |
| UT-60 | 一覧の絞り込み | `priority=urgent` | 弾く | 4 |
| UT-61 | 作成 | `status` を含める | 弾く（決められていない項目） | 2 |
| UT-62 | 更新 | `status` を含める | 弾く（ステータスは専用のパスで変える） | 4 |
| UT-63 | 作成 / 更新 | 知らない項目（`foo`）を含める | 弾く | 2 |

## 2. シナリオテスト（`tests/scenarios/`）

1 つのシナリオで複数の API を順に呼び、途中の状態も確かめる。HTTP のステータスコードとレスポンスの中身の両方を書く。日時に依存するシナリオは、今日 = 2026-11-08 に固定する。

| ID | シナリオ | 手順 | 期待する結果 | 根拠 |
|---|---|---|---|---|
| ST-01 | 作成して着手し、完了する | 1. `POST /api/tasks` で作成<br>2. `PATCH /api/tasks/:id/status` で `in_progress`<br>3. 同じく `done` | 1. 201、`status` は `todo`、`completedAt` は null<br>2. 200、`status` は `in_progress`、`completedAt` は null<br>3. 200、`status` は `done`、`completedAt` に日時が入る | 3、4 |
| ST-02 | 完了したタスクを再オープンする | 1. 作成<br>2. `done` にする<br>3. `in_progress` に戻す | 2. `completedAt` に日時が入る<br>3. 200、`status` は `in_progress`、`completedAt` は null に戻る | 3、4 |
| ST-03 | 着手せずに完了する | 1. 作成<br>2. `todo` から直接 `done` | 2. 200、`status` は `done`、`completedAt` に日時が入る | 3、4 |
| ST-04 | 同じステータスに変更する | 1. 作成<br>2. `done` にする<br>3. もう一度 `done` | 3. 200、エラーにならない。`completedAt` は 2 の値のまま変わらない | 3、4 |
| ST-05 | 作成時の初期値 | 1. `title` だけで作成<br>2. `GET /api/tasks/:id` | 1. 201、`id` が採番され、`status` は `todo`、`priority` は `medium`、`dueDate` と `completedAt` は null、`createdAt` と `updatedAt` が入る<br>2. 200、1 と同じ内容 | 2、4 |
| ST-06 | タイトル・期限・優先度を更新する | 1. 作成<br>2. `PATCH /api/tasks/:id` で `title`・`dueDate`・`priority` を変更<br>3. `GET /api/tasks/:id` | 2. 200、3 つが変わり、`status` は `todo` のまま<br>3. 2 と同じ内容が返る | 2、4 |
| ST-07 | 期限を消す | 1. 期限付きで作成<br>2. `PATCH /api/tasks/:id` で `dueDate: null` | 2. 200、`dueDate` が null | 2、4 |
| ST-08 | 一覧を絞り込む | 1. `todo`/`high`、`todo`/`low`、`done`/`high` の 3 件を作る（ステータスは変更 API で）<br>2. `GET /api/tasks`<br>3. `GET /api/tasks?status=todo`<br>4. `GET /api/tasks?priority=high`<br>5. `GET /api/tasks?status=todo&priority=high` | 2. 200、3 件<br>3. 2 件<br>4. 2 件<br>5. 1 件 | 4 |
| ST-09 | 削除する | 1. 作成<br>2. `DELETE /api/tasks/:id`<br>3. `GET /api/tasks/:id`<br>4. `GET /api/tasks` | 2. 204<br>3. 404<br>4. 一覧に含まれない | 4 |
| ST-10 | タイトルの前後の空白が除かれて保存される | 1. `"  買い物  "` で作成<br>2. `GET /api/tasks/:id` | 1. 201、`title` は「買い物」<br>2. 同じ | 2、4 |

### 2-1. 直接 API を叩かれて不正な値が来たとき

画面を通さず API に直接送られた不正な値を弾けるかを確かめる。前提として、各ケースの前に `POST /api/tasks` で正常なタスクを 1 件作っておく（`:id` はそのタスクの id）。

| ID | リクエスト | 不正な点 | 期待する結果 | 根拠 |
|---|---|---|---|---|
| ST-11 | `POST /api/tasks` に `{}` | `title` がない | 400、`error` にメッセージ | 2、4 |
| ST-12 | `POST /api/tasks` に `{ "title": 123 }` | `title` が文字列でない | 400 | 2、4 |
| ST-13 | `POST /api/tasks` に 51 文字の `title` | 長すぎる | 400 | 2、4 |
| ST-14 | `POST /api/tasks` に `"title": "   "` | 空白だけ | 400 | 2、4 |
| ST-15 | `POST /api/tasks` に `"dueDate": "2026/12/01"` | 形式が違う | 400 | 2、4 |
| ST-16 | `POST /api/tasks` に `"dueDate": "2026-02-30"` | 存在しない日付 | 400 | 2、4 |
| ST-17 | `POST /api/tasks` に過去の `dueDate`（今日 = 2026-11-08、入力 `2026-11-07`） | 作成時の過去日付 | 400 | 2、4 |
| ST-18 | `POST /api/tasks` に `"priority": "urgent"` | 決められた値以外 | 400 | 2、4 |
| ST-19 | `POST /api/tasks` に `"status": "done"` を含める | 作成時にステータスを指定 | 400 | 2、4 |
| ST-20 | `POST /api/tasks` に JSON として壊れた本文 | 本文が解釈できない | 400 | 4 |
| ST-21 | `PATCH /api/tasks/:id` に `"priority": "urgent"` | 決められた値以外 | 400 | 2、4 |
| ST-22 | `PATCH /api/tasks/:id` に `"title": ""` | 空 | 400 | 2、4 |
| ST-23 | `PATCH /api/tasks/:id` に過去の `dueDate`（`2020-01-01`） | 更新時は過去も可 | 200。`dueDate` が更新される | 2 |
| ST-24 | `PATCH /api/tasks/:id` に `"status": "done"` | ステータスはこのパスでは変えられない | 400 | 4 |
| ST-25 | `PATCH /api/tasks/:id/status` に `"status": "closed"` | 決められた値以外 | 400 | 3、4 |
| ST-26 | `PATCH /api/tasks/:id/status` に `{}` | `status` がない | 400 | 4 |
| ST-27 | `done` のタスクに `PATCH /api/tasks/:id/status` で `"status": "todo"` | 許可されていない変更 | 409、`error` にメッセージ。`status` は `done` のまま | 3、4 |
| ST-28 | `GET /api/tasks?status=closed` | 絞り込みの値が不正 | 400 | 4 |
| ST-29 | `GET /api/tasks?priority=urgent` | 絞り込みの値が不正 | 400 | 4 |
| ST-30 | 存在しない id で `GET` / `PATCH` / `PATCH .../status` / `DELETE` | id がない | いずれも 404 | 4 |

仕様書に書かれていないため、ここで決めた点（違っていれば直す）：

- エラーの本文は `{ "error": "メッセージ" }` の形とする
- 決められていない項目（作成時の `status`、更新時の `status` など）が含まれていたら 400 で弾く

## 3. 今回は確かめないこと

- 画面（ブラウザ）のテスト。`docs/test-strategy.md` 5 のとおり
