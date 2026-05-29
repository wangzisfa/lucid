/**
 * Minimal mock file tree for the Files screen. The real tree should come from
 * the server (a future `/api/files` endpoint); this keeps the screen renderable
 * during the RN port. `fileContent` backs the preview pane.
 */
export interface FileNode {
  id: string;
  name: string;
  kind: 'file' | 'folder';
  depth: number;
  children?: string[];
  /** Language tag shown in the preview header (files only). */
  lang?: string;
}

export const fileNodes: Record<string, FileNode> = {
  src: { id: 'src', name: 'src', kind: 'folder', depth: 0, children: ['src/components', 'src/lib', 'src/app.tsx'] },
  'src/components': { id: 'src/components', name: 'components', kind: 'folder', depth: 1, children: ['src/components/ReflectionCard.tsx', 'src/components/icons.tsx'] },
  'src/components/ReflectionCard.tsx': { id: 'src/components/ReflectionCard.tsx', name: 'ReflectionCard.tsx', kind: 'file', depth: 2, lang: 'tsx' },
  'src/components/icons.tsx': { id: 'src/components/icons.tsx', name: 'icons.tsx', kind: 'file', depth: 2, lang: 'tsx' },
  'src/lib': { id: 'src/lib', name: 'lib', kind: 'folder', depth: 1, children: ['src/lib/store.ts'] },
  'src/lib/store.ts': { id: 'src/lib/store.ts', name: 'store.ts', kind: 'file', depth: 2, lang: 'ts' },
  'src/app.tsx': { id: 'src/app.tsx', name: 'app.tsx', kind: 'file', depth: 1, lang: 'tsx' },
  'package.json': { id: 'package.json', name: 'package.json', kind: 'file', depth: 0, lang: 'json' },
  'README.md': { id: 'README.md', name: 'README.md', kind: 'file', depth: 0, lang: 'md' },
};

export const rootFileIds = ['src', 'package.json', 'README.md'];
export const defaultCursorId = 'src/components/ReflectionCard.tsx';
export const defaultOpenFolders = ['src', 'src/components', 'src/lib'];

/** Mock file bodies for the preview pane. */
export const fileContent: Record<string, string> = {
  'src/components/ReflectionCard.tsx': `import { useEffect } from 'react';
import { playChime } from '@/lib/chime';

export function ReflectionCard() {
  useEffect(() => { playChime('soft'); }, []);
  return (
    <section className="reflection">
      <h2>What stayed with you today?</h2>
      <textarea placeholder="write a line…" />
      <footer>moon · waxing gibbous</footer>
    </section>
  );
}`,
  'src/components/icons.tsx': `export const IconMoon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" />
  </svg>
);`,
  'src/lib/store.ts': `import { create } from 'zustand';

export const useGarden = create((set) => ({
  cards: [],
  add: (c) => set((s) => ({ cards: [...s.cards, c] })),
}));`,
  'src/app.tsx': `import { ReflectionCard } from '@/components/ReflectionCard';

export default function App() {
  return <ReflectionCard />;
}`,
  'package.json': `{
  "name": "idea-garden",
  "version": "0.3.1",
  "private": true,
  "scripts": { "dev": "vite", "build": "vite build" }
}`,
  'README.md': `# idea-garden

A quiet place to plant a thought each night.

- reflection card with a soft chime
- tonight's moon phase, quietly`,
};
