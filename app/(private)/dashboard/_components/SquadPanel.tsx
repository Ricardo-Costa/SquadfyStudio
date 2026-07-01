'use client'

import { useSquad } from '@/hooks/useSquad'
import SquadMemberCard from './SquadMemberCard'
import MetricsPanel from './MetricsPanel'
import SaveSquadButton from './SaveSquadButton'

export default function SquadPanel() {
  const { members, count, isFull, removeMember, editingSquadName } = useSquad()

  return (
    <aside className="flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm lg:sticky lg:top-8 lg:self-start">
      <div className="border-b border-gray-200 px-4 py-3">
        <h2 className="font-semibold text-gray-900">
          Squad: {editingSquadName ?? '...'}
        </h2>
        <p
          className={`mt-0.5 text-sm font-semibold ${
            isFull ? 'text-amber-600' : 'text-gray-500'
          }`}
        >
          {isFull ? `Squad completo! (${count}/5)` : `${count}/5 membros`}
        </p>
      </div>

      <div className="flex-1 p-4">
        {count === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <svg
              className="h-10 w-10 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
              />
            </svg>
            <p className="mt-3 text-sm text-gray-500">
              Nenhum membro selecionado.
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Adicione desenvolvedores do catálogo.
            </p>
          </div>
        ) : (
          <ul role="list" className="space-y-2">
            {members.map((m) => (
              <li key={m.id} role="listitem">
                <SquadMemberCard member={m} onRemove={removeMember} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {count > 0 && (
        <div className="border-t border-gray-100 p-4 space-y-3">
          <MetricsPanel />
          <SaveSquadButton />
        </div>
      )}
    </aside>
  )
}
