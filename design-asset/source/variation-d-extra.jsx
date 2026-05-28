/* variation-d-extra.jsx — more D screens + landscape mode */

// ============================================================
// D7 — File tree (vim-style nav)
// ============================================================
const D_Files = () => {
  const tree = [
    { d: 0, t: 'idea-garden', kind: 'root' },
    { d: 1, t: 'app', kind: 'dir', open: true },
    { d: 2, t: 'home', kind: 'dir', open: true },
    { d: 3, t: 'index.tsx', kind: 'file', delta: '+7', sel: false },
    { d: 3, t: 'today.tsx', kind: 'file' },
    { d: 2, t: 'reflection', kind: 'dir', open: true, ai: true },
    { d: 3, t: 'page.tsx', kind: 'file', delta: '+12', ai: true },
    { d: 1, t: 'components', kind: 'dir', open: true },
    { d: 2, t: 'Card.tsx', kind: 'file' },
    { d: 2, t: 'ReflectionCard.tsx', kind: 'file', delta: '+22', sel: true, ai: true },
    { d: 2, t: 'Prompt.tsx', kind: 'file' },
    { d: 1, t: 'lib', kind: 'dir', open: true },
    { d: 2, t: 'background.ts', kind: 'file', delta: '+18 −4', ai: true },
    { d: 2, t: 'chime.ts', kind: 'file', delta: '+6', ai: true },
    { d: 1, t: 'db', kind: 'dir' },
    { d: 1, t: 'public', kind: 'dir' },
    { d: 1, t: 'package.json', kind: 'file' },
    { d: 1, t: '.lucidrc', kind: 'file', special: true },
  ];
  return (
    <TermPhone>
      <TermAppBar project="idea-garden" branch="reflection-card-9pm" state="EDIT" />
      <div style={{ padding: '10px 12px 90px', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ color: 'var(--text-hi)', fontWeight: 600 }}>:Explore</span>
          <span style={{ color: 'var(--text-lo)', fontSize: 10 }}>18 files · 3 changed</span>
        </div>

        {/* tree */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {tree.map((n, i) => {
            const indent = '  '.repeat(n.d);
            const chev = n.kind === 'dir' ? (n.open ? '▾' : '▸') : ' ';
            const icon = n.kind === 'root' ? '◆' : n.kind === 'dir' ? (n.open ? '' : '') : '·';
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '2px 6px', marginLeft: -6, marginRight: -6,
                background: n.sel ? 'rgba(255,107,157,0.12)' : 'transparent',
                borderLeft: n.sel ? '2px solid var(--rose)' : '2px solid transparent',
              }}>
                <span style={{ color: 'var(--text-lo)', whiteSpace: 'pre' }}>{indent}{chev}</span>
                <span style={{
                  color: n.sel ? 'var(--rose)' :
                         n.kind === 'root' ? 'var(--cyan)' :
                         n.kind === 'dir' ? 'var(--text-hi)' :
                         n.special ? 'var(--violet)' :
                         n.ai ? 'var(--text-hi)' :
                         'var(--text-mid)',
                  fontWeight: n.kind === 'dir' || n.kind === 'root' || n.sel ? 600 : 400,
                }}>
                  {n.t}
                  {n.kind === 'dir' && '/'}
                </span>
                {n.ai && <span style={{ color: 'var(--rose)', fontSize: 9, marginLeft: 4 }}>● lucid</span>}
                {n.delta && <span style={{
                  marginLeft: 'auto', fontSize: 9.5,
                  color: 'var(--mint)',
                }}>{n.delta}</span>}
              </div>
            );
          })}
        </div>

        {/* file preview footer */}
        <div style={{ marginTop: 14, padding: 8, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.3)' }}>
          <div style={{ color: 'var(--text-lo)', fontSize: 9.5, marginBottom: 4 }}>
            // PREVIEW · components/ReflectionCard.tsx
          </div>
          <Syntax code={`export function ReflectionCard() {
  return <Card chime="soft">…`} fontSize={10} />
        </div>

        <div style={{ marginTop: 10, color: 'var(--text-lo)', fontSize: 9.5 }}>
          j/k navigate · l open · / search · gd diff · cmd-p quick-open
        </div>
      </div>
      <VimBar mode="NORMAL" cmd=":e components/ReflectionCard.tsx" />
    </TermPhone>
  );
};

