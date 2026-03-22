type SelectNativeProps = {
  value: string | number
  options: { label: string; value: string | number }[]
  onChange: (v: string) => void
}

export default function SelectNative({ value, options, onChange }: SelectNativeProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-[11px] bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md px-2 py-1 text-neutral-600 dark:text-neutral-300 cursor-pointer"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}
