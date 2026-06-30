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
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required
        className={`
          w-full rounded-lg border px-3 py-2 text-sm shadow-sm outline-none
          transition-colors placeholder:text-gray-400
          focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
          ${error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'}
        `}
      />
      {error && (
        <p className="text-xs text-red-600 mt-0.5">{error}</p>
      )}
    </div>
  )
}
