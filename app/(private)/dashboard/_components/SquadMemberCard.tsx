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

interface SquadMemberCardProps {
  member: Developer
  onRemove?: (id: string) => void
}

export default function SquadMemberCard({ member, onRemove }: SquadMemberCardProps) {
  const { name, avatar, seniority, cost } = member

  function handleAvatarError(e: React.SyntheticEvent<HTMLImageElement>) {
    const img = e.currentTarget
    img.onerror = null
    img.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
      <img
        src={avatar}
        alt={name}
        onError={handleAvatarError}
        className="h-9 w-9 flex-shrink-0 rounded-full object-cover"
        width={36}
        height={36}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-gray-900">{name}</p>
        <div className="mt-0.5 flex items-center gap-2">
          <span
            className={`inline-block rounded-full px-1.5 py-0.5 text-xs font-medium ${SENIORITY_STYLES[seniority]}`}
          >
            {SENIORITY_LABELS[seniority]}
          </span>
          <span className="text-xs text-gray-500">${cost}/hr</span>
        </div>
      </div>
      {onRemove && (
        <button
          onClick={() => onRemove(member.id)}
          aria-label="Remover do squad"
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors duration-150 hover:bg-red-100 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1"
        >
          ×
        </button>
      )}
    </div>
  )
}
