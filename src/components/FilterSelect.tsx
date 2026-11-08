"use client";

type Props<T extends string> = {
  id: string;
  label: string;
  options: readonly T[];
  labels: Record<T, string>;
  value: T | "";
  onChange: (value: T | "") => void;
};

export function FilterSelect<T extends string>({ id, label, options, labels, value, onChange }: Props<T>) {
  return (
    <div className="field">
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <select id={id} className="select" value={value} onChange={(e) => onChange(e.target.value as T | "")}>
        <option value="">すべて</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {labels[o]}
          </option>
        ))}
      </select>
    </div>
  );
}
