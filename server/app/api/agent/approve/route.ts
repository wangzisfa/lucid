import type { NextRequest } from 'next/server';
import { signalApproval } from '@/lib/agent-approval-bus';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CORS_HEADERS: Record<string, string> = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'POST, OPTIONS',
  'access-control-allow-headers': 'content-type',
  'access-control-max-age': '86400',
};

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as
    | { sessionId?: string; allow?: boolean }
    | null;

  const sessionId = body?.sessionId;
  if (!sessionId) {
    return Response.json({ error: 'sessionId required' }, { status: 400, headers: CORS_HEADERS });
  }

  const ok = signalApproval(sessionId, body?.allow !== false);
  return Response.json({ ok }, { headers: CORS_HEADERS });
}
