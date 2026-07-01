'use client'

import { type Developer, SENIORITY_LABELS } from '@/lib/types'
import { useSquad } from '@/hooks/useSquad'
import { MAX_SQUAD_SIZE } from '@/lib/config'
import MetricsPanel from './MetricsPanel'
import SaveSquadButton from './SaveSquadButton'

interface RosterRowProps {
  member: Developer
  index: number
  onRemove: (id: string) => void
}

function RosterRow({ member, index, onRemove }: RosterRowProps) {
  function handleAvatarError(e: React.SyntheticEvent<HTMLImageElement>) {
    const img = e.currentTarget
    img.onerror = null
    img.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}`
  }

  return (
    <div className="group flex items-center gap-3 py-3">
      <span className="w-4 shrink-0 text-right text-xs tabular-nums text-graphite-500">
        {index + 1}
      </span>
      <img
        src={member.avatar}
        alt={member.name}
        onError={handleAvatarError}
        className="h-9 w-9 flex-shrink-0 rounded-full object-cover ring-1 ring-graphite-600"
        width={36}
        height={36}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-graphite-50">{member.name}</p>
        <p className="text-xs text-graphite-400">
          {SENIORITY_LABELS[member.seniority]} <span className="text-graphite-600">·</span>{' '}
          <span className="tabular-nums">${member.cost}/hr</span>
        </p>
      </div>
      <button
        onClick={() => onRemove(member.id)}
        aria-label={`Remover ${member.name} do squad`}
        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-graphite-400 transition-colors duration-150 hover:bg-graphite-800 hover:text-rust-400 focus:outline-none focus:ring-2 focus:ring-rust-400"
      >
        ×
      </button>
    </div>
  )
}

export default function SquadPanel() {
  const { members, count, isFull, removeMember, editingSquadName } = useSquad()

  return (
    <aside className="flex flex-col bg-graphite-700 text-graphite-50 lg:sticky lg:top-8 lg:self-start">
      <div className="px-5 pb-4 pt-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rust-400">
          {editingSquadName ? 'Editando' : 'Novo squad'}
        </p>
        <h2 className="mt-1 font-display text-2xl font-semibold text-graphite-50">
          {editingSquadName ?? 'Sem título'}
        </h2>

        <div className="mt-4 flex items-center gap-2" aria-hidden="true">
          {Array.from({ length: MAX_SQUAD_SIZE }).map((_, i) => (
            <span
              key={i}
              className={`h-1 flex-1 rounded-full ${
                i < count ? (isFull ? 'bg-rust-400' : 'bg-graphite-50') : 'bg-graphite-600'
              }`}
            />
          ))}
        </div>
        <p className="mt-2 text-xs tabular-nums text-graphite-400">
          {isFull ? `Squad completo — ${count}/${MAX_SQUAD_SIZE}` : `${count} de ${MAX_SQUAD_SIZE} membros`}
        </p>
      </div>

      <div className="flex-1 px-5">
        {count === 0 ? (
          <div className="border-t border-graphite-600 py-10 text-center">
            <p className="text-sm text-graphite-200">
              Seu squad começa aqui.
            </p>
            <p className="mt-1 text-xs text-graphite-400">
              Clique em &ldquo;Adicionar&rdquo; em qualquer perfil do catálogo.
            </p>
          </div>
        ) : (
          <ul role="list" className="divide-y divide-graphite-600 border-t border-graphite-600">
            {members.map((m, i) => (
              <li key={m.id} role="listitem">
                <RosterRow member={m} index={i} onRemove={removeMember} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {count > 0 && (
        <div className="space-y-4 px-5 pb-5 pt-4">
          <MetricsPanel />
          <SaveSquadButton />
        </div>
      )}
    </aside>
  )
}
