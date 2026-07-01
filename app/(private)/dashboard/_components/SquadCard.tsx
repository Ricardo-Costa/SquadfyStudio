import type { SquadCardData } from '@/lib/types'

const SENIORITY_LABELS = {
  junior: 'Junior',
  mid: 'Mid',
  senior: 'Senior',
}

interface SquadCardProps {
  data: SquadCardData
}

export default function SquadCard({ data }: SquadCardProps) {
  const { squad, displayName, totalCost, avgSeniority, skillCoverage } = data

  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <p className="truncate font-semibold text-gray-900">{displayName}</p>

      <div className="mt-3 flex -space-x-2">
        {squad.members.slice(0, 5).map((member) => (
          <img
            key={member.id}
            src={member.avatar}
            alt={member.name}
            title={member.name}
            className="h-8 w-8 rounded-full border-2 border-white object-cover"
            width={32}
            height={32}
          />
        ))}
      </div>
      <p className="mt-1 text-xs text-gray-500">{squad.members.length} membros</p>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-gray-50 p-2 text-center">
          <p className="text-xs text-gray-500">Custo/hr</p>
          <p className="mt-0.5 text-sm font-bold text-gray-900">${totalCost}</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-2 text-center">
          <p className="text-xs text-gray-500">Seniority</p>
          <p className="mt-0.5 text-sm font-bold text-gray-900">
            {avgSeniority ? SENIORITY_LABELS[avgSeniority] : '—'}
          </p>
        </div>
        <div className="rounded-lg bg-gray-50 p-2 text-center">
          <p className="text-xs text-gray-500">Skills</p>
          <p className="mt-0.5 text-sm font-bold text-gray-900">{skillCoverage.length}</p>
        </div>
      </div>
    </div>
  )
}
