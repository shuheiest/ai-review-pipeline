"use client";

import { useState, type FormEvent } from "react";
import { PRIORITY_LABEL } from "@/client/labels";
import { PRIORITIES, type Priority } from "@/server/domain/task/task";

export type TaskFormValues = { title: string; dueDate: string | null; priority: Priority };

type Props = {
  initial?: TaskFormValues;
  submitLabel: string;
  onSubmit: (values: TaskFormValues) => void;
};

const empty: TaskFormValues = { title: "", dueDate: null, priority: "medium" };

export function TaskForm({ initial = empty, submitLabel, onSubmit }: Props) {
  const [values, setValues] = useState(initial);
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };
  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label className="label" htmlFor="title">
          タイトル<span className="badge badge-required">※必須</span>
        </label>
        <p className="support" id="title-support">
          前後の空白を除いて 1〜50 文字
        </p>
        <input
          id="title"
          className="input"
          aria-describedby="title-support"
          value={values.title}
          onChange={(e) => setValues({ ...values, title: e.target.value })}
        />
      </div>
      <div className="field">
        <label className="label" htmlFor="dueDate">
          期限<span className="badge badge-optional">任意</span>
        </label>
        <p className="support" id="dueDate-support">
          空欄にすると期限なしになります
        </p>
        <input
          id="dueDate"
          className="input"
          type="date"
          aria-describedby="dueDate-support"
          value={values.dueDate ?? ""}
          onChange={(e) => setValues({ ...values, dueDate: e.target.value || null })}
        />
      </div>
      <div className="field">
        <label className="label" htmlFor="priority">
          優先度
        </label>
        <select
          id="priority"
          className="select"
          value={values.priority}
          onChange={(e) => setValues({ ...values, priority: e.target.value as Priority })}
        >
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABEL[p]}
            </option>
          ))}
        </select>
      </div>
      <div className="actions">
        <button type="submit" className="btn btn-primary">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
