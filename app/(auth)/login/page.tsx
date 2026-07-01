import { LoginForm } from './_components/LoginForm'

export default function LoginPage() {
  return (
    <main className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="flex flex-col justify-center bg-graphite-700 px-8 py-12 text-graphite-50 sm:px-12 lg:px-16">
        <p className="font-display text-2xl font-semibold tracking-tight">
          Squadfy<span className="text-rust-400">.</span>
        </p>
        <p className="mt-6 max-w-sm font-display text-3xl font-medium leading-tight sm:text-4xl">
          Monte o squad certo, um dev de cada vez.
        </p>
        <p className="mt-4 max-w-xs text-sm text-graphite-400">
          Catálogo, métricas e composição de squads em um só lugar para o Tech Lead decidir rápido.
        </p>
      </div>

      <div className="flex flex-col justify-center bg-ink-50 px-8 py-12 sm:px-12 lg:px-16">
        <div className="w-full max-w-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rust-600">
            Acesso
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-ink-900">Entrar</h1>
          <p className="mt-2 text-sm text-ink-500">
            Use suas credenciais para acessar o dashboard.
          </p>

          <div className="mt-8">
            <LoginForm />
          </div>
        </div>
      </div>
    </main>
  )
}
