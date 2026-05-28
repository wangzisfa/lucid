import type { NextRequest } from 'next/server';
import { signalApproval } from '@/lib/agent-approval-bus';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as
    | { sessionId?: string; allow?: boolean }
    | null;

  const sessionId = body?.sessionId;
  if (!sessionId) {
    return Response.json({ error: 'sessionId required' }, { status: 400 });
  }

  const ok = signalApproval(sessionId, body?.allow !== false);
  return Response.json({ ok });
}
