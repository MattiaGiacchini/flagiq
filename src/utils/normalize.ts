/**
 * Normalizes a string for fuzzy comparison:
 * - lowercase
 * - strip diacritics (accents, tildes, ñ→n, ü→u, etc.)
 * - collapse multiple spaces
 * - trim
 *
 * This lets "espana" match "España", "japon" match "Japón", etc.
 */
export function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')                     // decompose: "ñ" → "n" + combining tilde
    .replace(/[\u0300-\u036f]/g, '')      // strip all combining diacritical marks
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Returns true if the user input is a close-enough match for the target.
 * Accepts: exact match after normalization, or within 1 edit distance for
 * names longer than 4 chars (handles a single typo / missing letter).
 */
export function isCloseMatch(input: string, target: string): boolean {
  const a = normalize(input)
  const b = normalize(target)

  if (a === b) return true

  // For very short names, require exact match (no false positives)
  if (b.length <= 4) return false

  // Allow 1 edit distance (Levenshtein) for longer names
  return levenshtein(a, b) <= 1
}

function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  // Fast exits
  if (m === 0) return n
  if (n === 0) return m
  if (Math.abs(m - n) > 2) return 99   // early bail — can't be ≤1

  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  )

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i]![j] = dp[i - 1]![j - 1]!
      } else {
        dp[i]![j] = 1 + Math.min(dp[i - 1]![j]!, dp[i]![j - 1]!, dp[i - 1]![j - 1]!)
      }
    }
  }

  return dp[m]![n]!
}
