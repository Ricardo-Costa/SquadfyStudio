import DashboardCatalogue from '../_components/DashboardCatalogue'
import SquadEditLoader from '../_components/SquadEditLoader'

export default async function DashboardEditSquadPage({
  params,
}: {
  params: Promise<{ squadId: string }>
}) {
  const { squadId } = await params
  const parsedId = Number(squadId)

  return (
    <>
      {Number.isFinite(parsedId) && <SquadEditLoader squadId={parsedId} />}
      <DashboardCatalogue />
    </>
  )
}
