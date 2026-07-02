import type { SavedSquad } from '@/lib/types'

export function formatSquadName(squad: SavedSquad): string {
  const name = squad.name?.trim()
  if (name) return name

  const date = new Date(squad.savedAt).toLocaleDateString('pt-BR')
  return `Squad salvo em ${date}`
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value)
}
