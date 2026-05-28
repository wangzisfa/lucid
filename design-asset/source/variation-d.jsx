/* variation-d.jsx — "Lucid Terminal"
   Hardcore dev energy. Mono everywhere, grid bg, scanlines, ASCII trees,
   vim-style command palette, block waveforms (█▓▒░), shell-feeling logs.
   Aurora kept as a single neon accent — most chrome is crisp, not glowy. */

// shared phone — terminal version
const TermPhone = ({ children, scanlines = true }) => (
  <div style={{
    width: 320, height: 660, borderRadius: 38, position: 'relative', overflow: 'hidden',
    background: '#000',
    boxShadow: '0 0 0 1.5px rgba(255,255,255,0.06), 0 30px 80px -20px rgba(0,0,0,0.7)',
  }}>
    <div style={{
      position: 'absolute', inset: 0,
      background: `
        linear-gradient(180deg, #08070f 0%, #050409 100%)
      `,
    }}>
      {/* grid pattern */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '16px 16px',
        maskImage: 'radial-gradient(ellipse 80% 80% at 50% 30%, black 30%, transparent 95%)',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 30%, black 30%, transparent 95%)',
      }} />
      {/* corner glow — single aurora ember */}
      <div style={{
        position: 'absolute', top: -120, right: -100, width: 280, height: 280, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,107,157,0.22), transparent 70%)',
        filter: 'blur(20px)', pointerEvents: 'none',
      }} />
      {/* scanlines */}
      {scanlines && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.018) 0px, transparent 1px, transparent 2px, rgba(255,255,255,0.018) 3px)',
          mixBlendMode: 'overlay', opacity: 0.7,
        }} />
      )}
      {/* status bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 24px 6px', fontSize: 12, fontWeight: 600,
        color: 'var(--text-hi)', position: 'relative', zIndex: 10,
      }}>
        <span style={{ fontFamily: 'var(--font-mono)' }}>09:41</span>
        <span style={{ display: 'flex', gap: 4, alignItems: 'center', opacity: 0.85 }}>
          <svg width="14" height="9" viewBox="0 0 19 12"><rect x="0" y="7.5" width="3.2" height="4.5" rx="0.7" fill="currentColor"/><rect x="4.8" y="5" width="3.2" height="7" rx="0.7" fill="currentColor"/><rect x="9.6" y="2.5" width="3.2" height="9.5" rx="0.7" fill="currentColor"/><rect x="14.4" y="0" width="3.2" height="12" rx="0.7" fill="currentColor"/></svg>
          <svg width="18" height="9" viewBox="0 0 27 13"><rect x="0.5" y="0.5" width="23" height="12" rx="3.5" stroke="currentColor" strokeOpacity="0.4" fill="none"/><rect x="2" y="2" width="17" height="9" rx="2" fill="currentColor"/></svg>
        </span>
      </div>
      {children}
      <div style={{
        position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
        width: 110, height: 5, borderRadius: 999, background: 'rgba(255,255,255,0.28)',
      }} />
    </div>
  </div>
);

// — terminal session app-bar
const TermAppBar = ({ project = 'idea-garden', branch = 'main', state = 'IDLE' }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '4px 16px 10px', fontFamily: 'var(--font-mono)', fontSize: 10.5,
    color: 'var(--text-mid)', letterSpacing: 0.3,
    borderBottom: '1px dashed rgba(255,255,255,0.08)',
  }}>
    <span style={{ color: 'var(--text-hi)' }}>~/{project}</span>
    <span style={{ color: 'var(--cyan)' }}>⎇ {branch}</span>
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      color: state === 'IDLE' ? 'var(--text-lo)' : state === 'REC' ? 'var(--violet)' : 'var(--mint)',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: 0, background: 'currentColor', boxShadow: state !== 'IDLE' ? '0 0 6px currentColor' : 'none' }} />
      {state}
    </span>
  </div>
);

// — block waveform (vertical bars made of unicode blocks)
const BlockWave = ({ count = 28, active = true, color = 'var(--violet)' }) => {
  const heights = ['▁','▂','▃','▄','▅','▆','▇','█'];
  return (
    <div style={{
      display: 'flex', gap: 1, alignItems: 'flex-end', height: 24,
      fontFamily: 'var(--font-mono)', color, fontSize: 18, lineHeight: 0.5, letterSpacing: -1,
    }}>
      {Array.from({ length: count }).map((_, i) => {
        const h = heights[Math.floor(Math.abs(Math.sin((i + 1) * 0.7)) * (heights.length - 1))];
        return <span key={i} style={{
          opacity: active ? 0.55 + Math.abs(Math.cos(i)) * 0.45 : 0.25,
          animation: active ? `wave 1.${(i % 6) + 1}s ease-in-out ${i * 0.04}s infinite` : 'none',
          transformOrigin: 'bottom',
        }}>{h}</span>;
      })}
    </div>
  );
};

// — vim-style command bar (bottom)
const VimBar = ({ mode = 'NORMAL', cmd = '', cursor = true }) => (
  <div style={{
    position: 'absolute', bottom: 26, left: 0, right: 0,
    fontFamily: 'var(--font-mono)', fontSize: 11,
    borderTop: '1px solid rgba(255,255,255,0.08)',
    display: 'flex', alignItems: 'center', height: 28,
    background: 'rgba(0,0,0,0.6)',
  }}>
    <span style={{
      padding: '0 8px', height: '100%', display: 'flex', alignItems: 'center',
      background: mode === 'NORMAL' ? '#1a1525' :
                  mode === 'VOICE'  ? 'var(--violet)' :
                  mode === 'INSERT' ? 'var(--cyan)' : '#222',
      color: mode === 'NORMAL' ? 'var(--text-hi)' : '#000',
      fontWeight: 700, letterSpacing: 0.6,
    }}>{mode}</span>
    <span style={{ padding: '0 10px', color: 'var(--text-mid)', flex: 1 }}>
      {cmd}{cursor && <span style={{
        display: 'inline-block', width: 7, height: 12, background: 'var(--text-hi)',
        marginLeft: 2, verticalAlign: 'text-bottom',
        animation: 'breathe 1s steps(2, end) infinite',
      }} />}
    </span>
    <span style={{ padding: '0 8px', color: 'var(--text-lo)' }}>:q :w</span>
  </div>
);

// ============================================================
// D1 — Boot / onboarding (cold start, hacker handshake)
// ============================================================
const D_Boot = () => (
  <TermPhone>
    <div style={{
      height: 'calc(100% - 30px)', padding: '20px 18px 36px',
      fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--text-hi)',
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 8, height: 8, background: 'var(--violet)',
            boxShadow: '0 0 8px var(--violet)', animation: 'breathe 1.4s infinite',
          }} />
          <span style={{ color: 'var(--text-hi)', fontWeight: 600 }}>LUCID</span>
          <span style={{ color: 'var(--text-lo)' }}>·</span>
          <span style={{ color: 'var(--text-lo)' }}>v0.3.1-beta</span>
        </div>
        <span style={{ color: 'var(--text-lo)', fontSize: 10 }}>0x1A4F · ARM64</span>
      </div>

      <div style={{ marginTop: 6 }}>
        {[
          { c: 'mint', t: '✓ runtime: bun 1.1.0' },
          { c: 'mint', t: '✓ agent: claude-3.7-sonnet · 200K' },
          { c: 'mint', t: '✓ voice: whisper-v3 · 0.4s latency' },
          { c: 'mint', t: '✓ workspace: 4 projects · 142 commits' },
          { c: 'mid', t: '→ load last session? ./idea-garden' },
        ].map((l, i) => (
          <div key={i} style={{
            color: l.c === 'mint' ? 'var(--mint)' : 'var(--text-mid)',
            opacity: 0, animation: `term-fade 0.5s ease-in ${i * 0.12 + 0.2}s forwards`,
          }}>{l.t}</div>
        ))}
        <style>{`@keyframes term-fade { to { opacity: 1 } }`}</style>
      </div>

      <div style={{ marginTop: 10, padding: 12, border: '1px dashed rgba(255,107,157,0.4)', background: 'rgba(255,107,157,0.05)' }}>
        <div style={{ color: 'var(--rose)', fontSize: 10, letterSpacing: 1.2, marginBottom: 6 }}>// WELCOME</div>
        <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 24, color: 'var(--text-hi)', lineHeight: 1.1 }}>
          Think it. Speak it.
          <br/><span className="aurora-text">Watch it boot.</span>
        </div>
      </div>

      <div style={{ marginTop: 8 }}>
        <div style={{ color: 'var(--text-lo)' }}># try one of these</div>
        {[
          'lucid new "habit tracker w/ lunar themes"',
          'lucid clone github.com/me/idea-garden',
          'lucid hold-to-speak ⏵',
        ].map((c, i) => (
          <div key={i} style={{ color: i === 2 ? 'var(--cyan)' : 'var(--text-mid)' }}>
            <span style={{ color: 'var(--rose)' }}>$ </span>{c}
          </div>
        ))}
      </div>

      {/* prompt with cursor */}
      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: 'var(--rose)' }}>›</span>
        <span style={{ color: 'var(--text-lo)' }}>type or hold mic</span>
        <span style={{
          display: 'inline-block', width: 7, height: 13, background: 'var(--text-hi)',
          marginLeft: 2, animation: 'breathe 1s steps(2) infinite',
        }} />
      </div>
    </div>
    <VimBar mode="NORMAL" cmd=":wake lucid" />
  </TermPhone>
);

