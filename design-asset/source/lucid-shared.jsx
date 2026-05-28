/* lucid-shared.jsx — shared icons, glass surfaces, voice viz */

// ─── Lucid wordmark / logo ─────────────────────────────────
const LucidMark = ({ size = 28, glow = true }) => (
  <div style={{
    width: size, height: size, position: 'relative',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  }}>
    <div style={{
      position: 'absolute', inset: 0, borderRadius: '50%',
      background: 'var(--aurora-conic)',
      filter: glow ? 'blur(6px)' : 'none', opacity: glow ? 0.7 : 1,
    }} />
    <div style={{
      position: 'absolute', inset: '18%', borderRadius: '50%',
      background: 'radial-gradient(circle at 35% 30%, #fff, rgba(255,255,255,0.08) 60%, transparent)',
      mixBlendMode: 'screen',
    }} />
    <div style={{
      position: 'absolute', inset: '38%', borderRadius: '50%',
      background: '#07060f',
    }} />
  </div>
);

const LucidWordmark = ({ size = 22, color = 'var(--text-hi)' }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
    <LucidMark size={size} />
    <span style={{
      fontFamily: 'var(--font-display)', fontSize: size * 1.0, lineHeight: 1,
      color, letterSpacing: 0.2, fontStyle: 'italic',
    }}>Lucid</span>
  </div>
);

// ─── icons (minimal hand-drawn line set) ───────────────────
const Icon = ({ d, size = 18, stroke = 'currentColor', fill = 'none', sw = 1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={sw}
    strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d={d} />
  </svg>
);
const IconMic = (p) => <Icon {...p} d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3" />;
const IconSparkle = (p) => <Icon {...p} d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />;
const IconSend = (p) => <Icon {...p} d="M4 12l16-8-4 18-5-7-7-3z" />;
const IconChevronRight = (p) => <Icon {...p} d="M9 6l6 6-6 6" />;
const IconChevronDown = (p) => <Icon {...p} d="M6 9l6 6 6-6" />;
const IconPlus = (p) => <Icon {...p} d="M12 5v14M5 12h14" />;
const IconSearch = (p) => <Icon {...p} d="M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14zM21 21l-4.3-4.3" />;
const IconFile = (p) => <Icon {...p} d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5zM14 3v5h5" />;
const IconFolder = (p) => <Icon {...p} d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z" />;
const IconCheck = (p) => <Icon {...p} d="M5 12l4 4 10-10" />;
const IconClose = (p) => <Icon {...p} d="M6 6l12 12M18 6L6 18" />;
const IconPlay = (p) => <Icon {...p} d="M6 4l14 8-14 8V4z" fill="currentColor" stroke="none" />;
const IconPause = (p) => <Icon {...p} d="M6 4h4v16H6zM14 4h4v16h-4z" fill="currentColor" stroke="none" />;
const IconRefresh = (p) => <Icon {...p} d="M3 12a9 9 0 0 1 15.5-6.3L21 8M21 3v5h-5M21 12a9 9 0 0 1-15.5 6.3L3 16M3 21v-5h5" />;
const IconTerminal = (p) => <Icon {...p} d="M4 6l5 6-5 6M12 18h8" />;
const IconCode = (p) => <Icon {...p} d="M8 6l-6 6 6 6M16 6l6 6-6 6M14 4l-4 16" />;
const IconEye = (p) => <Icon {...p} d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" />;
const IconBrain = (p) => <Icon {...p} d="M9 4a3 3 0 0 0-3 3v0a3 3 0 0 0-3 3v2a3 3 0 0 0 2 2.8V17a3 3 0 0 0 4 2.8M15 4a3 3 0 0 1 3 3v0a3 3 0 0 1 3 3v2a3 3 0 0 1-2 2.8V17a3 3 0 0 1-4 2.8M9 4v16M15 4v16" />;
const IconLayers = (p) => <Icon {...p} d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 17l9 5 9-5" />;
const IconSettings = (p) => <Icon {...p} d="M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />;
const IconStop = (p) => <Icon {...p} d="M5 5h14v14H5z" fill="currentColor" stroke="none" />;
const IconWaveform = (p) => <Icon {...p} d="M3 12h2M7 8v8M11 4v16M15 8v8M19 12h2" />;
const IconBolt = (p) => <Icon {...p} d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />;
const IconBranch = (p) => <Icon {...p} d="M6 3v12a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3M6 3a2 2 0 1 0 0 4M6 3a2 2 0 1 1 0 4M18 15a2 2 0 1 0 0 4M18 15a2 2 0 1 1 0 4M6 7v0" />;
const IconClock = (p) => <Icon {...p} d="M12 6v6l4 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z" />;
const IconArrowUp = (p) => <Icon {...p} d="M12 19V5M5 12l7-7 7 7" />;
const IconDownload = (p) => <Icon {...p} d="M12 4v12M6 10l6 6 6-6M4 20h16" />;
const IconShare = (p) => <Icon {...p} d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v14" />;

// ─── voice waveform — animated bars ────────────────────────
const VoiceBars = ({ count = 24, color = 'var(--violet)', height = 36, active = true }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 3, height }}>
    {Array.from({ length: count }).map((_, i) => {
      const h = 0.25 + Math.abs(Math.sin((i + 1) * 0.7)) * 0.75;
      return (
        <div key={i} style={{
          width: 3, height: `${h * 100}%`, borderRadius: 999,
          background: color,
          opacity: active ? 0.55 + 0.45 * h : 0.3,
          transformOrigin: 'center',
          animation: active ? `wave 1.${(i % 7) + 2}s ease-in-out ${i * 0.05}s infinite` : 'none',
        }} />
      );
    })}
  </div>
);

