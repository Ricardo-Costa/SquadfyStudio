import { RATE_LIMIT_MAX_ATTEMPTS, RATE_LIMIT_BLOCK_DURATION_MS } from '@/lib/config'

interface RateLimitEntry {
  count: number
  blockedUntil: number | null
  lastAttemptAt: number
}

const store = new Map<string, RateLimitEntry>()

export function checkRateLimit(ip: string): { allowed: boolean; blockedUntil?: number } {
  const entry = store.get(ip)
  if (!entry) return { allowed: true }

  if (entry.blockedUntil !== null) {
    if (Date.now() < entry.blockedUntil) {
      return { allowed: false, blockedUntil: entry.blockedUntil }
    }
    store.delete(ip)
    return { allowed: true }
  }

  return { allowed: true }
}

export function recordFailedAttempt(ip: string): void {
  pruneStaleEntries()

  const entry = store.get(ip) ?? { count: 0, blockedUntil: null, lastAttemptAt: 0 }
  const newCount = entry.count + 1

  store.set(ip, {
    count: newCount,
    blockedUntil: newCount >= RATE_LIMIT_MAX_ATTEMPTS ? Date.now() + RATE_LIMIT_BLOCK_DURATION_MS : null,
    lastAttemptAt: Date.now(),
  })
}

export function resetAttempts(ip: string): void {
  store.delete(ip)
}

// This in-memory store never restarts on its own, so an IP that fails a few
// times but never reaches the block threshold (and never retries again) would
// otherwise sit here forever. Piggybacks on every failed attempt rather than
// a timer, since that's the only code path guaranteed to run periodically.
function pruneStaleEntries(): void {
  const now = Date.now()
  for (const [ip, entry] of store) {
    const expiredBlock = entry.blockedUntil !== null && now >= entry.blockedUntil
    const staleUnblocked =
      entry.blockedUntil === null && now - entry.lastAttemptAt > RATE_LIMIT_BLOCK_DURATION_MS
    if (expiredBlock || staleUnblocked) store.delete(ip)
  }
}
