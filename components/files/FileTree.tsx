'use client';

import React, { useEffect, useRef } from 'react';
import type { FileNode } from '@/lib/mock-files';

interface AgentTouch {
  /** Lines added by the agent on this file. */
  added: number;
  /** Lines removed by the agent on this file. */
  removed: number;
}

interface FileTreeProps {
  /** Flat, ordered list of nodes to render — already filtered + flattened. */
  nodes: FileNode[];
  /** Currently-cursored row id. */
  cursor: string;
  /** Open folder ids (used to draw `▾` vs `▸`). */
  openFolders: ReadonlySet<string>;
  /** Map of file-id → agent edit summary. */
  touched: Record<string, AgentTouch>;
  /** Row click — selects/opens, callers handle the dir-vs-file branching. */
  onActivate: (node: FileNode) => void;
}

/**
 * ASCII-decorated file tree. Each row draws a chevron, the file/dir name,
 * a `● lucid` tag if the agent touched it, and an additions/removals delta
 * pinned to the right edge.
 */
export function FileTree({
  nodes,
  cursor,
  openFolders,
  touched,
  onActivate,
}: FileTreeProps) {
  const listRef = useRef<HTMLDivElement>(null);

  // Keep the cursored row visible as the user navigates.
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLDivElement>(
      `[data-row-id="${CSS.escape(cursor)}"]`,
    );
    el?.scrollIntoView({ block: 'nearest' });
  }, [cursor]);

  return (
    <div
      ref={listRef}
      style={{ display: 'flex', flexDirection: 'column', gap: 1 }}
    >
      {nodes.map((n) => {
        const isCursor = n.id === cursor;
        const isOpen = openFolders.has(n.id);
        const isRoot = n.depth === 0;
        const indent = '  '.repeat(Math.max(0, n.depth - (isRoot ? 0 : 0)));
        const chev = n.kind === 'dir' ? (isOpen ? '▾' : '▸') : ' ';
        const t = touched[n.id];

        const nameColor = isCursor
          ? 'var(--rose)'
          : isRoot
            ? 'var(--cyan)'
            : n.kind === 'dir'
              ? 'var(--text-hi)'
              : n.special
                ? 'var(--violet)'
                : t
                  ? 'var(--text-hi)'
                  : 'var(--text-mid)';

        return (
          <div
            key={n.id}
            data-row-id={n.id}
            onPointerDown={(e) => {
              e.preventDefault();
              onActivate(n);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '2px 6px',
              marginLeft: -6,
              marginRight: -6,
              background: isCursor ? 'rgba(255,138,180,0.12)' : 'transparent',
              borderLeft: isCursor
                ? '2px solid var(--rose)'
                : '2px solid transparent',
              cursor: 'pointer',
              userSelect: 'none',
              touchAction: 'manipulation',
            }}
          >
            <span style={{ color: 'var(--text-lo)', whiteSpace: 'pre' }}>
              {indent}
              {isCursor ? <span style={{ color: 'var(--rose)' }}>{'>'}</span> : ' '}
              {chev}
            </span>
            <span
              style={{
                color: nameColor,
                fontWeight:
                  n.kind === 'dir' || isRoot || isCursor ? 600 : 400,
              }}
            >
              {n.name}
              {n.kind === 'dir' && '/'}
            </span>
            {t && (
              <span style={{ color: 'var(--rose)', fontSize: 9, marginLeft: 4 }}>
                ● lucid
              </span>
            )}
            {t && (
              <span
                style={{
                  marginLeft: 'auto',
                  fontSize: 9.5,
                  color: 'var(--mint)',
                  whiteSpace: 'pre',
                }}
              >
                {formatDelta(t)}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function formatDelta(t: AgentTouch): string {
  if (t.removed > 0) return `+${t.added} −${t.removed}`;
  return `+${t.added}`;
}