// ============================================================
// D8 — Settings (.lucidrc config)
// ============================================================
const D_Settings = () => (
  <TermPhone>
    <TermAppBar project="idea-garden" branch="-" state="CONF" />
    <div style={{ padding: '10px 14px 90px', fontFamily: 'var(--font-mono)', fontSize: 11, lineHeight: 1.6 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ color: 'var(--violet)', fontWeight: 600 }}>~/.lucidrc</span>
        <span style={{ color: 'var(--text-lo)', fontSize: 9.5 }}>read-only · cmd-e edit</span>
      </div>

      <div style={{ padding: 10, border: '1px dashed rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)' }}>
        {/* TOML-ish */}
        <div style={{ color: 'var(--text-lo)' }}># lucid config · v0.3.1</div>
        <div style={{ color: 'var(--text-lo)' }}># edited 2 min ago</div>
        <br/>
        <div><span style={{ color: 'var(--rose)' }}>[agent]</span></div>
        <div>model    = <span style={{ color: 'var(--cyan)' }}>"claude-sonnet-4.5"</span></div>
        <div>context  = <span style={{ color: 'var(--mint)' }}>200_000</span> <span style={{ color: 'var(--text-lo)' }}># tokens</span></div>
        <div>plan     = <span style={{ color: 'var(--violet)' }}>"think-hard"</span></div>
        <div>verify   = <span style={{ color: 'var(--mint)' }}>true</span></div>
        <br/>
        <div><span style={{ color: 'var(--rose)' }}>[providers]</span></div>
        <div>active   = <span style={{ color: 'var(--cyan)' }}>"anthropic"</span></div>
        <div>anthropic.key = <span style={{ color: 'var(--cyan)' }}>"sk-ant-···k29x"</span> <span style={{ color: 'var(--mint)' }}># keychain</span></div>
        <div>openai.key    = <span style={{ color: 'var(--text-lo)' }}>""</span> <span style={{ color: 'var(--rose)' }}># empty</span></div>
        <div>ollama.url    = <span style={{ color: 'var(--cyan)' }}>"localhost:11434"</span></div>
        <div>fallback = <span style={{ color: 'var(--cyan)' }}>"lucid-cloud"</span></div>
        <div>on_device_only = <span style={{ color: 'var(--mint)' }}>true</span></div>
        <br/>
        <div><span style={{ color: 'var(--rose)' }}>[voice]</span></div>
        <div>stt      = <span style={{ color: 'var(--cyan)' }}>"whisper-v3"</span></div>
        <div>tts      = <span style={{ color: 'var(--cyan)' }}>"none"</span></div>
        <div>hotkey   = <span style={{ color: 'var(--cyan)' }}>"hold-mic"</span></div>
        <div>vad      = <span style={{ color: 'var(--mint)' }}>0.4</span></div>
        <br/>
        <div><span style={{ color: 'var(--rose)' }}>[ui]</span></div>
        <div>theme    = <span style={{ color: 'var(--cyan)' }}>"lucid-terminal"</span></div>
        <div>density  = <span style={{ color: 'var(--cyan)' }}>"compact"</span></div>
        <div>scanlines = <span style={{ color: 'var(--mint)' }}>true</span></div>
        <div>aurora_accent = <span style={{ color: 'var(--cyan)' }}>"#FF6B9D"</span></div>
        <br/>
        <div><span style={{ color: 'var(--rose)' }}>[tools]</span></div>
        <div>shell    = [<span style={{ color: 'var(--cyan)' }}>"bash"</span>, <span style={{ color: 'var(--cyan)' }}>"pnpm"</span>]</div>
        <div>preview  = <span style={{ color: 'var(--cyan)' }}>"vite"</span></div>
        <div>deploy   = <span style={{ color: 'var(--cyan)' }}>"vercel"</span></div>
      </div>

      {/* quick controls */}
      <div style={{ marginTop: 14, color: 'var(--text-lo)', fontSize: 10 }}>// QUICK TOGGLES</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
        {[
          { l: 'auto-approve diffs', v: 'off',  tone: 'rose' },
          { l: 'voice on launch',    v: 'on',   tone: 'mint' },
          { l: 'verify before ship', v: 'on',   tone: 'mint' },
          { l: 'background agents',  v: '2/4',  tone: 'cyan' },
        ].map(s => (
          <div key={s.l} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '6px 10px',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <span style={{ color: 'var(--text-mid)' }}>{s.l}</span>
            <span style={{
              padding: '1px 6px', fontSize: 10, letterSpacing: 0.5,
              color: s.tone === 'mint' ? 'var(--mint)' :
                     s.tone === 'rose' ? 'var(--rose)' : 'var(--cyan)',
              border: `1px solid ${
                s.tone === 'mint' ? 'rgba(94,255,178,0.5)' :
                s.tone === 'rose' ? 'rgba(255,107,157,0.5)' :
                'rgba(107,229,255,0.5)'
              }`,
            }}>{s.v.toUpperCase()}</span>
          </div>
        ))}
      </div>
    </div>
    <VimBar mode="NORMAL" cmd=":e ~/.lucidrc" />
  </TermPhone>
);

