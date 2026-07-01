'use client'

import type { Seniority } from '@/lib/types'

const SENIORITY_OPTIONS: { value: Seniority; label: string }[] = [
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid' },
  { value: 'senior', label: 'Senior' },
]

const SENIORITY_ACTIVE_STYLES: Record<Seniority, string> = {
  junior: 'bg-blue-600 text-white border-blue-600',
  mid: 'bg-amber-500 text-white border-amber-500',
  senior: 'bg-emerald-600 text-white border-emerald-600',
}

const SENIORITY_INACTIVE_STYLES: Record<Seniority, string> = {
  junior: 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50',
  mid: 'bg-white text-amber-700 border-amber-300 hover:bg-amber-50',
  senior: 'bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50',
}

interface FilterBarProps {
  name: string
  onNameChange: (value: string) => void
  seniorities: Seniority[]
  onSeniorityToggle: (level: Seniority) => void
  placeholder?: string
  ariaLabel?: string
}

export default function FilterBar({
  name,
  onNameChange,
  seniorities,
  onSeniorityToggle,
  placeholder = 'Buscar desenvolvedor...',
  ariaLabel = 'Search developers',
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder={placeholder}
          aria-label={ariaLabel}
          className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-2" role="group" aria-label="Filter by seniority">
        {SENIORITY_OPTIONS.map(({ value, label }) => {
          const isActive = seniorities.includes(value)
          return (
            <button
              key={value}
              type="button"
              onClick={() => onSeniorityToggle(value)}
              aria-pressed={isActive}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                isActive
                  ? SENIORITY_ACTIVE_STYLES[value]
                  : SENIORITY_INACTIVE_STYLES[value]
              } ${
                value === 'junior'
                  ? 'focus:ring-blue-500'
                  : value === 'mid'
                    ? 'focus:ring-amber-500'
                    : 'focus:ring-emerald-500'
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
