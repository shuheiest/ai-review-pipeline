"use client";

import { useState } from "react";

// 1 回目で確認を出し、2 回目で実行する。元に戻せない操作なので一手おく
export function DeleteButton({ onConfirm }: { onConfirm: () => void }) {
  const [confirming, setConfirming] = useState(false);
  if (!confirming) {
    return (
      <button type="button" className="btn btn-danger" onClick={() => setConfirming(true)}>
        このタスクを削除する
      </button>
    );
  }
  return (
    <div className="confirm" role="group" aria-label="削除の確認">
      <p className="confirm-text">本当に削除しますか？この操作は元に戻せません。</p>
      <div className="actions">
        <button type="button" className="btn btn-danger-solid" onClick={onConfirm}>
          削除する
        </button>
        <button type="button" className="btn btn-outline" onClick={() => setConfirming(false)}>
          キャンセル
        </button>
      </div>
    </div>
  );
}
