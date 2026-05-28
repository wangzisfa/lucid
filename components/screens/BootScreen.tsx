'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TermPhone } from '../TermPhone';
import { VimBar } from '../VimBar';
import { Cursor } from '../Cursor';
import { FloatingMenu } from '../GlobalNav';

/**
 * 01-boot — cold-start handshake.
 * Tap anywhere or press Enter → /repos.
 */
export function BootScreen() {
  const router = useRouter();

  useEffect(() => {
    router.prefetch('/repos');
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        router.push('/repos');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [router]);

  const bootLines = [
    { tone: 'mint', text: '✓ runtime: bun 1.1.0' },
    { tone: 'mint', text: '✓ agent: claude-sonnet-4.5 · 200K' },
    { tone: 'mint', text: '✓ voice: whisper-v3 · 0.4s latency' },
    { tone: 'mint', text: '✓ workspace: 4 projects · 142 commits' },
    { tone: 'mid',  text: '→ load last session? ./idea-garden' },
  ] as const;

  const tryCommands = [
    { text: 'lucid new "habit tracker w/ lunar themes"', tone: 'mid' },
    { text: 'lucid clone github.com/me/idea-garden',     tone: 'mid' },
    { text: 'lucid hold-to-speak ▶',                     tone: 'cyan' },
  ] as const;

  return (
    <TermPhone>
      <FloatingMenu />
      <div
        onClick={() => router.push('/repos')}
        style={{
          height: 'calc(100% - 30px)',
          padding: '20px 18px 36px',
          fontFamily: 'var(--font-mono)',
          fontSize: 11.5,
          color: 'var(--text-hi)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          position: 'relative',
          zIndex: 2,
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div
              style={{
                width: 8,
                height: 8,
                background: 'var(--violet)',
                boxShadow: '0 0 8px var(--violet)',
                animation: 'breathe 1.4s ease-in-out infinite',
              }}
            />
            <span style={{ color: 'var(--text-hi)', fontWeight: 600 }}>LUCID</span>
            <span style={{ color: 'var(--text-lo)' }}>·</span>
            <span style={{ color: 'var(--text-lo)' }}>v0.3.1-beta</span>
          </div>
          <span style={{ color: 'var(--text-lo)', fontSize: 10 }}>0x1A4F · ARM64</span>
        </div>

        <div style={{ marginTop: 6 }}>
          {bootLines.map((l, i) => (
            <div
              key={i}
              style={{
                color: l.tone === 'mint' ? 'var(--mint)' : 'var(--text-mid)',
                opacity: 0,
                animation: `term-fade 0.5s ease-in ${i * 0.12 + 0.2}s forwards`,
              }}
            >
              {l.text}
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 10,
            padding: 12,
            border: '1px dashed rgba(255,138,180,0.4)',
            background: 'rgba(255,138,180,0.05)',
          }}
        >
          <div style={{ color: 'var(--rose)', fontSize: 10, letterSpacing: 1.2, marginBottom: 6 }}>
            // WELCOME
          </div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: 24,
              color: 'var(--text-hi)',
              lineHeight: 1.1,
            }}
          >
            Think it. Speak it.
            <br />
            <span className="aurora-text">Watch it boot.</span>
          </div>
        </div>

        <div style={{ marginTop: 8 }}>
          <div style={{ color: 'var(--text-lo)' }}># try one of these</div>
          {tryCommands.map((c, i) => (
            <div key={i} style={{ color: c.tone === 'cyan' ? 'var(--cyan)' : 'var(--text-mid)' }}>
              <span style={{ color: 'var(--rose)' }}>$ </span>
              {c.text}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: 'var(--rose)' }}>›</span>
          <span style={{ color: 'var(--text-lo)' }}>press </span>
          <span
            style={{
              padding: '0 4px',
              border: '1px solid rgba(255,255,255,0.18)',
              color: 'var(--text-hi)',
              fontSize: 10,
            }}
          >
            ↵
          </span>
          <span style={{ color: 'var(--text-lo)' }}>or tap to continue</span>
          <Cursor />
        </div>
      </div>

      <VimBar mode="NORMAL" cmd=":wake lucid" />
    </TermPhone>
  );
}
