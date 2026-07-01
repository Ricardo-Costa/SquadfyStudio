import type { SavedSquad } from '@/lib/types'

export function formatSquadName(squad: SavedSquad): string {
  const name = squad.name?.trim()
  if (name) return name

  const date = new Date(squad.savedAt).toLocaleDateString('pt-BR')
  return `Squad salvo em ${date}`
}