// ============================================================
// D2 — Repos / project list as `ls -la`
// ============================================================
const D_Repos = () => (
  <TermPhone>
    <TermAppBar project="" branch="-" state="IDLE" />
    <div style={{
      padding: '14px 18px 70px', fontFamily: 'var(--font-mono)', fontSize: 11.5,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <span style={{ color: 'var(--rose)' }}>$</span>
        <span style={{ color: 'var(--text-hi)' }}>lucid ls --recent</span>
      </div>

      {/* column header */}
      <div style={{
        display: 'grid', gridTemplateColumns: '24px 1fr 56px 50px',
        gap: 8, color: 'var(--text-lo)', fontSize: 10, paddingBottom: 4,
        borderBottom: '1px dashed rgba(255,255,255,0.08)', marginBottom: 6,
      }}>
        <span></span><span>NAME</span><span>STATE</span><span style={{ textAlign: 'right' }}>EDITED</span>
      </div>

      {[
        { idx: '01', name: 'idea-garden', stack: 'next · pg', state: 'RUN',  tone: 'mint', age: '2m' },
        { idx: '02', name: 'quiet-hours', stack: 'expo · rn', state: 'DRAFT', tone: 'mid',  age: '17h' },
        { idx: '03', name: 'tide',        stack: 'vite · sb', state: 'SHIP',  tone: 'cyan', age: '1d' },
        { idx: '04', name: 'lantern',     stack: 'next · sqlite', state: 'STOP', tone: 'lo',  age: '3d' },
        { idx: '05', name: 'drift',       stack: '—',         state: 'NEW', tone: 'rose', age: '—' },
      ].map((p, i) => (
        <div key={p.name} style={{
          display: 'grid', gridTemplateColumns: '24px 1fr 56px 50px', gap: 8,
          padding: '8px 0', alignItems: 'center',
          borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.04)' : 'none',
          background: i === 0 ? 'linear-gradient(90deg, rgba(255,107,157,0.08), transparent)' : 'transparent',
          marginLeft: -8, paddingLeft: 8, marginRight: -8, paddingRight: 8,
        }}>
          <span style={{ color: 'var(--text-lo)' }}>{p.idx}</span>
          <span>
            <div style={{ color: 'var(--text-hi)', fontWeight: 600 }}>
              {i === 0 && <span style={{ color: 'var(--rose)', marginRight: 4 }}>›</span>}
              {p.name}
            </div>
            <div style={{ color: 'var(--text-lo)', fontSize: 10 }}>{p.stack}</div>
          </span>
          <span style={{
            fontSize: 10, letterSpacing: 0.5, padding: '2px 4px',
            color: p.tone === 'mint' ? 'var(--mint)' :
                   p.tone === 'cyan' ? 'var(--cyan)' :
                   p.tone === 'rose' ? 'var(--rose)' :
                   p.tone === 'lo' ? 'var(--text-lo)' : 'var(--text-mid)',
            border: `1px solid ${
              p.tone === 'mint' ? 'rgba(94,255,178,0.5)' :
              p.tone === 'cyan' ? 'rgba(107,229,255,0.5)' :
              p.tone === 'rose' ? 'rgba(255,107,157,0.5)' :
              'rgba(255,255,255,0.15)'
            }`,
            textAlign: 'center', display: 'inline-block', width: 48,
          }}>{p.state}</span>
          <span style={{ textAlign: 'right', color: 'var(--text-lo)', fontSize: 10 }}>{p.age}</span>
        </div>
      ))}

      <div style={{ marginTop: 12, color: 'var(--text-lo)', fontSize: 10 }}>
        5 results · sorted by edited · use ↑/↓ to select · enter to open
      </div>

      <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: 'var(--rose)' }}>$</span>
        <span style={{
          display: 'inline-block', width: 7, height: 13, background: 'var(--text-hi)',
          animation: 'breathe 1s steps(2) infinite',
        }} />
      </div>
    </div>
    <VimBar mode="NORMAL" cmd=":open 01" />
  </TermPhone>
);

