'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

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
      <ul className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href)
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                onClick={() => setIsOpen(false)}
                className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
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
        className="hidden shrink-0 border-r border-gray-200 bg-white px-4 py-6 lg:block lg:w-56"
      >
        <p className="mb-6 px-3 text-lg font-bold text-gray-900">Squadfy Studio</p>
        {renderLinks()}
      </nav>

      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 lg:hidden">
        <p className="text-lg font-bold text-gray-900">Squadfy Studio</p>
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={isOpen}
          aria-controls="mobile-nav-drawer"
          className="rounded-md p-2 text-gray-600 hover:bg-gray-100"
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
      </div>

      {/* Mobile overlay drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <nav
            id="mobile-nav-drawer"
            aria-label="Navegação principal"
            className="absolute inset-y-0 left-0 w-64 bg-white p-4 shadow-xl"
          >
            <div className="mb-6 flex items-center justify-between px-3">
              <p className="text-lg font-bold text-gray-900">Squadfy Studio</p>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Fechar menu"
                className="rounded-md p-2 text-gray-600 hover:bg-gray-100"
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
