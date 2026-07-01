'use client'

interface LoginInputProps {
  name: string
  label: string
  type?: string
  error?: string
  autoComplete?: string
}

export function LoginInput({ name, label, type = 'text', error, autoComplete }: LoginInputProps) {
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
        className={`
          w-full border-b bg-transparent px-1 py-2 text-sm text-ink-900 outline-none
          transition-colors placeholder:text-ink-400
          focus:border-rust-500
          ${error ? 'border-red-400' : 'border-ink-300'}
        `}
      />
      {error && (
        <p className="text-xs text-red-600 mt-0.5">{error}</p>
      )}
    </div>
  )
}
