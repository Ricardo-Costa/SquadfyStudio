import CatalogueView from './CatalogueView'
import SquadPanel from './SquadPanel'
import NewSquadButton from './NewSquadButton'

export default function DashboardCatalogue() {
  return (
    <main className="min-h-screen bg-ink-50 px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rust-600">
              Catálogo
            </p>
            <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl">
              Developer Catalogue
            </h1>
          </div>
          <NewSquadButton />
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          <div className="order-2 lg:order-1">
            <CatalogueView />
          </div>
          <div className="order-1 lg:order-2">
            <SquadPanel />
          </div>
        </div>
      </div>
    </main>
  )
}
