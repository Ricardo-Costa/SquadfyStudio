'use client'

import { useFormStatus } from 'react-dom'
import { logout } from '../../actions'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full border border-ink-300 px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:border-rust-400 hover:text-rust-600 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-rust-400 focus:ring-offset-2 focus:ring-offset-ink-50"
    >
      {pending ? 'Saindo…' : 'Sair'}
    </button>
  )
}

export default function LogoutButton() {
  return (
    <form action={logout}>
      <SubmitButton />
    </form>
  )
}
