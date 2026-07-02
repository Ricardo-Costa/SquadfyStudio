'use client'

interface LoginInputProps {
  name: string
  label: string
  type?: string
  autoComplete?: string
}

export function LoginInput({ name, label, type = 'text', autoComplete }: LoginInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-xs font-semibold uppercase tracking-wide text-ink-500">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required
        className="w-full border-b border-ink-300 bg-transparent px-1 py-2 text-sm text-ink-900 outline-none transition-colors placeholder:text-ink-400 focus:border-rust-500 focus:ring-1 focus:ring-rust-400"
      />
    </div>
  )
}
