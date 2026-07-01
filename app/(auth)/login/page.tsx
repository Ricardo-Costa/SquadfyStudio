import { LoginForm } from './_components/LoginForm'

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Squadfy Studio</h1>
          <p className="mt-1 text-sm text-gray-500">
            Entre com suas credenciais para continuar
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-md">
          <LoginForm />
        </div>
      </div>
    </main>
  )
}
