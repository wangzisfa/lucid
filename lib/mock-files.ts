/**
 * Hardcoded `idea-garden` repo tree shown in the /files screen.
 *
 * The shape is designed so it can later be swapped for a real recursive
 * directory listing without changing the renderer. `id` doubles as the path
 * relative to the repo root and as the React key.
 */

export interface FileNode {
  /** Path-from-root, e.g. `components/ReflectionCard.tsx`. */
  id: string;
  depth: number;
  name: string;
  kind: 'dir' | 'file';
  /** Set on dirs only. */
  children?: FileNode[];
  /** Set on files only — drives the preview's syntax language. */
  ext?: string;
  /** Hint to render the file name in the violet "config" color (.lucidrc). */
  special?: boolean;
}

export const ideaGardenTree: FileNode = {
  id: 'idea-garden',
  depth: 0,
  name: 'idea-garden',
  kind: 'dir',
  children: [
    {
      id: 'app',
      depth: 1,
      name: 'app',
      kind: 'dir',
      children: [
        {
          id: 'app/home',
          depth: 2,
          name: 'home',
          kind: 'dir',
          children: [
            { id: 'app/home/index.tsx',  depth: 3, name: 'index.tsx',  kind: 'file', ext: 'tsx' },
            { id: 'app/home/today.tsx',  depth: 3, name: 'today.tsx',  kind: 'file', ext: 'tsx' },
          ],
        },
        {
          id: 'app/reflection',
          depth: 2,
          name: 'reflection',
          kind: 'dir',
          children: [
            { id: 'app/reflection/page.tsx', depth: 3, name: 'page.tsx', kind: 'file', ext: 'tsx' },
          ],
        },
      ],
    },
    {
      id: 'components',
      depth: 1,
      name: 'components',
      kind: 'dir',
      children: [
        { id: 'components/Card.tsx',            depth: 2, name: 'Card.tsx',            kind: 'file', ext: 'tsx' },
        { id: 'components/ReflectionCard.tsx',  depth: 2, name: 'ReflectionCard.tsx',  kind: 'file', ext: 'tsx' },
        { id: 'components/Prompt.tsx',          depth: 2, name: 'Prompt.tsx',          kind: 'file', ext: 'tsx' },
      ],
    },
    {
      id: 'lib',
      depth: 1,
      name: 'lib',
      kind: 'dir',
      children: [
        { id: 'lib/background.ts', depth: 2, name: 'background.ts', kind: 'file', ext: 'ts' },
        { id: 'lib/chime.ts',      depth: 2, name: 'chime.ts',      kind: 'file', ext: 'ts' },
      ],
    },
    { id: 'db',           depth: 1, name: 'db',           kind: 'dir', children: [] },
    { id: 'public',       depth: 1, name: 'public',       kind: 'dir', children: [] },
    { id: 'package.json', depth: 1, name: 'package.json', kind: 'file', ext: 'json' },
    { id: '.lucidrc',     depth: 1, name: '.lucidrc',     kind: 'file', ext: 'toml', special: true },
  ],
};

/** Open-by-default folders matching the design's silhouette. */
export const defaultOpenFolders: string[] = [
  'idea-garden',
  'app',
  'app/home',
  'app/reflection',
  'components',
  'lib',
];

/** First file in the visible tree — used as the initial cursor. */
export const defaultCursorId = 'app/home/index.tsx';

/**
 * Flatten the tree into the ordered list of *visible* nodes given which
 * folders are open. The root node itself is included so it can be rendered
 * as the repo name header.
 */
export function visibleNodes(
  root: FileNode,
  openFolders: ReadonlySet<string>,
): FileNode[] {
  const out: FileNode[] = [];
  const walk = (n: FileNode) => {
    out.push(n);
    if (n.kind === 'dir' && openFolders.has(n.id) && n.children) {
      for (const c of n.children) walk(c);
    }
  };
  walk(root);
  return out;
}

/** Search filter — keeps a node if it or any descendant name matches `q`. */
export function filterTree(root: FileNode, q: string): FileNode {
  const needle = q.trim().toLowerCase();
  if (!needle) return root;

  const prune = (n: FileNode): FileNode | null => {
    if (n.kind === 'file') {
      return n.name.toLowerCase().includes(needle) ? n : null;
    }
    const kept: FileNode[] = [];
    for (const c of n.children ?? []) {
      const r = prune(c);
      if (r) kept.push(r);
    }
    if (kept.length === 0 && !n.name.toLowerCase().includes(needle)) return null;
    return { ...n, children: kept };
  };

  return prune(root) ?? { ...root, children: [] };
}

/** Strip the leading `~/` from a diff path so it matches a node id. */
export function normalizeDiffPath(p: string): string {
  return p.replace(/^~\//, '').replace(/^\.\//, '');
}

/**
 * Mock file contents indexed by node id. Falls back to a placeholder.
 * Real implementation will replace this with a file-system reader.
 */
export const mockFileContent: Record<string, string> = {
  'components/ReflectionCard.tsx': `import { Card } from './Card'
import { Prompt } from './Prompt'

export function ReflectionCard() {
  const [t, setT] = useState("")
  return (
    <Card chime="soft">
      <Prompt>What stayed with you today?</Prompt>
    </Card>
  )
}`,
  'components/Card.tsx': `interface CardProps {
  chime?: 'soft' | 'bell' | 'none'
  children: React.ReactNode
}

export function Card({ chime = 'none', children }: CardProps) {
  return <div className="card">{children}</div>
}`,
  'components/Prompt.tsx': `export function Prompt({ children }: { children: React.ReactNode }) {
  return <div className="prompt">{children}</div>
}`,
  'app/home/index.tsx': `import { ReflectionCard } from '@/components/ReflectionCard'

export default function Home() {
  return (
    <main>
      <ReflectionCard />
    </main>
  )
}`,
  'app/home/today.tsx': `export default function Today() {
  return <section>today</section>
}`,
  'app/reflection/page.tsx': `import { ReflectionCard } from '@/components/ReflectionCard'

export default function ReflectionPage() {
  return <ReflectionCard />
}`,
  'lib/background.ts': `import { scheduleCron } from './cron'

export function startBackgroundJobs() {
  scheduleCron('reflection', '0 21 * * *', () => {
    notify('reflection-card')
  })
}`,
  'lib/chime.ts': `const audio = new Audio('/chime.mp3')

export function chime() {
  const hour = new Date().getHours()
  const isNight = hour >= 21 || hour < 7
  const vol = isNight ? 0.18 : 0.6
  audio.volume = vol
  audio.play()
}`,
  'package.json': `{
  "name": "idea-garden",
  "version": "0.1.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build"
  }
}`,
  '.lucidrc': `[agent]
model = "claude-sonnet-4.5"
context = 200_000

[providers]
active = "anthropic"`,
};
