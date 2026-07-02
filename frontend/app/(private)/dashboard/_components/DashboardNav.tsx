'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LogoutButton from './LogoutButton'

interface NavItem {
  label: string
  href: string
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Catálogo', href: '/dashboard' },
  { label: 'Squads', href: '/dashboard/squads' },
]

function isActive(pathname: string, href: string): boolean {
  if (href !== '/dashboard') return pathname.startsWith(href)
  // Catálogo also covers /dashboard/<squad-id> (edit mode), but not /dashboard/squads
  return pathname === '/dashboard' || /^\/dashboard\/\d+$/.test(pathname)
}

export default function DashboardNav() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  function renderLinks() {
    return (
      <ul className="space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href)
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                onClick={() => setIsOpen(false)}
                className={`relative block py-2 pl-4 pr-3 text-sm font-medium tracking-wide transition-colors ${
                  active
                    ? 'text-graphite-50'
                    : 'text-graphite-400 hover:text-graphite-50'
                }`}
              >
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-1 left-0 w-[3px] rounded-full bg-rust-400"
                  />
                )}
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <>
      {/* Desktop sidebar */}
      <nav
        aria-label="Navegação principal"
        className="hidden shrink-0 bg-graphite-700 px-3 py-8 lg:block lg:w-60"
      >
        <p className="mb-10 px-4 font-display text-xl font-semibold tracking-tight text-graphite-50">
          Squadfy<span className="text-rust-400">.</span>
        </p>
        {renderLinks()}
      </nav>

      {/* Mobile top bar */}
      <div className="flex items-center gap-3 bg-graphite-700 px-4 py-3 lg:hidden">
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={isOpen}
          aria-controls="mobile-nav-drawer"
          className="-ml-2 rounded-md p-2 text-graphite-200 hover:bg-graphite-800 hover:text-graphite-50"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"
            />
          </svg>
        </button>
        <p className="font-display text-lg font-semibold tracking-tight text-graphite-50">
          Squadfy<span className="text-rust-400">.</span>
        </p>
        <div className="ml-auto">
          <LogoutButton variant="dark" />
        </div>
      </div>

      {/* Mobile overlay drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-graphite-800/60"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <nav
            id="mobile-nav-drawer"
            aria-label="Navegação principal"
            className="absolute inset-y-0 left-0 w-64 bg-graphite-700 p-4 shadow-xl"
          >
            <div className="mb-8 flex items-center justify-between px-3">
              <p className="font-display text-lg font-semibold tracking-tight text-graphite-50">
                Squadfy<span className="text-rust-400">.</span>
              </p>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Fechar menu"
                className="rounded-md p-2 text-graphite-200 hover:bg-graphite-800 hover:text-graphite-50"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {renderLinks()}
          </nav>
        </div>
      )}
    </>
  )
}
