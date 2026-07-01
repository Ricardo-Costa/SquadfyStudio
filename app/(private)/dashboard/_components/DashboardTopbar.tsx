import LogoutButton from './LogoutButton'

interface DashboardTopbarProps {
  email: string | null
}

// Keeps the topbar compact regardless of how long the logged-in email is —
// the full address is still available via the cluster's title tooltip on hover.
const EMAIL_DISPLAY_MAX_LENGTH = 24

function truncateEmail(email: string): string {
  return email.length > EMAIL_DISPLAY_MAX_LENGTH
    ? `${email.slice(0, EMAIL_DISPLAY_MAX_LENGTH)}…`
    : email
}

export default function DashboardTopbar({ email }: DashboardTopbarProps) {
  return (
    <div className="flex items-center justify-end gap-3 border-b border-ink-200 bg-ink-25 px-4 py-3 sm:px-6 lg:px-10">
      {email && (
        <div className="hidden items-center gap-2 sm:flex" title={email}>
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink-100 text-xs font-semibold text-ink-600"
            aria-hidden="true"
          >
            {email.charAt(0).toUpperCase()}
          </span>
          <span className="text-sm text-ink-600">{truncateEmail(email)}</span>
        </div>
      )}
      <LogoutButton />
    </div>
  )
}
