// Central place for project-wide constants and configuration values.
// Keeping these here avoids the same magic number/URL being duplicated (and
// potentially drifting) across multiple files.

/** Base URL for the JSON Server mock API. Configured via NEXT_PUBLIC_API_BASE_URL. */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001'

/** Number of items shown per page in the Catalogue and Squads grids. */
export const PAGE_SIZE = 8

/** Maximum number of developers allowed in a single squad. */
export const MAX_SQUAD_SIZE = 5

/** How long the "Erro ao salvar" state stays visible before reverting to idle (ms). */
export const SAVE_ERROR_RESET_MS = 3000

/** Max characters shown for the logged-in email in the topbar before truncating with "…". */
export const EMAIL_DISPLAY_MAX_LENGTH = 24
