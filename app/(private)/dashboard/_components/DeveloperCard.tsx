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
}

export default function DeveloperCard({ developer }: DeveloperCardProps) {
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
    </div>
  )
}
