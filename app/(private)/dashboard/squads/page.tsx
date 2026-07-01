import SquadsView from '../_components/SquadsView'

export default function SquadsPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Squads</h1>
        <SquadsView />
      </div>
    </main>
  )
}
