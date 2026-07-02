// Central place for project-wide constants and configuration values.
// Keeping these here avoids the same magic number/URL being duplicated (and
// potentially drifting) across multiple files.

/** Base URL for the JSON Server mock API, as reachable from the browser. Configured via NEXT_PUBLIC_API_BASE_URL. */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001'

/**
 * Base URL for the JSON Server mock API, as reachable from the Next.js server process
 * (Server Actions). Only differs from API_BASE_URL under Docker Compose, where the browser
 * reaches the mock API via the host's published port but the server process reaches it via
 * the internal Docker network hostname (see docker-compose.yml). Falls back to API_BASE_URL
 * everywhere else (plain local dev, Vercel).
 */
export const SERVER_API_BASE_URL = process.env.API_BASE_URL ?? API_BASE_URL

/** Number of items shown per page in the Catalogue and Squads grids. */
export const PAGE_SIZE = 8

/** Maximum number of developers allowed in a single squad. */
export const MAX_SQUAD_SIZE = 5

/** How long the "Erro ao salvar" state stays visible before reverting to idle (ms). */
export const SAVE_ERROR_RESET_MS = 3000

/** Max characters shown for the logged-in email in the topbar before truncating with "…". */
export const EMAIL_DISPLAY_MAX_LENGTH = 24

/** Failed login attempts allowed before an IP is temporarily blocked. */
export const RATE_LIMIT_MAX_ATTEMPTS = 5

/** How long an IP stays blocked after exceeding RATE_LIMIT_MAX_ATTEMPTS (ms). */
export const RATE_LIMIT_BLOCK_DURATION_MS = 15 * 60 * 1000

/** Max characters accepted for the login e-mail field (RFC 5321 practical limit). */
export const EMAIL_MAX_LENGTH = 254

/** Max characters accepted for the login password field. */
export const PASSWORD_MAX_LENGTH = 128

/** Min characters (after trimming) required for a squad name. */
export const SQUAD_NAME_MIN_LENGTH = 2

/** Max characters (after trimming) accepted for a squad name. */
export const SQUAD_NAME_MAX_LENGTH = 60

/** Max characters accepted for the Catalogue/Squads search fields. */
export const SEARCH_MAX_LENGTH = 100
