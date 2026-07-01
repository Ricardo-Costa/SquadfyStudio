'use client'

import { useActionState } from 'react'
import { login } from '../actions'
import { LoginInput } from './LoginInput'
import { SubmitButton } from './SubmitButton'

export function LoginForm() {
  const [state, formAction] = useActionState(login, { status: 'idle' as const })

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <LoginInput
        name="email"
        label="E-mail"
        type="email"
        autoComplete="email"
      />
      <LoginInput
        name="password"
        label="Senha"
        type="password"
        autoComplete="current-password"
      />

      {state.status === 'error' && (
        <>
          {state.code === 'rate_limited' ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              Muitas tentativas. Tente novamente em 15 minutos.
            </div>
          ) : (
            <p className="text-center text-sm text-red-600">
              E-mail ou senha inválidos.
            </p>
          )}
        </>
      )}

      <SubmitButton />
    </form>
  )
}
