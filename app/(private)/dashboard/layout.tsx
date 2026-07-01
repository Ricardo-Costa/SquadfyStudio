import DashboardNav from './_components/DashboardNav'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="lg:flex">
      <DashboardNav />
      <div className="flex-1">{children}</div>
    </div>
  )
}
