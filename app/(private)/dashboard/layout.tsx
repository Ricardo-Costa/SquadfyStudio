import DashboardNav from './_components/DashboardNav'
import LogoutButton from './_components/LogoutButton'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="lg:flex">
      <DashboardNav />
      <div className="flex-1">
        <div className="flex justify-end px-4 py-3 sm:px-6 lg:px-10">
          <LogoutButton />
        </div>
        {children}
      </div>
    </div>
  )
}
