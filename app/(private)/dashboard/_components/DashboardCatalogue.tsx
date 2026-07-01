import CatalogueView from './CatalogueView'
import SquadPanel from './SquadPanel'
import NewSquadButton from './NewSquadButton'

export default function DashboardCatalogue() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Developer Catalogue
          </h1>
          <NewSquadButton />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
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
