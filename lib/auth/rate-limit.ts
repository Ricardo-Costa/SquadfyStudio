import { RATE_LIMIT_MAX_ATTEMPTS, RATE_LIMIT_BLOCK_DURATION_MS } from '@/lib/config'

interface RateLimitEntry {
  count: number
  blockedUntil: number | null
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
  const entry = store.get(ip) ?? { count: 0, blockedUntil: null }
  const newCount = entry.count + 1

  store.set(ip, {
    count: newCount,
    blockedUntil: newCount >= RATE_LIMIT_MAX_ATTEMPTS ? Date.now() + RATE_LIMIT_BLOCK_DURATION_MS : null,
  })
}

export function resetAttempts(ip: string): void {
  store.delete(ip)
}
