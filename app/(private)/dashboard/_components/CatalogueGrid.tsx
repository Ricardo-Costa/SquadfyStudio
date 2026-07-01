import type { Developer } from '@/lib/types'
import DeveloperCard from './DeveloperCard'

interface CatalogueGridProps {
  developers: Developer[]
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  isMember?: (id: string) => boolean
  isFull?: boolean
  onAdd?: (dev: Developer) => void
}

function SkeletonCard() {
  return (
    <div
      className="flex flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
      aria-hidden="true"
    >
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 animate-pulse rounded-full bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
          <div className="h-3 w-1/3 animate-pulse rounded-full bg-gray-200" />
        </div>
      </div>
      <div className="mt-3 h-3 w-1/4 animate-pulse rounded bg-gray-200" />
      <div className="mt-2 flex gap-1">
        <div className="h-5 w-12 animate-pulse rounded-full bg-gray-200" />
        <div className="h-5 w-16 animate-pulse rounded-full bg-gray-200" />
        <div className="h-5 w-10 animate-pulse rounded-full bg-gray-200" />
      </div>
    </div>
  )
}

export default function CatalogueGrid({
  developers,
  isLoading,
  isError,
  onRetry,
  isMember,
  isFull = false,
  onAdd,
}: CatalogueGridProps) {
  if (isLoading) {
    return (
      <div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        aria-busy="true"
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 py-16 text-center">
        <p className="text-base font-medium text-red-700">
          Não foi possível carregar o catálogo.
        </p>
        <p className="mt-1 text-sm text-red-500">
          Verifique se o servidor está disponível.
        </p>
        <button
          onClick={onRetry}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  if (developers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50 py-16 text-center">
        <p className="text-base font-medium text-gray-700">
          Nenhum desenvolvedor encontrado.
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Tente limpar os filtros para ver todos os perfis.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {developers.map((dev) => (
        <DeveloperCard
          key={dev.id}
          developer={dev}
          isInSquad={isMember?.(dev.id) ?? false}
          isFull={isFull}
          onAdd={onAdd}
        />
      ))}
    </div>
  )
}
