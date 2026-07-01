'use client'

import { type Seniority, SENIORITY_LABELS } from '@/lib/types'

const SENIORITY_OPTIONS: { value: Seniority; label: string }[] = (
  ['junior', 'mid', 'senior'] as const
).map((value) => ({ value, label: SENIORITY_LABELS[value] }))

const SENIORITY_DOT: Record<Seniority, string> = {
  junior: 'bg-seniority-junior',
  mid: 'bg-seniority-mid',
  senior: 'bg-seniority-senior',
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
  placeholder = 'Buscar desenvolvedor…',
  ariaLabel = 'Search developers',
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-ink-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex-1 sm:max-w-xs">
        <svg
          className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
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
          className="w-full border-b border-ink-300 bg-transparent py-2 pl-6 pr-2 text-sm text-ink-900 placeholder-ink-400 focus:border-rust-500 focus:outline-none focus:ring-1 focus:ring-rust-400"
        />
      </div>

      <div className="flex gap-4" role="group" aria-label="Filter by seniority">
        {SENIORITY_OPTIONS.map(({ value, label }) => {
          const isActive = seniorities.includes(value)
          return (
            <button
              key={value}
              type="button"
              onClick={() => onSeniorityToggle(value)}
              aria-pressed={isActive}
              className={`flex items-center gap-1.5 rounded-sm border-b-2 pb-1 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rust-400 focus-visible:ring-offset-2 ${
                isActive
                  ? 'border-rust-500 text-ink-900'
                  : 'border-transparent text-ink-400 hover:text-ink-700'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${SENIORITY_DOT[value]}`} aria-hidden="true" />
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