// ─── Code block — terminal-style ───────────────────────────
const CodeLines = ({ lines, dim = false, style = {} }) => (
  <pre style={{
    margin: 0, fontFamily: 'var(--font-mono)', fontSize: 11.5, lineHeight: 1.55,
    color: dim ? 'var(--text-mid)' : 'var(--text-hi)',
    whiteSpace: 'pre', overflow: 'hidden', ...style,
  }}>
    {lines.map((l, i) => {
      if (typeof l === 'string') return <div key={i}>{l}</div>;
      return <div key={i} style={{
        background: l.diff === '+' ? 'rgba(94, 255, 178, 0.10)' :
                    l.diff === '-' ? 'rgba(255, 138, 180, 0.10)' : 'transparent',
        color: l.diff === '+' ? 'var(--mint)' :
               l.diff === '-' ? 'var(--rose)' :
               l.muted ? 'var(--text-lo)' : 'var(--text-hi)',
        padding: '0 8px', marginLeft: -8, marginRight: -8,
      }}>{l.diff ? `${l.diff} ` : '  '}{l.text}</div>;
    })}
  </pre>
);

// ─── Tiny syntax highlighter for inline code cards ──────────
// (intentionally lightweight — colors keywords/strings/types)
const tokenize = (line) => {
  const tokens = [];
  const re = /(\/\/[^\n]*)|('[^']*'|"[^"]*"|`[^`]*`)|\b(const|let|var|function|return|if|else|for|while|import|from|export|default|class|new|async|await|true|false|null)\b|\b(useState|useEffect|useMemo|setTimeout|console)\b|([A-Z][a-zA-Z]+)|([a-z][a-zA-Z]*)(?=\()|(\d+(?:\.\d+)?)|([{}()\[\];,.<>=+\-*/!?:|&])/g;
  let last = 0, m;
  while ((m = re.exec(line)) !== null) {
    if (m.index > last) tokens.push({ t: line.slice(last, m.index), c: 'plain' });
    if (m[1]) tokens.push({ t: m[1], c: 'comment' });
    else if (m[2]) tokens.push({ t: m[2], c: 'string' });
    else if (m[3]) tokens.push({ t: m[3], c: 'keyword' });
    else if (m[4]) tokens.push({ t: m[4], c: 'builtin' });
    else if (m[5]) tokens.push({ t: m[5], c: 'type' });
    else if (m[6]) tokens.push({ t: m[6], c: 'fn' });
    else if (m[7]) tokens.push({ t: m[7], c: 'num' });
    else if (m[8]) tokens.push({ t: m[8], c: 'punct' });
    last = re.lastIndex;
  }
  if (last < line.length) tokens.push({ t: line.slice(last), c: 'plain' });
  return tokens;
};
const synColors = {
  plain: 'var(--text-hi)',
  comment: 'var(--text-lo)',
  string: '#FFB99B',
  keyword: '#C792FF',
  builtin: '#6BE5FF',
  type: '#FFD86B',
  fn: '#6BE5FF',
  num: '#FF8AB4',
  punct: 'var(--text-mid)',
};
const Syntax = ({ code, fontSize = 11.5 }) => (
  <pre style={{
    margin: 0, fontFamily: 'var(--font-mono)', fontSize, lineHeight: 1.65,
    whiteSpace: 'pre', overflow: 'hidden',
  }}>
    {code.split('\n').map((line, i) => (
      <div key={i}>
        {tokenize(line).map((tok, j) => (
          <span key={j} style={{ color: synColors[tok.c] }}>{tok.t}</span>
        ))}
      </div>
    ))}
  </pre>
);

