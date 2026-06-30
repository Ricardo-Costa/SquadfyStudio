import Providers from '@/app/providers'

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <Providers>{children}</Providers>
}
