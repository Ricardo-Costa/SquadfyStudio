'use client'

import { useFormStatus } from 'react-dom'
import { logout } from '../../actions'

type LogoutButtonVariant = 'light' | 'dark'

const VARIANT_STYLES: Record<LogoutButtonVariant, string> = {
  light:
    'border-ink-300 text-ink-700 hover:border-rust-400 hover:text-rust-600 focus:ring-offset-ink-50',
  dark: 'border-graphite-600 text-graphite-50 hover:border-rust-400 hover:text-rust-400 focus:ring-offset-graphite-700',
}

function SubmitButton({ variant }: { variant: LogoutButtonVariant }) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-rust-400 focus:ring-offset-2 ${VARIANT_STYLES[variant]}`}
    >
      {pending ? 'Saindo…' : 'Sair'}
    </button>
  )
}

interface LogoutButtonProps {
  variant?: LogoutButtonVariant
}

export default function LogoutButton({ variant = 'light' }: LogoutButtonProps) {
  return (
    <form action={logout}>
      <SubmitButton variant={variant} />
    </form>
  )
}