// ============================================================
// D3 — Coding session (the main screen)
// ============================================================
const D_Session = () => (
  <TermPhone>
    <TermAppBar project="idea-garden" branch="main" state="GEN" />
    <div style={{
      padding: '10px 14px 90px', fontFamily: 'var(--font-mono)', fontSize: 11,
      lineHeight: 1.55, overflow: 'hidden',
    }}>
      {/* prompt + voice */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 4 }}>
        <span style={{ color: 'var(--cyan)' }}>›</span>
        <div style={{ flex: 1 }}>
          <div style={{ color: 'var(--text-hi)' }}>add reflection card at 9pm w/ soft chime</div>
          <div style={{ color: 'var(--text-lo)', fontSize: 9.5, marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>voice · 0:12</span>
            <BlockWave count={14} active={false} color="var(--text-lo)" />
          </div>
        </div>
      </div>

      {/* agent ack */}
      <div style={{ color: 'var(--rose)', marginTop: 8 }}>
        <span>● lucid</span>
        <span style={{ color: 'var(--text-lo)' }}>  thought 4s · 3 files</span>
      </div>

      {/* ascii plan tree */}
      <div style={{ marginTop: 4, color: 'var(--text-mid)' }}>
        <div><span style={{ color: 'var(--mint)' }}>├─ ✓</span> create ReflectionCard.tsx</div>
        <div><span style={{ color: 'var(--mint)' }}>├─ ✓</span> wire chime hook</div>
        <div><span style={{ color: 'var(--violet)' }}>├─ ◐</span> schedule cron 21:00 <span style={{ color: 'var(--violet)', animation: 'breathe 1s infinite' }}>▮</span></div>
        <div><span style={{ color: 'var(--text-lo)' }}>└─ ○</span> mount on home</div>
      </div>

      {/* diff block */}
      <div style={{
        marginTop: 10, border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(0,0,0,0.3)',
      }}>
        <div style={{
          padding: '5px 8px', borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', justifyContent: 'space-between', fontSize: 10,
          color: 'var(--text-mid)',
        }}>
          <span>~/components/ReflectionCard.tsx</span>
          <span><span style={{ color: 'var(--mint)' }}>+22</span> <span style={{ color: 'var(--rose)' }}>−0</span></span>
        </div>
        <div style={{ padding: '6px 8px' }}>
          {[
            { d: '+', t: 'export function ReflectionCard() {' },
            { d: '+', t: '  const [t, setT] = useState("")' },
            { d: '+', t: '  return (' },
            { d: '+', t: '    <Card chime="soft">' },
            { d: '+', t: '      <Prompt>What stayed?</Prompt>' },
            { d: '+', t: '    </Card>' },
            { d: '+', t: '  )' },
          ].map((l, i) => (
            <div key={i} style={{
              background: 'rgba(94,255,178,0.06)', color: 'var(--mint)',
              fontSize: 10.5, whiteSpace: 'pre',
            }}>{l.d} {l.t}</div>
          ))}
        </div>
      </div>

      {/* run output */}
      <div style={{ marginTop: 8 }}>
        <div style={{ color: 'var(--text-lo)' }}>$ pnpm typecheck</div>
        <div style={{ color: 'var(--mint)' }}>✓ tsc · 0 errors</div>
        <div style={{ color: 'var(--text-lo)' }}>$ pnpm dev</div>
        <div style={{ color: 'var(--cyan)' }}>➜ localhost:5173 · HMR</div>
        <div style={{ color: 'var(--rose)' }}>● scheduled cron @ 21:00 daily</div>
      </div>

      {/* next */}
      <div style={{ marginTop: 10, color: 'var(--text-mid)' }}>
        <span style={{ color: 'var(--rose)' }}>›</span> ready · <span style={{ color: 'var(--cyan)' }}>ship it</span> · <span style={{ color: 'var(--violet)' }}>add chime sound</span> · <span style={{ color: 'var(--text-mid)' }}>another turn</span>
      </div>
    </div>

    {/* bottom — mode tray + mic */}
    <div style={{
      position: 'absolute', bottom: 50, left: 12, right: 12,
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <div style={{
        flex: 1, height: 36, border: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', padding: '0 10px',
        fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-lo)', gap: 8,
      }}>
        <span style={{ color: 'var(--rose)' }}>›</span>
        <span>type or hold ▮</span>
        <span style={{
          marginLeft: 'auto', display: 'inline-block', width: 6, height: 12,
          background: 'var(--text-hi)', animation: 'breathe 1s steps(2) infinite',
        }} />
      </div>
      <div style={{
        width: 36, height: 36, background: 'var(--rose)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', color: '#000',
        boxShadow: '0 0 18px var(--rose)',
      }}><IconMic size={16} stroke="#000" sw={2.4} /></div>
    </div>

    <VimBar mode="INSERT" cmd="add reflection card at 9pm w/ soft" />
  </TermPhone>
);

// ============================================================
// D4 — Plan as ascii tree
// ============================================================
const D_Plan = () => (
  <TermPhone>
    <TermAppBar project="idea-garden" branch="main" state="PLAN" />
    <div style={{
      padding: '12px 16px 90px', fontFamily: 'var(--font-mono)', fontSize: 11.5,
      lineHeight: 1.55, overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ color: 'var(--text-hi)', fontWeight: 600 }}>plan.tree</span>
        <span style={{ color: 'var(--text-lo)', fontSize: 10 }}>2/5 · est 4m</span>
      </div>

      {/* progress bar — terminal style */}
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--rose)', marginBottom: 10 }}>
        [<span style={{ color: 'var(--mint)' }}>██</span><span style={{ color: 'var(--violet)' }}>▓</span><span style={{ color: 'var(--text-lo)' }}>░░</span>] <span style={{ color: 'var(--text-mid)' }}>40%</span>
      </div>

      {/* ascii tree */}
      <div style={{ color: 'var(--text-hi)' }}>
        <div><span style={{ color: 'var(--rose)' }}>◆</span> reflection-card-9pm</div>
        <div style={{ color: 'var(--text-lo)' }}>│  branched from main · 18 min ago</div>
        <div style={{ marginTop: 6 }}>
          <div><span style={{ color: 'var(--mint)' }}>├─[✓]</span> read card patterns</div>
          <div style={{ color: 'var(--text-lo)', paddingLeft: 16 }}>│   └─ src/components/Card.tsx +3 more · 12s</div>
          <div><span style={{ color: 'var(--mint)' }}>├─[✓]</span> design card shape</div>
          <div style={{ color: 'var(--text-lo)', paddingLeft: 16 }}>│   └─ soft · glow-violet · textarea · 6s</div>
          <div><span style={{ color: 'var(--violet)', animation: 'breathe 1.4s infinite' }}>├─[◐]</span> <span style={{ color: 'var(--violet)' }}>wire 9pm cron</span></div>
          <div style={{ color: 'var(--text-mid)', paddingLeft: 16 }}>│   ├─ background.ts · writing<span style={{ animation: 'breathe 1s steps(2) infinite' }}>▮</span></div>
          <div style={{ color: 'var(--text-lo)', paddingLeft: 16 }}>│   └─ request notif perms · queued</div>
          <div><span style={{ color: 'var(--text-lo)' }}>├─[ ]</span> <span style={{ color: 'var(--text-mid)' }}>mount on home</span></div>
          <div style={{ color: 'var(--text-lo)', paddingLeft: 16 }}>│   └─ replace today-quote slot</div>
          <div><span style={{ color: 'var(--text-lo)' }}>└─[ ]</span> <span style={{ color: 'var(--text-mid)' }}>migrate db</span></div>
          <div style={{ color: 'var(--text-lo)', paddingLeft: 16 }}>    └─ +1 table: reflections</div>
        </div>
      </div>

      {/* file deltas */}
      <div style={{ marginTop: 14, padding: 8, border: '1px dashed rgba(255,255,255,0.08)' }}>
        <div style={{ color: 'var(--text-lo)', fontSize: 10, marginBottom: 4 }}>// FILES TOUCHED</div>
        {[
          { f: 'components/ReflectionCard.tsx', a: 22, d: 0 },
          { f: 'lib/background.ts', a: 18, d: 4 },
          { f: 'app/home/index.tsx', a: 7, d: 4 },
          { f: 'db/schema.sql', a: 6, d: 0 },
        ].map(f => (
          <div key={f.f} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-mid)', fontSize: 10.5 }}>
            <span>{f.f}</span>
            <span><span style={{ color: 'var(--mint)' }}>+{f.a}</span> <span style={{ color: 'var(--rose)' }}>−{f.d}</span></span>
          </div>
        ))}
      </div>

      {/* control row */}
      <div style={{
        marginTop: 14, display: 'flex', gap: 6, fontSize: 10.5,
      }}>
        <span style={{ padding: '3px 6px', border: '1px solid var(--mint)', color: 'var(--mint)' }}>[a] approve</span>
        <span style={{ padding: '3px 6px', border: '1px solid var(--rose)', color: 'var(--rose)' }}>[r] revise</span>
        <span style={{ padding: '3px 6px', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--text-mid)' }}>[q] cancel</span>
      </div>
    </div>
    <VimBar mode="NORMAL" cmd=":approve" />
  </TermPhone>
);

// ============================================================
// D5 — Run / Preview split
// ============================================================
const D_Run = () => (
  <TermPhone>
    <TermAppBar project="idea-garden" branch="main" state="LIVE" />
    <div style={{
      padding: '8px 12px 90px', fontFamily: 'var(--font-mono)', fontSize: 11,
    }}>
      {/* tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 8 }}>
        {[
          { l: 'CODE', sel: false },
          { l: 'PREVIEW', sel: true },
          { l: 'SHELL', sel: false },
        ].map(t => (
          <div key={t.l} style={{
            padding: '4px 10px', fontSize: 10, letterSpacing: 0.6,
            borderBottom: t.sel ? '1.5px solid var(--rose)' : '1.5px solid rgba(255,255,255,0.06)',
            color: t.sel ? 'var(--text-hi)' : 'var(--text-lo)',
            fontWeight: t.sel ? 700 : 400,
          }}>{t.l}</div>
        ))}
        <div style={{ flex: 1, borderBottom: '1.5px solid rgba(255,255,255,0.06)' }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ color: 'var(--mint)' }}>● localhost:5173</span>
        <span style={{ color: 'var(--text-lo)' }}>HMR · 142ms</span>
      </div>

      {/* preview crate */}
      <div style={{
        border: '1px solid rgba(255,255,255,0.1)', padding: 8,
        background: 'rgba(0,0,0,0.4)', marginBottom: 10,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-lo)', fontSize: 9.5, marginBottom: 6 }}>
          <span>┌── reflection-card ──┐</span>
          <span>9:00pm</span>
        </div>
        <div style={{
          background: 'linear-gradient(180deg, #14111e, #0a0a1a)', padding: 14,
          border: '1px solid rgba(255,107,157,0.3)',
          position: 'relative',
        }}>
          <div style={{ position: 'absolute', top: 8, right: 8, color: 'var(--cyan)', fontSize: 9 }}>◐ waxing</div>
          <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 17, color: 'var(--text-hi)', lineHeight: 1.2 }}>
            What stayed<br/>with you today?
          </div>
          <div style={{ marginTop: 10, height: 1, background: 'rgba(255,107,157,0.5)', boxShadow: '0 0 6px var(--rose)' }} />
          <div style={{ marginTop: 8, color: 'var(--text-lo)', fontSize: 10 }}>tap to write · or speak</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-lo)', fontSize: 9.5, marginTop: 6 }}>
          <span>└─────────────────────┘</span>
          <span>chime · pong.wav</span>
        </div>
      </div>

      {/* shell log */}
      <div style={{ color: 'var(--text-mid)' }}>
        {[
          { c: 'lo', t: '[21:00:00.142]' , m: 'cron fired · reflection' },
          { c: 'mint', t: '[21:00:00.158]', m: '✓ card mounted'  },
          { c: 'cyan', t: '[21:00:00.203]', m: '♪ chime · 0.4s'  },
          { c: 'mid', t: '[21:00:01.512]', m: 'user input begin'  },
        ].map((l, i) => (
          <div key={i} style={{ display: 'flex', gap: 6, fontSize: 10.5 }}>
            <span style={{ color: 'var(--text-lo)' }}>{l.t}</span>
            <span style={{
              color: l.c === 'mint' ? 'var(--mint)' :
                     l.c === 'cyan' ? 'var(--cyan)' :
                     l.c === 'rose' ? 'var(--rose)' :
                     'var(--text-mid)',
            }}>{l.m}</span>
          </div>
        ))}
      </div>
    </div>
    <VimBar mode="NORMAL" cmd=":deploy" />
  </TermPhone>
);