// ============================================================
// D9 — Agents (parallel sessions)
// ============================================================
const D_Agents = () => (
  <TermPhone>
    <TermAppBar project="idea-garden" branch="main" state="3 LIVE" />
    <div style={{ padding: '10px 14px 90px', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ color: 'var(--text-hi)', fontWeight: 600 }}>:Agents</span>
        <span style={{ color: 'var(--text-lo)', fontSize: 10 }}>4 sessions · 2 wait input</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { id: 'α', name: 'reflection-card-9pm', state: 'GEN', tone: 'violet', task: 'writing cron · 3/5', wave: true },
          { id: 'β', name: 'fix-typo-welcome', state: 'WAIT', tone: 'rose', task: 'awaits your approval', wave: false },
          { id: 'γ', name: 'migrate-db-reflections', state: 'RUN', tone: 'mint', task: 'pnpm migrate · 12s', wave: true },
          { id: 'δ', name: 'optimize-bundle', state: 'DONE', tone: 'cyan', task: '−42 KB · ready to merge', wave: false },
        ].map((a, i) => {
          const tones = {
            violet: 'var(--violet)', rose: 'var(--rose)', mint: 'var(--mint)', cyan: 'var(--cyan)',
          };
          const borders = {
            violet: 'rgba(139,111,255,0.4)', rose: 'rgba(255,107,157,0.4)',
            mint: 'rgba(94,255,178,0.4)', cyan: 'rgba(107,229,255,0.4)',
          };
          return (
            <div key={a.id} style={{
              padding: 10, border: `1px solid ${borders[a.tone]}`,
              background: i === 0 ? 'rgba(139,111,255,0.05)' : 'rgba(0,0,0,0.2)',
              display: 'flex', flexDirection: 'column', gap: 6,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: tones[a.tone], color: '#000', fontWeight: 700, fontSize: 11,
                    boxShadow: a.wave ? `0 0 8px ${tones[a.tone]}` : 'none',
                  }}>{a.id}</span>
                  <span style={{ color: 'var(--text-hi)', fontWeight: 600 }}>{a.name}</span>
                </div>
                <span style={{
                  fontSize: 9.5, padding: '1px 5px', letterSpacing: 0.5,
                  color: tones[a.tone],
                  border: `1px solid ${tones[a.tone]}`,
                  animation: a.state === 'GEN' || a.state === 'RUN' ? 'breathe 1.4s infinite' : 'none',
                }}>{a.state}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-mid)', fontSize: 10.5 }}>
                <span style={{ color: 'var(--text-lo)' }}>›</span>
                <span style={{ flex: 1 }}>{a.task}</span>
                {a.wave && <BlockWave count={10} color={tones[a.tone]} active />}
              </div>
            </div>
          );
        })}
      </div>

      {/* spawn */}
      <div style={{
        marginTop: 12, padding: 10, border: '1px dashed rgba(255,255,255,0.15)',
        background: 'rgba(0,0,0,0.2)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ color: 'var(--rose)' }}>+</span>
        <span style={{ color: 'var(--text-lo)' }}>spawn new agent · hold mic, name it</span>
        <span style={{
          marginLeft: 'auto', display: 'inline-block', width: 6, height: 12,
          background: 'var(--text-hi)', animation: 'breathe 1s steps(2) infinite',
        }} />
      </div>
    </div>
    <VimBar mode="NORMAL" cmd=":agent spawn" />
  </TermPhone>
);

// ============================================================
// LANDSCAPE PHONE FRAME
// ============================================================
const LandTermPhone = ({ children, scanlines = true, label = 'idea-garden' }) => (
  <div style={{
    width: 660, height: 320, borderRadius: 38, position: 'relative', overflow: 'hidden',
    background: '#000',
    boxShadow: '0 0 0 1.5px rgba(255,255,255,0.06), 0 30px 80px -20px rgba(0,0,0,0.7)',
  }}>
    {/* dynamic island — left side when rotated */}
    <div style={{
      position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)',
      width: 37, height: 126, borderRadius: 24, background: '#000', zIndex: 50,
    }} />

    <div style={{
      position: 'absolute', inset: 0,
      background: 'linear-gradient(180deg, #08070f 0%, #050409 100%)',
    }}>
      {/* grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '16px 16px',
        maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 95%)',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 95%)',
      }} />
      {/* corner ember */}
      <div style={{
        position: 'absolute', top: -80, right: -60, width: 220, height: 220, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,107,157,0.22), transparent 70%)',
        filter: 'blur(20px)', pointerEvents: 'none',
      }} />
      {scanlines && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.018) 0px, transparent 1px, transparent 2px, rgba(255,255,255,0.018) 3px)',
          mixBlendMode: 'overlay', opacity: 0.7,
        }} />
      )}
      {/* top strip — rotated status (when rotated landscape, vertical at left edge) */}
      <div style={{
        position: 'absolute', top: 12, right: 22, fontSize: 11, fontWeight: 600,
        color: 'var(--text-hi)', fontFamily: 'var(--font-mono)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ opacity: 0.7 }}>
          <svg width="14" height="9" viewBox="0 0 19 12"><rect x="0" y="7.5" width="3.2" height="4.5" rx="0.7" fill="currentColor"/><rect x="4.8" y="5" width="3.2" height="7" rx="0.7" fill="currentColor"/><rect x="9.6" y="2.5" width="3.2" height="9.5" rx="0.7" fill="currentColor"/><rect x="14.4" y="0" width="3.2" height="12" rx="0.7" fill="currentColor"/></svg>
        </span>
        <span style={{ opacity: 0.7 }}>
          <svg width="18" height="9" viewBox="0 0 27 13"><rect x="0.5" y="0.5" width="23" height="12" rx="3.5" stroke="currentColor" strokeOpacity="0.4" fill="none"/><rect x="2" y="2" width="17" height="9" rx="2" fill="currentColor"/></svg>
        </span>
        <span>09:41</span>
      </div>
      {/* content area — leave space for island on left */}
      <div style={{ position: 'absolute', inset: '0 18px 0 60px' }}>
        {children}
      </div>
      {/* home indicator */}
      <div style={{
        position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%) rotate(90deg)',
        width: 110, height: 5, borderRadius: 999, background: 'rgba(255,255,255,0.28)',
        transformOrigin: 'center',
      }} />
    </div>
  </div>
);

