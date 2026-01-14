import { NextRequest, NextResponse } from 'next/server';
import { fetchSubredditJson } from '@/lib/redditClient';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subreddit: string }> }
) {
  const { subreddit } = await params;
  const { searchParams } = new URL(request.url);
  const sort = searchParams.get('sort') || 'hot';
  const timeFilter = searchParams.get('t') || 'week';
  const limit = Number(searchParams.get('limit') || '100');
  const after = searchParams.get('after') || undefined;

  try {
    const data = await fetchSubredditJson(subreddit, sort, timeFilter, limit, after);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching from Reddit via client:', error);
    const status = (error instanceof Error && /Failed after/.test(error.message)) ? 429 : 500;
    return NextResponse.json({ error: 'Internal server error' }, { status });
  }
}