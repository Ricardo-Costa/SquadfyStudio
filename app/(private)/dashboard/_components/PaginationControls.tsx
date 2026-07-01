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
    <div className="flex items-center justify-center gap-4 pt-2">
      <button
        type="button"
        onClick={onPrevious}
        disabled={!hasPrevious}
        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Previous
      </button>
      <span className="text-sm text-gray-600">
        Page {currentPage} of {totalPages}
      </span>
      <button
        type="button"
        onClick={onNext}
        disabled={!hasNext}
        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Next
      </button>
    </div>
  )
}
