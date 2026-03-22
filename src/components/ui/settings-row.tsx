type SettingsRowProps = {
  label: string
  description?: string
  children: React.ReactNode
}

export default function SettingsRow({ label, description, children }: SettingsRowProps) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
      <div>
        <div className="text-[12px] text-neutral-600 dark:text-neutral-300">{label}</div>
        {description && <div className="text-[10px] text-neutral-400 mt-0.5">{description}</div>}
      </div>
      {children}
    </div>
  )
}
