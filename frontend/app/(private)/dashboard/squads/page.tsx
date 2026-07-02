import SquadsView from '../_components/SquadsView'

export default function SquadsPage() {
  return (
    <main className="min-h-screen bg-ink-50 px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rust-600">
            Squads
          </p>
          <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl">
            Squads salvos
          </h1>
        </div>
        <SquadsView />
      </div>
    </main>
  )
}