// ─── status pill ────────────────────────────────────────────
const StatusPill = ({ children, tone = 'violet', size = 'sm' }) => {
  const tones = {
    violet: { bg: 'var(--violet-soft)', fg: '#C7B5FF', dot: 'var(--violet)' },
    cyan:   { bg: 'var(--cyan-soft)',   fg: '#A7EEFF', dot: 'var(--cyan)' },
    rose:   { bg: 'var(--rose-soft)',   fg: '#FFB8D1', dot: 'var(--rose)' },
    mint:   { bg: 'rgba(94,255,178,0.14)', fg: '#9DFFCF', dot: 'var(--mint)' },
    muted:  { bg: 'rgba(255,255,255,0.06)', fg: 'var(--text-mid)', dot: 'var(--text-lo)' },
  };
  const t = tones[tone];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: size === 'sm' ? '3px 8px' : '5px 10px',
      borderRadius: 999, background: t.bg, color: t.fg,
      fontSize: size === 'sm' ? 10.5 : 12, fontWeight: 500, letterSpacing: 0.1,
      border: `1px solid ${t.dot}33`,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: 999, background: t.dot, boxShadow: `0 0 6px ${t.dot}` }} />
      {children}
    </span>
  );
};

// ─── faux iframe preview (a generated app screen) ───────────
const FauxPreview = ({ tone = 'violet', label = 'todo-app' }) => {
  const accent = tone === 'cyan' ? 'var(--cyan)' : tone === 'rose' ? 'var(--rose)' : 'var(--violet)';
  return (
    <div style={{
      width: '100%', aspectRatio: '9/16', borderRadius: 14,
      background: 'linear-gradient(180deg, #14111e, #0c0a16)',
      border: '1px solid var(--glass-border)', overflow: 'hidden', position: 'relative',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
    }}>
      <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10, height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ width: 6, height: 6, borderRadius: 999, background: accent, boxShadow: `0 0 8px ${accent}` }} />
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-lo)' }}>{label}</div>
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--text-hi)', lineHeight: 1.05 }}>
          Good evening,<br/><span style={{ fontStyle: 'italic', color: accent }}>Iris</span>
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            padding: '8px 10px', background: 'rgba(255,255,255,0.04)', borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <div style={{ width: 12, height: 12, borderRadius: 4, border: `1.2px solid ${accent}AA` }} />
            <div style={{ flex: 1, height: 6, borderRadius: 3, background: `rgba(255,255,255,${0.16 - i * 0.03})` }} />
          </div>
        ))}
        <div style={{ marginTop: 'auto', height: 28, borderRadius: 8,
          background: `linear-gradient(90deg, ${accent}, transparent)`, opacity: 0.5 }} />
      </div>
    </div>
  );
};

// expose
Object.assign(window, {
  LucidMark, LucidWordmark,
  IconMic, IconSparkle, IconSend, IconChevronRight, IconChevronDown, IconPlus,
  IconSearch, IconFile, IconFolder, IconCheck, IconClose, IconPlay, IconPause,
  IconRefresh, IconTerminal, IconCode, IconEye, IconBrain, IconLayers, IconSettings,
  IconStop, IconWaveform, IconBolt, IconBranch, IconClock, IconArrowUp, IconDownload, IconShare,
  VoiceBars, CodeLines, Syntax, StatusPill, FauxPreview,
});