// pane helper
const Pane = ({ title, children, badge, tone = 'muted', noPad = false, footer }) => {
  const tones = {
    violet: 'var(--violet)', cyan: 'var(--cyan)', rose: 'var(--rose)', mint: 'var(--mint)', muted: 'rgba(255,255,255,0.4)',
  };
  return (
    <div style={{
      flex: 1, minWidth: 0, height: '100%',
      borderRight: '1px solid rgba(255,255,255,0.08)',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'var(--font-mono)',
    }}>
      <div style={{
        padding: '6px 10px', borderBottom: '1px dashed rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontSize: 10, color: 'var(--text-lo)', letterSpacing: 0.8,
        background: 'rgba(0,0,0,0.3)',
      }}>
        <span style={{ color: tones[tone], fontWeight: 700 }}>{title}</span>
        {badge && <span style={{ color: 'var(--text-mid)' }}>{badge}</span>}
      </div>
      <div style={{ flex: 1, padding: noPad ? 0 : '8px 10px', overflow: 'hidden', fontSize: 10.5 }}>
        {children}
      </div>
      {footer && <div style={{
        padding: '4px 10px', borderTop: '1px dashed rgba(255,255,255,0.08)',
        fontSize: 9.5, color: 'var(--text-lo)', background: 'rgba(0,0,0,0.3)',
      }}>{footer}</div>}
    </div>
  );
};

