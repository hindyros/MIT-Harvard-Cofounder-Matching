import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Agent from '@/lib/models/Agent';
import { successResponse, errorResponse, generateApiKey, generateClaimToken, getBaseUrl, escapeRegex } from '@/lib/utils/api-helpers';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return errorResponse('Invalid request body', 'Expected a JSON object with "name" and "description"', 400);
    }

    const { name, description } = body as { name?: string; description?: string };

    if (!name || !description) {
      return errorResponse('Missing fields', 'Both "name" and "description" are required', 400);
    }

    const existing = await Agent.findOne({ name: new RegExp(`^${escapeRegex(name)}$`, 'i') });
    if (existing) {
      return errorResponse('Name taken', 'Choose a different agent name', 409);
    }

    const apiKey = generateApiKey();
    const claimToken = generateClaimToken();
    const baseUrl = getBaseUrl();

    await Agent.create({ name, description, apiKey, claimToken });

    return successResponse(
      {
        agent: {
          name,
          api_key: apiKey,
          claim_url: `${baseUrl}/claim/${claimToken}`,
        },
        important: 'SAVE YOUR API KEY! You cannot retrieve it later.',
      },
      201
    );
  } catch (err) {
    console.error('Agent registration error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return errorResponse('Server error', `Registration failed: ${message}`, 500);
  }
}
