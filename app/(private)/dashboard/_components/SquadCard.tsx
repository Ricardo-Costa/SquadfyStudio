import { type SquadCardData, SENIORITY_LABELS } from '@/lib/types'
import { formatCurrency } from '@/lib/squad/squads'

interface SquadCardProps {
  data: SquadCardData
  onClick?: () => void
}

export default function SquadCard({ data, onClick }: SquadCardProps) {
  const { squad, displayName, totalCost, avgSeniority, skillCoverage } = data

  function handleAvatarError(name: string) {
    return (e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget
      img.onerror = null
      img.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
    }
  }

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onClick()
        }
      }}
      className={`group flex flex-col border-t-2 border-ink-900 bg-ink-25 p-4 transition-colors hover:border-rust-500 ${
        onClick ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-rust-400 focus:ring-offset-2' : ''
      }`}
    >
      <p className="truncate font-display text-lg font-medium text-ink-900">{displayName}</p>

      <div className="mt-3 flex -space-x-2">
        {squad.members.slice(0, 5).map((member) => (
          <img
            key={member.id}
            src={member.avatar}
            alt={member.name}
            title={member.name}
            onError={handleAvatarError(member.name)}
            className="h-8 w-8 rounded-full border-2 border-ink-25 object-cover"
            width={32}
            height={32}
          />
        ))}
      </div>
      <p className="mt-1.5 text-xs text-ink-500">{squad.members.length} membros</p>

      <div className="mt-4 flex items-baseline divide-x divide-ink-200 border-t border-ink-200 pt-3">
        <div className="flex-1 pr-2">
          <p className="font-display text-lg font-semibold tabular-nums text-ink-900">{formatCurrency(totalCost)}</p>
          <p className="text-[10px] uppercase tracking-wide text-ink-500">Custo/hr</p>
        </div>
        <div className="flex-1 px-2">
          <p className="font-display text-lg font-semibold text-ink-900">
            {avgSeniority ? SENIORITY_LABELS[avgSeniority] : '—'}
          </p>
          <p className="text-[10px] uppercase tracking-wide text-ink-500">Senioridade</p>
        </div>
        <div className="flex-1 pl-2">
          <p className="font-display text-lg font-semibold tabular-nums text-ink-900">{skillCoverage.length}</p>
          <p className="text-[10px] uppercase tracking-wide text-ink-500">Habilidades</p>
        </div>
      </div>
    </div>
  )
}
