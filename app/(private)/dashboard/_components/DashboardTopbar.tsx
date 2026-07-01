import LogoutButton from './LogoutButton'

interface DashboardTopbarProps {
  email: string | null
}

export default function DashboardTopbar({ email }: DashboardTopbarProps) {
  return (
    <div className="flex items-center justify-end gap-3 border-b border-ink-200 bg-ink-25 px-4 py-3 sm:px-6 lg:px-10">
      {email && (
        <div className="hidden items-center gap-2 sm:flex">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-100 text-xs font-semibold text-ink-600"
            aria-hidden="true"
          >
            {email.charAt(0).toUpperCase()}
          </span>
          <span className="text-sm text-ink-600">{email}</span>
        </div>
      )}
      <LogoutButton />
    </div>
  )
}
