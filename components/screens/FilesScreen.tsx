'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TermPhone } from '../TermPhone';
import { TermAppBar } from '../TermAppBar';
import { VimBar } from '../VimBar';
import { FileTree } from '../files/FileTree';
import { FilePreview } from '../files/FilePreview';
import { useActiveSession, useSessions } from '@/lib/store';
import { useFiles } from '@/lib/files-store';
import {
  filterTree,
  ideaGardenTree,
  normalizeDiffPath,
  visibleNodes,
  type FileNode,
} from '@/lib/mock-files';
import { AgentTurn } from '@/lib/types';

/**
 * 07-files — vim-style file tree of the active repo. Reads agent edit
 * highlights from the session store; owns its own cursor/search/open-folder
 * state in `useFiles`.
 */
export function FilesScreen() {
  const router = useRouter();
  const active = useActiveSession();
  const repo = active?.repo ?? null;
  const turns = active?.turns ?? [];

  const cursor = useFiles((s) => s.cursor);
  const openFolders = useFiles((s) => s.openFolders);
  const search = useFiles((s) => s.search);
  const selectedFile = useFiles((s) => s.selectedFile);

  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Bounce to picker on cold start with no repo, matching SessionScreen.
  useEffect(() => {
    if (!repo) router.replace('/repos');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Files the latest agent turn modified — id → +N/−M.
  const touched = useMemo(() => {
    const out: Record<string, { added: number; removed: number }> = {};
    for (let i = turns.length - 1; i >= 0; i--) {
      const t = turns[i];
      if (t.kind !== 'agent') continue;
      const at = t as AgentTurn;
      if (!at.diff) continue;
      const id = normalizeDiffPath(at.diff.path);
      out[id] = { added: at.diff.added, removed: at.diff.removed };
      // Also extend their parent folders so they read as part of a "changed branch".
      // Only the leaf gets the chip — folders stay clean per the design.
      break;
    }
    return out;
  }, [turns]);

  const filteredRoot = useMemo(
    () => filterTree(ideaGardenTree, search),
    [search],
  );

  const flat = useMemo(
    () => visibleNodes(filteredRoot, openFolders),
    [filteredRoot, openFolders],
  );

  // If the cursor lands off-screen after a filter, snap it to the first row.
  useEffect(() => {
    if (flat.length === 0) return;
    if (!flat.some((n) => n.id === cursor)) {
      useFiles.getState().setCursor(flat[0].id);
    }
  }, [flat, cursor]);

  // Bind a single key handler that reads live state via getState.
  useEffect(() => {
    if (!repo) return;
    let gPending = false;
    let gTimer: ReturnType<typeof setTimeout> | undefined;

    const moveCursor = (delta: 1 | -1) => {
      const visible = visibleNodes(
        filterTree(ideaGardenTree, useFiles.getState().search),
        useFiles.getState().openFolders,
      );
      if (visible.length === 0) return;
      const i = visible.findIndex((n) => n.id === useFiles.getState().cursor);
      const next =
        i < 0
          ? 0
          : (i + delta + visible.length) % visible.length;
      const node = visible[next];
      useFiles.getState().setCursor(node.id);
      if (node.kind === 'file') useFiles.getState().setSelected(node.id);
    };

    const activate = () => {
      const visible = visibleNodes(
        filterTree(ideaGardenTree, useFiles.getState().search),
        useFiles.getState().openFolders,
      );
      const node = visible.find((n) => n.id === useFiles.getState().cursor);
      if (!node) return;
      if (node.kind === 'dir') {
        useFiles.getState().toggleFolder(node.id);
      } else {
        useFiles.getState().setSelected(node.id);
      }
    };

    const collapseAtCursor = () => {
      const visible = visibleNodes(
        filterTree(ideaGardenTree, useFiles.getState().search),
        useFiles.getState().openFolders,
      );
      const node = visible.find((n) => n.id === useFiles.getState().cursor);
      if (!node) return;
      if (node.kind === 'dir' && useFiles.getState().openFolders.has(node.id)) {
        useFiles.getState().closeFolder(node.id);
        return;
      }
      // On a file or closed dir, hop the cursor up to its parent folder.
      const parentId = node.id.includes('/')
        ? node.id.slice(0, node.id.lastIndexOf('/'))
        : 'idea-garden';
      if (visible.some((n) => n.id === parentId)) {
        useFiles.getState().setCursor(parentId);
      }
    };

    const jumpToFirstTouched = () => {
      const sessions = useSessions.getState();
      const activeId = sessions.activeId;
      const ts = activeId ? sessions.sessions[activeId]?.turns ?? [] : [];
      for (let i = ts.length - 1; i >= 0; i--) {
        const t = ts[i];
        if (t.kind === 'agent' && t.diff) {
          const id = normalizeDiffPath(t.diff.path);
          // Ensure ancestors are open so the row is visible.
          const parts = id.split('/');
          for (let p = 1; p < parts.length; p++) {
            useFiles.getState().openFolder(parts.slice(0, p).join('/'));
          }
          useFiles.getState().setCursor(id);
          useFiles.getState().setSelected(id);
          return;
        }
      }
    };

    const onKey = (e: KeyboardEvent) => {
      // While the search box is focused, let it eat keys.
      const ae = document.activeElement;
      if (ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA')) {
        if (e.key === 'Escape') {
          (ae as HTMLInputElement).blur();
          setSearchOpen(false);
          useFiles.getState().setSearch('');
          e.preventDefault();
        }
        return;
      }

      if (gPending) {
        if (e.key === 'd') {
          e.preventDefault();
          jumpToFirstTouched();
        }
        gPending = false;
        if (gTimer) clearTimeout(gTimer);
        return;
      }

      if (e.key === 'g') {
        gPending = true;
        gTimer = setTimeout(() => {
          gPending = false;
        }, 600);
        return;
      }

      if (e.key === '/') {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 0);
        return;
      }

      if (e.key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault();
        moveCursor(1);
      } else if (e.key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault();
        moveCursor(-1);
      } else if (e.key === 'l' || e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        activate();
      } else if (e.key === 'h' || e.key === 'ArrowLeft') {
        e.preventDefault();
        collapseAtCursor();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      if (gTimer) clearTimeout(gTimer);
    };
  }, [repo]);

  if (!repo) return null;

  const onRowActivate = (n: FileNode) => {
    useFiles.getState().setCursor(n.id);
    if (n.kind === 'dir') {
      useFiles.getState().toggleFolder(n.id);
    } else {
      useFiles.getState().setSelected(n.id);
    }
  };

  const fileCount = countFiles(ideaGardenTree);
  const changedCount = Object.keys(touched).length;

  return (
    <TermPhone>
      <TermAppBar
        project={repo.name}
        branch={shortBranch(repo.branch)}
        state="EDIT"
      />

      <div
        className="no-scrollbar"
        style={{
          padding: '10px 12px 110px',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          position: 'relative',
          zIndex: 2,
          height: 'calc(100% - 60px)',
          overflow: 'auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 8,
          }}
        >
          <span style={{ color: 'var(--text-hi)', fontWeight: 600 }}>
            :Explore
          </span>
          <span style={{ color: 'var(--text-lo)', fontSize: 10 }}>
            {fileCount} files · {changedCount} changed
          </span>
        </div>

        {searchOpen && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 6px',
              marginBottom: 6,
              border: '1px solid var(--cyan)',
              background: 'rgba(107,229,255,0.06)',
            }}
          >
            <span style={{ color: 'var(--cyan)' }}>/</span>
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => useFiles.getState().setSearch(e.target.value)}
              placeholder="filter files…"
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                color: 'var(--text-hi)',
                fontFamily: 'inherit',
                fontSize: 'inherit',
                outline: 'none',
              }}
            />
            <span style={{ color: 'var(--text-lo)', fontSize: 9 }}>esc</span>
          </div>
        )}

        <FileTree
          nodes={flat}
          cursor={cursor}
          openFolders={openFolders}
          touched={touched}
          onActivate={onRowActivate}
        />

        <FilePreview fileId={selectedFile} />

        <div style={{ marginTop: 10, color: 'var(--text-lo)', fontSize: 9.5 }}>
          j/k navigate · l open · / search · gd diff · cmd-p quick-open
        </div>
      </div>

      <VimBar
        mode="NORMAL"
        cmd={`:e ${selectedFile ?? cursor}`}
        cursor={false}
      />
    </TermPhone>
  );
}

function countFiles(n: FileNode): number {
  if (n.kind === 'file') return 1;
  return (n.children ?? []).reduce((acc, c) => acc + countFiles(c), 0);
}

function shortBranch(b: string): string {
  // Stay terse so the bar doesn't overflow.
  return b.length > 24 ? b.slice(0, 22) + '…' : b;
}
