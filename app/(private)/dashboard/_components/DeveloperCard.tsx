import { type Developer, SENIORITY_LABELS } from '@/lib/types'

const SENIORITY_DOT: Record<Developer['seniority'], string> = {
  junior: 'bg-seniority-junior',
  mid: 'bg-seniority-mid',
  senior: 'bg-seniority-senior',
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
    <div className="group flex flex-col border-b border-ink-200 py-5 transition-colors last:border-b-0">
      <div className="flex items-start gap-3">
        <img
          src={avatar}
          alt={name}
          onError={handleAvatarError}
          className="h-12 w-12 flex-shrink-0 rounded-full object-cover ring-1 ring-ink-200"
          width={48}
          height={48}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg font-medium text-ink-900">{name}</p>
          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-500">
            <span className={`h-1.5 w-1.5 rounded-full ${SENIORITY_DOT[seniority]}`} aria-hidden="true" />
            {SENIORITY_LABELS[seniority]}
            <span className="text-ink-300">·</span>
            <span className="tabular-nums">${cost}/hr</span>
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-ink-500">
        {skills.join(' · ')}
      </p>

      <div className="mt-4">
        {isInSquad ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-seniority-senior">
            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                clipRule="evenodd"
              />
            </svg>
            Adicionado
          </span>
        ) : isFull ? (
          <button
            disabled
            aria-disabled="true"
            aria-label="Adicionar ao squad"
            className="w-full cursor-not-allowed rounded-full border border-ink-200 py-1.5 text-sm font-medium text-ink-300"
          >
            Adicionar
          </button>
        ) : (
          <button
            onClick={() => onAdd?.(developer)}
            aria-label="Adicionar ao squad"
            className="w-full rounded-full border border-ink-300 py-1.5 text-sm font-medium text-ink-700 transition-colors duration-150 hover:border-rust-500 hover:bg-rust-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-rust-400 focus:ring-offset-2 focus:ring-offset-ink-50"
          >
            Adicionar
          </button>
        )}
      </div>
    </div>
  )
}
