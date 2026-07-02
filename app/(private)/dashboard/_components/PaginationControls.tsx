interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  hasPrevious: boolean
  hasNext: boolean
  onPrevious: () => void
  onNext: () => void
}

export default function PaginationControls({
  currentPage,
  totalPages,
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between border-t border-ink-200 pt-4">
      <button
        type="button"
        onClick={onPrevious}
        disabled={!hasPrevious}
        className="rounded text-sm font-medium text-ink-600 transition-colors hover:text-rust-600 focus:outline-none focus:ring-2 focus:ring-rust-400 focus:ring-offset-2 focus:ring-offset-ink-50 disabled:cursor-not-allowed disabled:text-ink-300 disabled:hover:text-ink-300"
      >
        ← Anterior
      </button>
      <span className="text-xs tabular-nums tracking-wide text-ink-400">
        {currentPage} / {totalPages}
      </span>
      <button
        type="button"
        onClick={onNext}
        disabled={!hasNext}
        className="rounded text-sm font-medium text-ink-600 transition-colors hover:text-rust-600 focus:outline-none focus:ring-2 focus:ring-rust-400 focus:ring-offset-2 focus:ring-offset-ink-50 disabled:cursor-not-allowed disabled:text-ink-300 disabled:hover:text-ink-300"
      >
        Próxima →
      </button>
    </div>
  )
}