// ============================================================
// D-L1 — Session 3-pane (the killer landscape layout)
// ============================================================
const D_Land_Session = () => (
  <LandTermPhone>
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* top app bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 10px 6px', fontFamily: 'var(--font-mono)', fontSize: 10.5,
        borderBottom: '1px dashed rgba(255,255,255,0.08)',
      }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ color: 'var(--text-hi)', fontWeight: 700 }}>~/idea-garden</span>
          <span style={{ color: 'var(--cyan)' }}>⎇ reflection-card-9pm</span>
          <span style={{ color: 'var(--violet)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 5, height: 5, background: 'var(--violet)', boxShadow: '0 0 6px var(--violet)' }} />
            GEN · α
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10, color: 'var(--text-lo)' }}>
          <span>2:14 elapsed</span>
          <span>+47 −8</span>
        </div>
      </div>

      {/* 3 panes */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* PLAN */}
        <Pane title="PLAN" badge="2/5" tone="rose" footer="j/k · a:approve">
          <div style={{ color: 'var(--text-mid)', lineHeight: 1.7 }}>
            <div><span style={{ color: 'var(--mint)' }}>├─[✓]</span> card UI</div>
            <div><span style={{ color: 'var(--mint)' }}>├─[✓]</span> chime hook</div>
            <div><span style={{ color: 'var(--violet)', animation: 'breathe 1.4s infinite' }}>├─[◐]</span> <span style={{ color: 'var(--violet)' }}>cron 21:00</span></div>
            <div style={{ paddingLeft: 16, fontSize: 9.5, color: 'var(--text-lo)' }}>│   writing<span style={{ animation: 'breathe 1s steps(2) infinite' }}>▮</span></div>
            <div><span style={{ color: 'var(--text-lo)' }}>├─[ ]</span> mount</div>
            <div><span style={{ color: 'var(--text-lo)' }}>└─[ ]</span> db migrate</div>
          </div>
          <div style={{
            marginTop: 12, padding: 6,
            border: '1px solid rgba(94,255,178,0.4)',
            color: 'var(--mint)', fontSize: 9.5, textAlign: 'center',
          }}>[A] APPROVE PLAN</div>
        </Pane>

        {/* CODE */}
        <Pane title="CODE" badge="background.ts +18" tone="cyan" footer="cmd-s save · gd diff">
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ color: 'var(--text-lo)', fontSize: 9.5, textAlign: 'right', userSelect: 'none' }}>
              {Array.from({ length: 12 }).map((_, i) => <div key={i}>{i + 1}</div>)}
            </div>
            <div style={{ flex: 1 }}>
              <Syntax code={`import { schedule } from 'cron'
import { card } from '@/runtime'

export function init() {
  schedule('0 21 * * *', () => {
    card.open('reflection', {
      chime: 'soft',
      moon: today.phase
    })
  })
}`} fontSize={10} />
            </div>
          </div>
        </Pane>

        {/* PREVIEW */}
        <Pane title="PREVIEW" badge="localhost · HMR" tone="mint" footer="● live · 142ms">
          <div style={{
            border: '1px solid rgba(255,107,157,0.3)',
            background: 'linear-gradient(180deg, #14111e, #0a0a1a)',
            padding: 10, position: 'relative', height: '100%',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div style={{ position: 'absolute', top: 6, right: 8, color: 'var(--cyan)', fontSize: 8 }}>◐</div>
            <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 14, color: 'var(--text-hi)', lineHeight: 1.15 }}>
              What stayed<br/>with you today?
            </div>
            <div style={{ height: 1, background: 'rgba(255,107,157,0.5)', boxShadow: '0 0 6px var(--rose)' }} />
            <div style={{ color: 'var(--text-lo)', fontSize: 9 }}>↑ tap to write</div>
            <div style={{
              marginTop: 'auto', alignSelf: 'center',
              fontSize: 8.5, color: 'var(--text-lo)',
            }}>9:00pm · chime</div>
          </div>
        </Pane>
      </div>

      {/* bottom command bar */}
      <div style={{
        height: 26, borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 10,
        background: 'rgba(0,0,0,0.6)',
      }}>
        <span style={{ padding: '0 8px', height: '100%', display: 'flex', alignItems: 'center', background: 'var(--cyan)', color: '#000', fontWeight: 700, letterSpacing: 0.6 }}>INSERT</span>
        <span style={{ padding: '0 10px', color: 'var(--text-mid)', flex: 1 }}>
          › make the chime softer at night
          <span style={{
            display: 'inline-block', width: 6, height: 11, background: 'var(--text-hi)',
            marginLeft: 2, animation: 'breathe 1s steps(2) infinite', verticalAlign: 'text-bottom',
          }} />
        </span>
        <span style={{
          padding: '0 8px', height: '100%', display: 'flex', alignItems: 'center', gap: 6,
          background: 'var(--rose)', color: '#000', fontWeight: 700,
        }}>
          <IconMic size={11} stroke="#000" sw={2.4} /> HOLD
        </span>
      </div>
    </div>
  </LandTermPhone>
);

