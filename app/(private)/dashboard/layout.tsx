import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import DashboardNav from './_components/DashboardNav'
import DashboardTopbar from './_components/DashboardTopbar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value
  const payload = token ? await verifyToken(token) : null

  return (
    <div className="lg:flex">
      <DashboardNav />
      <div className="flex-1">
        <DashboardTopbar email={payload?.sub ?? null} />
        {children}
      </div>
    </div>
  )
}
