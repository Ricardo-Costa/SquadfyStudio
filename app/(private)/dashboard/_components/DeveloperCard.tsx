import type { Developer } from '@/lib/types'

const SENIORITY_STYLES: Record<Developer['seniority'], string> = {
  junior: 'bg-blue-100 text-blue-700',
  mid: 'bg-amber-100 text-amber-700',
  senior: 'bg-emerald-100 text-emerald-700',
}

const SENIORITY_LABELS: Record<Developer['seniority'], string> = {
  junior: 'Junior',
  mid: 'Mid',
  senior: 'Senior',
}

interface DeveloperCardProps {
  developer: Developer
  isInSquad?: boolean
  isFull?: boolean
  onAdd?: (dev: Developer) => void
}

export default function DeveloperCard({
  developer,
  isInSquad = false,
  isFull = false,
  onAdd,
}: DeveloperCardProps) {
  const { name, avatar, seniority, cost, skills } = developer

  function handleAvatarError(e: React.SyntheticEvent<HTMLImageElement>) {
    const img = e.currentTarget
    img.onerror = null
    img.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
  }

  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center gap-3">
        <img
          src={avatar}
          alt={name}
          onError={handleAvatarError}
          className="h-12 w-12 rounded-full object-cover"
          width={48}
          height={48}
        />
        <div className="min-w-0">
          <p className="truncate font-semibold text-gray-900">{name}</p>
          <span
            className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${SENIORITY_STYLES[seniority]}`}
          >
            {SENIORITY_LABELS[seniority]}
          </span>
        </div>
      </div>

      <p className="mt-3 text-sm font-medium text-gray-600">${cost}/hr</p>

      <div className="mt-2 flex flex-wrap gap-1">
        {skills.map((skill) => (
          <span
            key={skill}
            className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="mt-4">
        {isInSquad ? (
          <span className="inline-flex w-full items-center justify-center rounded-lg bg-emerald-100 px-3 py-1.5 text-sm font-medium text-emerald-700">
            ✓ No Squad
          </span>
        ) : isFull ? (
          <button
            disabled
            aria-disabled="true"
            aria-label="Adicionar ao squad"
            className="w-full cursor-not-allowed rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-400 opacity-50"
          >
            Adicionar
          </button>
        ) : (
          <button
            onClick={() => onAdd?.(developer)}
            aria-label="Adicionar ao squad"
            className="w-full rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Adicionar
          </button>
        )}
      </div>
    </div>
  )
}