// ============================================================
// D-L2 — Listening (landscape — transcript HERO)
// ============================================================
const D_Land_Listening = () => (
  <LandTermPhone>
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* mini header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 10px 6px', fontFamily: 'var(--font-mono)', fontSize: 10.5,
        borderBottom: '1px dashed rgba(255,255,255,0.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 8, height: 8, background: 'var(--rose)',
            boxShadow: '0 0 10px var(--rose)', animation: 'breathe 0.8s infinite',
          }} />
          <span style={{ color: 'var(--rose)', fontWeight: 700, letterSpacing: 1 }}>RECORDING</span>
          <span style={{ color: 'var(--text-lo)' }}>0:14.2 · whisper-v3</span>
        </div>
        <span style={{ color: 'var(--text-lo)' }}>release to send · drag up to cancel</span>
      </div>

      {/* hero transcript */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '20px 24px',
        position: 'relative',
      }}>
        <div style={{ color: 'var(--text-lo)', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 1, marginBottom: 14 }}>
          // LIVE TRANSCRIPT
        </div>
        <div style={{
          fontFamily: 'var(--font-display)', fontStyle: 'italic',
          fontSize: 30, lineHeight: 1.2, color: 'var(--text-hi)',
          maxWidth: 460,
        }}>
          "make the reflection card open with a soft chime, and show tonight's moon phase quietly in the corner"
          <span style={{
            display: 'inline-block', width: 3, height: 28, marginLeft: 4,
            background: 'var(--cyan)', verticalAlign: 'middle',
            animation: 'breathe 0.9s steps(2) infinite',
          }} />
        </div>

        {/* live tokens */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 18, fontFamily: 'var(--font-mono)' }}>
          {[
            ['reflection-card', 'cyan'],
            ['chime: soft', 'rose'],
            ['moon.phase', 'cyan'],
            ['corner', 'mid'],
            ['quiet', 'mid'],
            ['→ 3 files', 'mint'],
          ].map(([t, c], i) => (
            <span key={i} style={{
              padding: '2px 7px', fontSize: 10.5,
              color: c === 'cyan' ? 'var(--cyan)' : c === 'rose' ? 'var(--rose)' : c === 'mint' ? 'var(--mint)' : 'var(--text-mid)',
              border: `1px solid ${
                c === 'cyan' ? 'rgba(107,229,255,0.4)' :
                c === 'rose' ? 'rgba(255,107,157,0.4)' :
                c === 'mint' ? 'rgba(94,255,178,0.4)' :
                'rgba(255,255,255,0.1)'
              }`,
            }}>{t}</span>
          ))}
        </div>
      </div>

      {/* fat waveform strip + hold pill */}
      <div style={{
        padding: '10px 20px', borderTop: '1px solid rgba(255,107,157,0.3)',
        background: 'rgba(255,107,157,0.04)',
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <div style={{ flex: 1 }}>
          <BlockWave count={80} active color="var(--rose)" />
        </div>
        <div style={{
          padding: '8px 16px', background: 'var(--rose)', color: '#000',
          fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 11,
          letterSpacing: 1.5, display: 'flex', alignItems: 'center', gap: 8,
          boxShadow: '0 0 24px rgba(255,107,157,0.5)',
        }}>
          <IconStop size={12} stroke="#000" sw={2.4} />
          HOLD · 0:14
        </div>
      </div>
    </div>
  </LandTermPhone>
);

// ============================================================
// D-L3 — Run / multi-shell landscape
// ============================================================
const D_Land_Run = () => (
  <LandTermPhone>
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 10px 6px', fontFamily: 'var(--font-mono)', fontSize: 10.5,
        borderBottom: '1px dashed rgba(255,255,255,0.08)',
      }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ color: 'var(--text-hi)', fontWeight: 700 }}>~/idea-garden</span>
          <span style={{ color: 'var(--mint)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 5, height: 5, background: 'var(--mint)', boxShadow: '0 0 6px var(--mint)' }} />
            LIVE · localhost:5173
          </span>
        </div>
        <span style={{ color: 'var(--text-lo)' }}>HMR · 142ms · 0 errors</span>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* shell log */}
        <Pane title="SHELL" badge="$ pnpm dev" tone="mint" footer="↑/↓ history">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, color: 'var(--text-mid)', fontSize: 10 }}>
            {[
              { l: '[09:41:00.142]', m: 'cron fired · reflection', c: 'mid' },
              { l: '[09:41:00.158]', m: '✓ card mounted', c: 'mint' },
              { l: '[09:41:00.203]', m: '♪ chime · pong.wav · 0.4s', c: 'cyan' },
              { l: '[09:41:01.512]', m: 'user input begin', c: 'mid' },
              { l: '[09:41:14.018]', m: '✓ saved entry · #142', c: 'mint' },
              { l: '[09:41:14.119]', m: 'analytics: reflection_done', c: 'mid' },
              { l: '', m: '', c: 'mid' },
              { l: '[09:42:32.882]', m: 'lucid · plan applied', c: 'rose' },
              { l: '[09:42:33.120]', m: '+47 −8 · 3 files', c: 'mint' },
              { l: '[09:42:33.418]', m: 'HMR reload · 142ms', c: 'cyan' },
              { l: '', m: '', c: 'mid' },
              { l: '$ _', m: '', c: 'hi' },
            ].map((e, i) => (
              <div key={i} style={{ display: 'flex', gap: 6 }}>
                <span style={{ color: 'var(--text-lo)' }}>{e.l}</span>
                <span style={{
                  color: e.c === 'mint' ? 'var(--mint)' :
                         e.c === 'cyan' ? 'var(--cyan)' :
                         e.c === 'rose' ? 'var(--rose)' :
                         e.c === 'hi' ? 'var(--text-hi)' :
                         'var(--text-mid)',
                }}>{e.m}</span>
              </div>
            ))}
            <span style={{
              display: 'inline-block', width: 6, height: 11, background: 'var(--text-hi)',
              marginLeft: 2, animation: 'breathe 1s steps(2) infinite',
            }} />
          </div>
        </Pane>

        {/* preview pane */}
        <Pane title="PREVIEW" badge="iPhone 15 · 9:00pm" tone="rose">
          <div style={{
            border: '1px solid rgba(255,107,157,0.3)',
            background: 'linear-gradient(180deg, #14111e, #0a0a1a)',
            padding: 12, position: 'relative', height: '100%',
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-lo)', fontSize: 8.5 }}>
              <span>idea-garden</span>
              <span style={{ color: 'var(--cyan)' }}>◐ waxing</span>
            </div>
            <div style={{
              fontFamily: 'var(--font-display)', fontStyle: 'italic',
              fontSize: 18, color: 'var(--text-hi)', lineHeight: 1.2, marginTop: 8,
            }}>
              What stayed<br/>with you today?
            </div>
            <div style={{ height: 1, background: 'rgba(255,107,157,0.5)', boxShadow: '0 0 6px var(--rose)' }} />
            <div style={{
              flex: 1, background: 'rgba(255,255,255,0.04)', padding: 8,
              border: '1px solid rgba(255,255,255,0.08)',
              fontSize: 9.5, color: 'var(--text-lo)',
            }}>i finally finished that...</div>
            <div style={{
              alignSelf: 'flex-end', padding: '3px 10px',
              background: 'var(--rose)', color: '#000', fontFamily: 'var(--font-mono)',
              fontSize: 9, fontWeight: 700,
            }}>SAVE</div>
          </div>
        </Pane>

        {/* diff pane */}
        <Pane title="DIFF" badge="3 files" tone="violet" footer=":diffsplit">
          {[
            { f: 'ReflectionCard.tsx', a: 22, d: 0 },
            { f: 'background.ts',      a: 18, d: 4 },
            { f: 'home/index.tsx',     a: 7,  d: 4 },
            { f: 'db/schema.sql',      a: 6,  d: 0 },
          ].map((fl, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', padding: '3px 0',
              borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              fontSize: 9.5,
            }}>
              <span style={{ color: 'var(--text-hi)' }}>{fl.f}</span>
              <span><span style={{ color: 'var(--mint)' }}>+{fl.a}</span> {fl.d > 0 && <span style={{ color: 'var(--rose)' }}>−{fl.d}</span>}</span>
            </div>
          ))}
          <div style={{ marginTop: 10, color: 'var(--text-lo)', fontSize: 9 }}>// AGENT NOTES</div>
          <div style={{ marginTop: 4, color: 'var(--text-mid)', fontSize: 9.5, lineHeight: 1.5 }}>
            kept chime soft. moon glyph uses unicode (◐) so it scales clean.
          </div>
          <div style={{
            marginTop: 10, padding: 5, fontSize: 9, textAlign: 'center',
            background: 'var(--mint)', color: '#000', fontWeight: 700, letterSpacing: 0.6,
          }}>[S] SHIP TO MAIN</div>
        </Pane>
      </div>
    </div>
  </LandTermPhone>
);

Object.assign(window, {
  D_Files, D_Settings, D_Agents,
  D_Land_Session, D_Land_Listening, D_Land_Run,
  LandTermPhone, Pane,
});
