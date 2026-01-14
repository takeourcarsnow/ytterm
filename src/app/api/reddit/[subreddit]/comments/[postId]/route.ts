import { NextRequest, NextResponse } from 'next/server';
import { fetchCommentsJson } from '@/lib/redditClient';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ subreddit: string; postId: string }> }
) {
  const { subreddit, postId } = await params;

  try {
    const data = await fetchCommentsJson(subreddit, postId);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching comments via reddit client:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
