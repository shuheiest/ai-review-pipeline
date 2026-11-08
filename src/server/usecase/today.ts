// 日本時間での今日（YYYY-MM-DD）。サーバーがどこで動いていても日本時間で判定する（docs/spec.md 2.）
// domain は現在時刻を読まないので、ここで求めて渡す
const JST_DATE = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo" });

export function today(): string {
  return JST_DATE.format(new Date());
}
