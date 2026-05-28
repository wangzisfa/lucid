'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSessions } from '@/lib/store';
import { BootScreen } from '@/components/screens/BootScreen';
import { ScreenStage } from '@/components/ScreenStage';

/**
 * `/` is the cold-start boot screen.
 * If the user already has at least one session, jump to /agents (or /session
 * if there's only one) so a page refresh doesn't trap them at the handshake.
 */
export default function HomePage() {
  const router = useRouter();
  const orderLength = useSessions((s) => s.order.length);
  const activeId = useSessions((s) => s.activeId);

  useEffect(() => {
    if (orderLength === 0) return;
    if (orderLength === 1 && activeId) router.replace('/session');
    else if (orderLength > 1) router.replace('/agents');
  }, [orderLength, activeId, router]);

  return (
    <ScreenStage devNav>
      <BootScreen />
    </ScreenStage>
  );
}
