'use client'

import { useActionState } from 'react'
import { login } from '../actions'
import { EMAIL_MAX_LENGTH, PASSWORD_MAX_LENGTH } from '@/lib/config'
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
        maxLength={EMAIL_MAX_LENGTH}
      />
      <LoginInput
        name="password"
        label="Senha"
        type="password"
        autoComplete="current-password"
        maxLength={PASSWORD_MAX_LENGTH}
      />

      {state.status === 'error' && (
        <>
          {state.code === 'rate_limited' ? (
            <div className="border-l-2 border-amber-500 pl-3 text-sm text-amber-700">
              Muitas tentativas. Tente novamente em 15 minutos.
            </div>
          ) : state.code === 'validation_error' ? (
            <p className="text-sm text-red-600">{state.message}</p>
          ) : (
            <p className="text-sm text-red-600">
              E-mail ou senha inválidos.
            </p>
          )}
        </>
      )}

      <SubmitButton />
    </form>
  )
}
