/**
 * Minimal mock file tree for the Files screen. The real tree should come from
 * the server (a future `/api/files` endpoint); this keeps the screen renderable
 * during the RN port.
 */
export interface FileNode {
  id: string;
  name: string;
  kind: 'file' | 'folder';
  depth: number;
  children?: string[];
}

export const fileNodes: Record<string, FileNode> = {
  src: { id: 'src', name: 'src', kind: 'folder', depth: 0, children: ['src/app.tsx', 'src/lib'] },
  'src/app.tsx': { id: 'src/app.tsx', name: 'app.tsx', kind: 'file', depth: 1 },
  'src/lib': { id: 'src/lib', name: 'lib', kind: 'folder', depth: 1, children: ['src/lib/store.ts'] },
  'src/lib/store.ts': { id: 'src/lib/store.ts', name: 'store.ts', kind: 'file', depth: 2 },
  'README.md': { id: 'README.md', name: 'README.md', kind: 'file', depth: 0 },
};

export const rootFileIds = ['src', 'README.md'];
export const defaultCursorId = 'src/app.tsx';
export const defaultOpenFolders = ['src', 'src/lib'];
