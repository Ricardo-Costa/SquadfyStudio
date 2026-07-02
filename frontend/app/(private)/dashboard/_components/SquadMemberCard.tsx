import { type Developer, SENIORITY_LABELS } from '@/lib/types'
import { formatCurrency } from '@/lib/squad/squads'

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
    <div className="flex items-center gap-3 py-3">
      <img
        src={avatar}
        alt={name}
        onError={handleAvatarError}
        className="h-9 w-9 flex-shrink-0 rounded-full object-cover ring-1 ring-graphite-600"
        width={36}
        height={36}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-graphite-50">{name}</p>
        <p className="text-xs text-graphite-400">
          {SENIORITY_LABELS[seniority]} <span className="text-graphite-600">·</span>{' '}
          <span className="tabular-nums">{formatCurrency(cost)}/hr</span>
        </p>
      </div>
      {onRemove && (
        <button
          onClick={() => onRemove(member.id)}
          aria-label="Remover do squad"
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-graphite-400 transition-colors duration-150 hover:bg-graphite-800 hover:text-rust-400 focus:outline-none focus:ring-2 focus:ring-rust-400"
        >
          ×
        </button>
      )}
    </div>
  )
}
