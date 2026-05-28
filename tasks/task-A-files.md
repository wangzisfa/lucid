# Task A — Files screen (07)

## Context

You're building the `/files` screen for **Lucid Terminal**, a voice-first mobile coding agent. Stack: Next.js 14 + TS + Tailwind + Zustand. Repo: `/Users/bytedance/Desktop/Dev/lucid`. Read `design-asset/PROMPT.md` + `design-asset/SCREENS.md` + look at `design-asset/screens/07-files.png` before starting.

This is a **web-first build of a mobile app**. Follow the mobile-architecture rules in `tasks/README.md` — Zustand state, pointer gestures, safe area, no emoji, dark only.

**Depends on:** Task 0 (foundation) is recommended but not strictly required if you handle SSR-safety yourself.

## Goal

A vim-style file tree that browses the active repo. Files touched by the current agent turn are highlighted.

## Spec (from `SCREENS.md` §07-files)

- Top app bar via existing `<TermAppBar>` showing the active repo + `EDIT` state chip.
- ASCII file tree using `├─ │  └─` glyphs and `▾ ▸` for folder open/close.
- Folders highlighted cyan; selected file highlighted with rose left-border + `>` cursor.
- Each row: `<indent><chev><name>` and on the right, if changed by the agent: `● lucid` tag + `+N` / `+N −M` delta in mint.
- File preview footer at bottom: highlighted snippet of the currently-selected file using the existing `<Syntax>` primitive.
- Vim hint row at the very bottom: `j/k navigate · l open · / search · gd diff · cmd-p quick-open`.
- VimBar mode `NORMAL`, cmd `:e <selected file>`.

## Interaction (must work)

- `j` / `↓` cursor down; `k` / `↑` cursor up; both wrap at edges.
- `l` / `→` / `Enter` opens the selected file (if a file) — for now, just changes the preview footer. Folder = toggle open/close.
- `h` / `←` collapses current folder.
- `gd` (press `g` then `d` within 600ms) jumps to the first file touched by the latest agent turn.
- `/` opens a search input that filters the tree (substring match on filename).
- Tap a row to select; tap an open folder to collapse; tap a closed folder to open.

All key handling via a single `useEffect(window.addEventListener('keydown'))`. Pointer events via `onPointerDown`, not `onClick`, for parity with the rest of the app.

## Files you'll create / edit

| Path | Op | Note |
|---|---|---|
| `app/files/page.tsx` | new | route stub |
| `components/screens/FilesScreen.tsx` | new | main view |
| `components/files/FileTree.tsx` | new | tree renderer |
| `components/files/FilePreview.tsx` | new | bottom Syntax preview |
| `lib/mock-files.ts` | new | the `idea-garden` mock tree |
| `lib/files-store.ts` | new | Zustand store: `cursor`, `openFolders`, `search`, `selectedFile` |

**Do not edit `lib/store.ts`** — Task B owns it. Read from `useSession((s) => s.repo)` and `useSession((s) => s.turns)` to get the active repo + diffs.

## Mock data shape

`lib/mock-files.ts` exports a tree resembling the design (from `variation-d-extra.jsx` D_Files):

```ts
export interface FileNode {
  id: string;            // path, used as key + selection
  depth: number;
  name: string;
  kind: 'dir' | 'file';
  children?: FileNode[]; // dir only
  ext?: string;          // file only — used by preview
}
```

Hardcode the `idea-garden` tree. The "agent touched these" mapping comes from the session store at render time: look at `useSession((s) => s.turns)`, find the latest `AgentTurn`, read its `diff.path` — that's the file to highlight. (Future: more than one path; structure your code so it scales to an array.)

## Acceptance / ready check

`pnpm typecheck` clean, `pnpm dev` boots, then:

1. From `/repos`, pick `idea-garden` → click a link/button to `/files`. (You may add a temporary link from the session screen footer; that's fine.)
2. Tree renders matching the silhouette of `design-asset/screens/07-files.png`.
3. `j/k` move cursor; the selected file's contents appear in the bottom preview (use any reasonable mock content).
4. Submit a turn in `/session` (use `/debug/run` if you don't want to use the mic) so a diff exists, then go to `/files` — `ReflectionCard.tsx` shows `● lucid +22`.
5. `gd` jumps the cursor to that file.
6. `/` filter works.
7. Rotating to landscape doesn't break the layout (it can stay portrait-shaped inside the landscape phone — Task D handles real landscape layout).

## Out of scope

- Real file system access. Tree is hardcoded mock.
- Multi-file diff highlight (single-file is enough for now; structure for many).
- Editing files. View-only.
- Landscape layout.
- Tying the cursor into store-wide state.

## Hand-off note

When done, append to `tasks/STATUS.md`:

```
- [x] task-A — files screen landed @ <git sha>
```
