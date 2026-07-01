import Providers from '@/app/providers'
import { SquadProvider } from '@/context/squad/SquadContext'

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Providers>
      <SquadProvider>{children}</SquadProvider>
    </Providers>
  )
}
