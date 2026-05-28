import Link from 'next/link';

interface ScreenCard {
  num: string;
  slug: string;
  title: string;
  built: boolean;
  /** Static preview can only be rendered for screens that don't depend on the session store. */
  staticPreview?: React.ReactNode;
}

const portrait: ScreenCard[] = [
  { num: '01', slug: 'boot',      title: 'boot',      built: true  },
  { num: '02', slug: 'repos',     title: 'repos',     built: true  },
  { num: '03', slug: 'session',   title: 'session',   built: true  },
  { num: '04', slug: 'plan',      title: 'plan',      built: true  }, // inline in session
  { num: '05', slug: 'run',       title: 'run',       built: true  }, // PreviewSheet
  { num: '06', slug: 'listening', title: 'listening', built: true  }, // overlay
  { num: '07', slug: 'files',     title: 'files',     built: true  },
  { num: '08', slug: 'agents',    title: 'agents',    built: true  },
];

const landscape: ScreenCard[] = [
  { num: '09', slug: 'session', title: 'session·land',   built: true }, // dispatched by orientation
  { num: '10', slug: 'session', title: 'listening·land', built: true }, // dispatched by REC + orientation
  { num: '11', slug: 'session', title: 'run·land',       built: true }, // dispatched by LIVE + orientation
];

const settings: ScreenCard[] = [
  { num: '12', slug: 'settings',           title: 'settings·hub',       built: true },
  { num: '13', slug: 'settings/providers', title: 'settings·providers', built: true },
  { num: '14', slug: 'settings/model',     title: 'settings·model',     built: true },
  { num: '15', slug: 'settings/raw',       title: 'settings·raw',       built: true },
];

/**
 * /design — internal route showing each screen's status against the spec.
 * Live screens that depend on session state (session, plan, run, listening)
 * are linked rather than rendered inline.
 */
export default function DesignPage() {
  return (
    <main style={{ minHeight: '100vh', padding: '40px 24px 80px', background: 'var(--bg-deep)' }}>
      <header style={{ maxWidth: 1200, margin: '0 auto 32px', fontFamily: 'var(--font-mono)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <span style={{ color: 'var(--rose)' }}>$</span>
          <h1
            style={{
              margin: 0,
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: 38,
              color: 'var(--text-hi)',
              letterSpacing: 0.2,
            }}
          >
            Lucid <span className="aurora-text">Terminal</span>
          </h1>
          <span style={{ color: 'var(--text-lo)', fontSize: 12 }}>
            // design review — 16 screens
          </span>
        </div>
        <p
          style={{
            margin: '8px 0 0',
            color: 'var(--text-mid)',
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            maxWidth: 600,
            lineHeight: 1.6,
          }}
        >
          # internal page. <Link href="/" style={{ color: 'var(--cyan)' }}>/</Link> is the real boot.
          screens that need a live session are linked instead of rendered inline.
        </p>
      </header>

      <Section title="// portrait" cards={portrait} />
      <Section
        title="// landscape · rotate browser past 1.3× aspect to enter"
        cards={landscape}
      />
      <Section title="// settings" cards={settings} />
    </main>
  );
}

function Section({ title, cards }: { title: string; cards: ScreenCard[] }) {
  return (
    <section style={{ maxWidth: 1200, margin: '0 auto 32px' }}>
      <div
        style={{
          color: 'var(--text-lo)',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          letterSpacing: 1,
          marginBottom: 12,
          paddingBottom: 6,
          borderBottom: '1px dashed rgba(255,255,255,0.08)',
        }}
      >
        {title}
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: 24,
        }}
      >
        {cards.map((c) => (
          <ScreenSlot key={c.num} card={c} />
        ))}
      </div>
    </section>
  );
}

function ScreenSlot({ card }: { card: ScreenCard }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <div
        style={{
          color: card.built ? 'var(--text-mid)' : 'var(--text-lo)',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span style={{ color: 'var(--text-lo)' }}>{card.num}</span>
        {card.built ? (
          <Link
            href={routeFor(card.slug)}
            style={{ color: 'var(--cyan)', textDecoration: 'none' }}
          >
            {card.title}
          </Link>
        ) : (
          <span style={{ color: 'var(--text-disabled)' }}>{card.title}</span>
        )}
        {card.built && (
          <span
            style={{
              fontSize: 9,
              color: 'var(--mint)',
              border: '1px solid rgba(94,255,178,0.5)',
              padding: '0 4px',
              letterSpacing: 0.5,
            }}
          >
            LIVE
          </span>
        )}
      </div>
      {card.staticPreview ?? <PlaceholderPhone card={card} />}
    </div>
  );
}

function routeFor(slug: string): string {
  // plan/run/listening don't have dedicated routes — they're sub-views of session
  if (slug === 'plan' || slug === 'run' || slug === 'listening') return '/session';
  if (slug === 'boot') return '/';
  return `/${slug}`;
}

function PlaceholderPhone({ card }: { card: ScreenCard }) {
  return (
    <Link
      href={card.built ? routeFor(card.slug) : '#'}
      style={{
        width: 320,
        height: 660,
        borderRadius: 38,
        background: card.built
          ? 'repeating-linear-gradient(45deg, rgba(94,255,178,0.04) 0 12px, transparent 12px 24px)'
          : 'repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0 12px, transparent 12px 24px)',
        border: `1px dashed ${card.built ? 'rgba(94,255,178,0.3)' : 'rgba(255,255,255,0.1)'}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        color: card.built ? 'var(--mint)' : 'var(--text-disabled)',
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        textDecoration: 'none',
        cursor: card.built ? 'pointer' : 'default',
      }}
    >
      <span style={{ fontSize: 36, color: card.built ? 'var(--mint)' : 'var(--text-lo)', opacity: 0.5 }}>
        {card.num}
      </span>
      <span>// {card.title}</span>
      <span style={{ fontSize: 10 }}>
        {card.built ? '↗ open' : 'not built yet'}
      </span>
    </Link>
  );
}
