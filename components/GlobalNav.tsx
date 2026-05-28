'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, usePathname } from 'next/navigation';
import { useSessions, useLiveCount, useSessionList } from '@/lib/store';
import { IconChevL, IconMenu, IconClose } from './icons';
import { usePhoneRoot } from './phone-root';

/**
 * Global navigation affordance shown in the top-left of every screen with an
 * app bar: a back chevron + a menu hamburger. The menu opens a slide-up
 * sheet listing the canonical destinations (session / agents / files /
 * settings / design) plus a reset action.
 *
 * Compact: 22×22 buttons, separated by 6px, sit inside the app bar's left
 * slot. On Boot (no app bar) the `FloatingMenu` variant below pins to the
 * top-left of the viewport instead.
 */
interface NavChipsProps {
  /** Hide the back button (e.g. on the entry screen). */
  hideBack?: boolean;
}

export function NavChips({ hideBack = false }: NavChipsProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const showBack = !hideBack && shouldShowBack(pathname);

  return (
    <>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          flexShrink: 0,
        }}
      >
        {showBack && (
          <button
            type="button"
            aria-label="back"
            onClick={() => router.back()}
            style={navBtnStyle()}
          >
            <IconChevL size={12} stroke="var(--text-mid)" sw={2} />
          </button>
        )}
        <button
          type="button"
          aria-label="menu"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          style={navBtnStyle()}
        >
          <IconMenu size={12} stroke="var(--text-mid)" sw={2} />
        </button>
      </div>
      {open && <GlobalMenuSheet onClose={() => setOpen(false)} />}
    </>
  );
}

/**
 * Standalone floating variant for screens that don't render the app bar
 * (currently just Boot). Pins to the top-left with safe-area-aware offset
 * so it clears the OS status bar on mobile.
 */
export function FloatingMenu() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        aria-label="menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        style={{
          position: 'absolute',
          top: 'calc(var(--safe-top) + 12px)',
          left: 12,
          zIndex: 60,
          ...navBtnStyle(),
        }}
      >
        <IconMenu size={14} stroke="var(--text-mid)" sw={2} />
      </button>
      {open && <GlobalMenuSheet onClose={() => setOpen(false)} />}
    </>
  );
}

function navBtnStyle(): React.CSSProperties {
  return {
    width: 22,
    height: 22,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0,0,0,0.4)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'var(--text-mid)',
    cursor: 'pointer',
    padding: 0,
  };
}

function shouldShowBack(pathname: string | null): boolean {
  if (!pathname || pathname === '/') return false;
  return true;
}

// ─── menu sheet ──────────────────────────────────────────

interface SheetProps {
  onClose: () => void;
}

interface NavItem {
  label: string;
  hint?: string;
  href: string;
  hotkey: string;
  badge?: React.ReactNode;
}

function GlobalMenuSheet({ onClose }: SheetProps) {
  const router = useRouter();
  const pathname = usePathname();
  const liveCount = useLiveCount();
  const sessions = useSessionList();
  const resetAll = useSessions((s) => s.resetAll);
  const phoneRoot = usePhoneRoot();

  // Esc closes the sheet.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const items: NavItem[] = [
    {
      label: 'session',
      hint: sessions.length > 0 ? sessions[sessions.length - 1].name : 'empty',
      href: '/session',
      hotkey: 's',
    },
    {
      label: 'agents',
      hint: `${sessions.length} session${sessions.length === 1 ? '' : 's'}`,
      href: '/agents',
      hotkey: 'a',
      badge: liveCount > 0 ? (
        <span
          style={{
            color: 'var(--mint)',
            fontSize: 9.5,
            border: '1px solid rgba(94,255,178,0.4)',
            padding: '0 4px',
          }}
        >
          {liveCount} LIVE
        </span>
      ) : undefined,
    },
    { label: 'files',    hint: 'vim-style tree',  href: '/files',     hotkey: 'f' },
    { label: 'settings', hint: '.lucidrc',         href: '/settings',  hotkey: ',' },
    { label: 'design',   hint: '16-screen review', href: '/design',    hotkey: 'd' },
  ];

  const onPick = (href: string) => {
    onClose();
    if (href !== pathname) router.push(href);
  };

  const onReset = () => {
    if (typeof window !== 'undefined') {
      const ok = window.confirm('Reset all sessions? This cannot be undone.');
      if (!ok) return;
    }
    resetAll();
    onClose();
    router.replace('/');
  };

  const sheet = (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 80,
        background: 'rgba(7,6,15,0.72)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        animation: 'term-fade 0.16s ease-out',
        paddingBottom: 'var(--safe-bottom)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          margin: 12,
          marginBottom: 26,
          background: 'rgba(0,0,0,0.85)',
          border: '1px solid rgba(255,255,255,0.12)',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-hi)',
        }}
      >
        <div
          style={{
            padding: '8px 12px',
            borderBottom: '1px dashed rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 10.5,
            color: 'var(--text-lo)',
          }}
        >
          <span style={{ color: 'var(--rose)', letterSpacing: 0.6 }}>// MENU</span>
          <button
            type="button"
            aria-label="close menu"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-mid)',
              cursor: 'pointer',
              padding: 2,
              display: 'flex',
            }}
          >
            <IconClose size={12} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {items.map((it) => {
            const sel = pathname === it.href ||
              (it.href !== '/' && pathname?.startsWith(it.href));
            return (
              <button
                key={it.label}
                type="button"
                onClick={() => onPick(it.href)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 12px',
                  background: sel ? 'rgba(255,138,180,0.08)' : 'transparent',
                  border: 'none',
                  borderLeft: sel ? '2px solid var(--rose)' : '2px solid transparent',
                  color: 'inherit',
                  fontFamily: 'inherit',
                  fontSize: 12,
                  textAlign: 'left',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                <span
                  style={{
                    color: 'var(--text-lo)',
                    width: 16,
                    fontSize: 10,
                    border: '1px solid rgba(255,255,255,0.18)',
                    textAlign: 'center',
                    padding: '1px 0',
                  }}
                >
                  {it.hotkey}
                </span>
                <span style={{ color: sel ? 'var(--rose)' : 'var(--text-hi)', minWidth: 70 }}>
                  [{it.label}]
                </span>
                {it.hint && (
                  <span style={{ color: 'var(--text-lo)', fontSize: 10, flex: 1 }}>
                    {it.hint}
                  </span>
                )}
                {it.badge}
              </button>
            );
          })}
        </div>

        <div
          style={{
            padding: '8px 12px',
            borderTop: '1px dashed rgba(255,255,255,0.1)',
            display: 'flex',
            gap: 8,
            alignItems: 'center',
          }}
        >
          <button
            type="button"
            onClick={onReset}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,138,180,0.5)',
              color: 'var(--rose)',
              fontFamily: 'inherit',
              fontSize: 10.5,
              padding: '3px 8px',
              letterSpacing: 0.6,
              cursor: 'pointer',
            }}
          >
            :reset
          </button>
          <span style={{ color: 'var(--text-lo)', fontSize: 9.5, marginLeft: 'auto' }}>
            esc to close
          </span>
        </div>
      </div>
    </div>
  );

  // Portal into the phone frame so the sheet covers the whole 320×660 /
  // 660×320 area instead of being trapped under whatever positioned ancestor
  // the menu button happens to live in (e.g. TermAppBar). If we somehow
  // render outside a phone frame, fall back to inline rendering — better
  // than nothing.
  return phoneRoot ? createPortal(sheet, phoneRoot) : sheet;
}
