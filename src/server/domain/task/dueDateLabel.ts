// 期限の見せ方。today と dueDate は YYYY-MM-DD
export function dueDateLabel(dueDate: string | null, today: string): string {
  if (dueDate === null) return "期限なし";
  if (dueDate < today) return "期限切れ";
  if (dueDate === today) return "今日";
  const days = (Date.parse(dueDate) - Date.parse(today)) / 86400000;
  if (days === 1) return "明日";
  if (days <= 7) return `あと ${days} 日`;
  return dueDate;
}
