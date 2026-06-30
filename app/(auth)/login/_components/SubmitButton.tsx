'use client'

import { useFormStatus } from 'react-dom'

export function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className={`
        w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white
        transition-all duration-150 focus:outline-none focus:ring-2
        focus:ring-indigo-500 focus:ring-offset-2
        ${pending
          ? 'bg-indigo-400 cursor-not-allowed'
          : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800'
        }
      `}
    >
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Entrando…
        </span>
      ) : (
        'Entrar'
      )}
    </button>
  )
}
