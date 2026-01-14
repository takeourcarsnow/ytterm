import { RedditPost, Track, SortOption, TimeFilter } from '@/types';
import { extractYouTubeId, cleanTitle, generateId, getYouTubeThumbnail } from './utils';

const REDDIT_BASE_URL = 'https://www.reddit.com';

export async function fetchSubredditPosts(
  subreddit: string,
  sort: SortOption = 'hot',
  timeFilter: TimeFilter = 'week',
  limit: number = 100,
  after?: string
): Promise<{ posts: RedditPost[]; after: string | null }> {
  const params = new URLSearchParams({
    limit: limit.toString(),
    raw_json: '1',
  });
  
  if (after) params.set('after', after);
  if (sort === 'top') params.set('t', timeFilter);
  
  const url = `${REDDIT_BASE_URL}/r/${subreddit}/${sort}.json?${params}`;
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'ReddiTunes/1.0',
    },
    next: { revalidate: 300 }, // Cache for 5 minutes
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch from r/${subreddit}: ${response.status}`);
  }
  
  const data = await response.json();
  
  return {
    posts: data.data.children.map((child: { data: RedditPost }) => child.data),
    after: data.data.after,
  };
}

export function filterYouTubePosts(posts: RedditPost[]): RedditPost[] {
  return posts.filter((post) => {
    const url = post.url.toLowerCase();
    return (
      url.includes('youtube.com') ||
      url.includes('youtu.be') ||
      url.includes('youtube.com/embed')
    );
  });
}

export function convertPostToTrack(post: RedditPost): Track | null {
  const youtubeId = extractYouTubeId(post.url);
  if (!youtubeId) return null;
  
  const { title, artist } = cleanTitle(post.title);
  
  return {
    id: generateId(),
    youtubeId,
    title,
    artist,
    redditUrl: `${REDDIT_BASE_URL}${post.permalink}`,
    thumbnail: getYouTubeThumbnail(youtubeId),
    addedAt: post.created_utc * 1000,
  };
}

export async function fetchPlaylistFromSubreddit(
  subreddit: string,
  sort: SortOption = 'hot',
  timeFilter: TimeFilter = 'week',
  maxTracks: number = 50
): Promise<Track[]> {
  const tracks: Track[] = [];
  let after: string | undefined;
  let attempts = 0;
  const maxAttempts = 5;
  
  while (tracks.length < maxTracks && attempts < maxAttempts) {
    const { posts, after: nextAfter } = await fetchSubredditPosts(
      subreddit,
      sort,
      timeFilter,
      100,
      after
    );
    
    const youtubePosts = filterYouTubePosts(posts);
    
    for (const post of youtubePosts) {
      const track = convertPostToTrack(post);
      if (track && !tracks.some((t) => t.youtubeId === track.youtubeId)) {
        tracks.push(track);
        if (tracks.length >= maxTracks) break;
      }
    }
    
    if (!nextAfter) break;
    after = nextAfter;
    attempts++;
  }
  
  return tracks;
}
