import { NextResponse } from 'next/server';
import { getBaseUrl } from '@/lib/utils/api-helpers';

export async function GET() {
  const baseUrl = getBaseUrl();

  return NextResponse.json({
    name: 'william-x-john',
    version: '1.0.0',
    description:
      'Exclusive cofounder matching platform for MIT and Harvard students. Find your next cofounder through curated weekly matches, messaging, and events.',
    homepage: baseUrl,
    metadata: {
      openclaw: {
        emoji: '🤝',
        category: 'social',
        api_base: `${baseUrl}/api`,
      },
    },
  });
}
