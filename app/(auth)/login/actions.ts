'use server'

import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { signToken } from '@/lib/auth'
import { checkRateLimit, recordFailedAttempt, resetAttempts } from '@/lib/rate-limit'

type LoginErrorCode = 'invalid_credentials' | 'rate_limited' | 'server_error'

export type LoginActionState =
  | { status: 'idle' }
  | { status: 'success' }
  | { status: 'error'; code: LoginErrorCode; message: string }

export async function login(
  _prevState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const headersList = await headers()
    const ip =
      headersList.get('x-forwarded-for')?.split(',')[0].trim() ??
      headersList.get('x-real-ip') ??
      'unknown'

    const rateLimit = checkRateLimit(ip)
    if (!rateLimit.allowed) {
      return {
        status: 'error',
        code: 'rate_limited',
        message: 'Muitas tentativas. Tente novamente em 15 minutos.',
      }
    }

    const validEmail = process.env.AUTH_EMAIL
    const validPassword = process.env.AUTH_PASSWORD

    if (email !== validEmail || password !== validPassword) {
      recordFailedAttempt(ip)
      return {
        status: 'error',
        code: 'invalid_credentials',
        message: 'E-mail ou senha inválidos.',
      }
    }

    const token = await signToken({ sub: email })
    resetAttempts(ip)

    const cookieStore = await cookies()
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 86400,
    })
  } catch {
    return {
      status: 'error',
      code: 'server_error',
      message: 'Ocorreu um erro inesperado. Tente novamente.',
    }
  }

  redirect('/dashboard')
}
