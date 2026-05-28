import { create } from 'zustand';
import { defaultCursorId, defaultOpenFolders } from './mock-files';

interface FilesStoreShape {
  cursor: string;
  openFolders: Set<string>;
  search: string;
  selectedFile: string | null;

  setCursor: (id: string) => void;
  toggleFolder: (id: string) => void;
  openFolder: (id: string) => void;
  closeFolder: (id: string) => void;
  setSearch: (q: string) => void;
  setSelected: (id: string | null) => void;
}

export const useFiles = create<FilesStoreShape>((set) => ({
  cursor: defaultCursorId,
  openFolders: new Set<string>(defaultOpenFolders),
  search: '',
  selectedFile: defaultCursorId,

  setCursor: (id) => set({ cursor: id }),

  toggleFolder: (id) =>
    set((s) => {
      const next = new Set(s.openFolders);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { openFolders: next };
    }),

  openFolder: (id) =>
    set((s) => {
      if (s.openFolders.has(id)) return {};
      const next = new Set(s.openFolders);
      next.add(id);
      return { openFolders: next };
    }),

  closeFolder: (id) =>
    set((s) => {
      if (!s.openFolders.has(id)) return {};
      const next = new Set(s.openFolders);
      next.delete(id);
      return { openFolders: next };
    }),

  setSearch: (q) => set({ search: q }),
  setSelected: (id) => set({ selectedFile: id }),
}));
