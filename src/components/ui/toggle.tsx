type ToggleProps = {
  checked: boolean
  onChange: (v: boolean) => void
}

export default function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-8 h-4.5 rounded-full transition-colors relative shrink-0 cursor-pointer ${
        checked ? 'bg-blue-500' : 'bg-neutral-300 dark:bg-neutral-600'
      }`}
    >
      <span
        className={`absolute top-0.75 left-0.75 w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${
          checked ? 'translate-x-3.5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}
