import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';

export function successResponse(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(error: string, hint: string, status: number) {
  return NextResponse.json({ success: false, error, hint }, { status });
}

export function generateApiKey(): string {
  return `fc_${nanoid(32)}`;
}

export function generateClaimToken(): string {
  return `fc_claim_${nanoid(24)}`;
}

export function extractApiKey(header: string | null): string | null {
  if (!header) return null;
  return header.replace('Bearer ', '').trim() || null;
}

export function getBaseUrl(): string {
  return process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}
