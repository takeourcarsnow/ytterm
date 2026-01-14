import Bottleneck from 'bottleneck';
import { LRUCache } from 'lru-cache';

const REDDIT_BASE = 'https://www.reddit.com';

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

// In-memory cache (fallback). TTL in ms.
const cache = new LRUCache({ max: 1000, ttl: 30_000 });
const inFlight = new Map<string, Promise<any>>();

// Bottleneck limiter: configurable via env vars
const limiter = new Bottleneck({
  maxConcurrent: Number(process.env.REDDIT_MAX_CONCURRENCY || 2),
  minTime: Number(process.env.REDDIT_MIN_TIME_MS || 400),
});

// Pause until timestamp when we need to respect rate limits
let pausedUntil = 0;

async function fetchWithRetries(url: string, opts: RequestInit = {}, ttl = 30_000) {
  const key = url + JSON.stringify(opts || {});
  if (cache.has(key)) return cache.get(key);
  if (inFlight.has(key)) return inFlight.get(key);

  const job = limiter.schedule(async () => {
    const maxAttempts = 6;
    let attempt = 0;

    while (true) {
      attempt++;

      // If we're currently paused due to rate limits, wait
      if (pausedUntil > Date.now()) {
        const waitMs = pausedUntil - Date.now();
        await sleep(waitMs);
      }

      try {
        const res = await fetch(url, opts);

        // If 429 or server errors, handle backoff
        if (res.status === 429 || res.status >= 500) {
          const retryAfterHeader = res.headers.get('retry-after');
          const retryAfter = retryAfterHeader ? Number(retryAfterHeader) * 1000 : 0;
          const backoff = Math.min(30_000, (2 ** (attempt - 1)) * 500) + Math.floor(Math.random() * 200);
          const wait = Math.max(retryAfter, backoff);

          if (attempt >= maxAttempts) {
            const text = await res.text().catch(() => '');
            throw new Error(`Failed after ${attempt} attempts: ${res.status} ${text}`);
          }

          // If server told us to retry later, set a short pause
          if (retryAfter > 0) {
            pausedUntil = Date.now() + retryAfter;
          }

          await sleep(wait);
          continue; // retry
        }

        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(`HTTP error ${res.status}: ${text}`);
        }

        // Respect rate limit headers if present
        const remaining = Number(res.headers.get('x-ratelimit-remaining') || '0');
        const resetSec = Number(res.headers.get('x-ratelimit-reset') || '0');
        if (!Number.isNaN(remaining) && !Number.isNaN(resetSec)) {
          // If we're about to run out, pause until reset
          if (remaining <= 1 && resetSec > 0) {
            pausedUntil = Date.now() + resetSec * 1000;
          }
        }

        const json = await res.json();

        // Cache result
        cache.set(key, json, { ttl });
        return json;
      } catch (err) {
        if (attempt >= maxAttempts) throw err;
        // On network errors, backoff and retry
        const backoff = Math.min(30_000, (2 ** (attempt - 1)) * 500) + Math.floor(Math.random() * 200);
        await sleep(backoff);
        continue;
      }
    }
  });

  inFlight.set(key, job);
  try {
    return await job;
  } finally {
    inFlight.delete(key);
  }
}

export async function fetchSubredditJson(subreddit: string, sort = 'hot', timeFilter = 'week', limit = 100, after?: string) {
  const params = new URLSearchParams({ limit: String(limit), raw_json: '1' });
  if (after) params.set('after', after);
  if (sort === 'top') params.set('t', timeFilter);

  const url = `${REDDIT_BASE}/r/${subreddit}/${sort}.json?${params.toString()}`;

  // Use a slightly longer TTL for subreddit listings
  return fetchWithRetries(url, { headers: { 'User-Agent': 'ReddiTunes/1.0 (by /u/yourname)' } }, 30_000);
}

export async function fetchCommentsJson(subreddit: string, postId: string) {
  const url = `${REDDIT_BASE}/r/${subreddit}/comments/${postId}.json`;
  return fetchWithRetries(url, {}, 60_000);
}