// ============================================================
// D6 — Listening (active voice — terminal version)
// ============================================================
const D_Listening = () => (
  <TermPhone>
    <TermAppBar project="idea-garden" branch="main" state="REC" />
    <div style={{
      padding: '14px 16px 90px', fontFamily: 'var(--font-mono)', fontSize: 11.5,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <div style={{
          width: 8, height: 8, background: 'var(--rose)',
          boxShadow: '0 0 10px var(--rose)', animation: 'breathe 0.8s infinite',
        }} />
        <span style={{ color: 'var(--rose)', fontWeight: 700, letterSpacing: 1 }}>RECORDING</span>
        <span style={{ color: 'var(--text-lo)', marginLeft: 'auto' }}>0:11.4</span>
      </div>

      <div style={{ color: 'var(--text-lo)', fontSize: 10, letterSpacing: 1, marginBottom: 6 }}>
        // TRANSCRIBING · whisper-v3 · 0.4s
      </div>

      {/* big transcript */}
      <div style={{
        fontFamily: 'var(--font-display)', fontStyle: 'italic',
        fontSize: 22, lineHeight: 1.3, color: 'var(--text-hi)',
        padding: '10px 0', borderTop: '1px dashed rgba(255,255,255,0.1)',
        borderBottom: '1px dashed rgba(255,255,255,0.1)',
      }}>
        "make the reflection card open with a soft chime, show tonight's moon phase quietly in the corner"
        <span style={{
          display: 'inline-block', width: 2, height: 22, marginLeft: 4,
          background: 'var(--cyan)', verticalAlign: 'middle',
          animation: 'breathe 0.9s steps(2) infinite',
        }} />
      </div>

      {/* live tokens */}
      <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {[
          ['reflection-card', 'cyan'],
          ['chime: soft', 'rose'],
          ['moon.phase', 'cyan'],
          ['corner', 'mid'],
          ['quiet', 'mid'],
        ].map(([t, c], i) => (
          <span key={i} style={{
            padding: '1px 6px', fontSize: 9.5,
            color: c === 'cyan' ? 'var(--cyan)' : c === 'rose' ? 'var(--rose)' : 'var(--text-mid)',
            border: `1px solid ${
              c === 'cyan' ? 'rgba(107,229,255,0.4)' :
              c === 'rose' ? 'rgba(255,107,157,0.4)' :
              'rgba(255,255,255,0.1)'
            }`,
          }}>{t}</span>
        ))}
      </div>

      {/* big block wave */}
      <div style={{
        marginTop: 22, padding: 14,
        border: '1px solid rgba(255,107,157,0.3)',
        background: 'rgba(255,107,157,0.04)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <BlockWave count={42} active color="var(--rose)" />
        </div>
        <div style={{ textAlign: 'center', marginTop: 12, color: 'var(--text-mid)', fontSize: 10 }}>
          release to send · drag up to cancel
        </div>
      </div>
    </div>

    {/* fat mic */}
    <div style={{
      position: 'absolute', bottom: 50, left: 12, right: 12, height: 50,
      background: 'var(--rose)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
      color: '#000', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 12,
      letterSpacing: 1.5, boxShadow: '0 0 30px rgba(255,107,157,0.6)',
    }}>
      <IconStop size={14} />
      <span>HOLD · 0:11</span>
    </div>

    <VimBar mode="VOICE" cmd="recording…" />
  </TermPhone>
);

Object.assign(window, { D_Boot, D_Repos, D_Session, D_Plan, D_Run, D_Listening, BlockWave, VimBar, TermAppBar });
