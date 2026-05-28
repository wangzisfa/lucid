/* variation-d-live.jsx — INTERACTIVE D screens
   - D_Live_Session: portrait with real hold-to-record mic
   - D_Live_Land:    landscape with resizable 3-pane + mic
   - D_Deploy:       animated deploy/ship sequence */

// ─── hook: hold to record ──────────────────────────────────
function useHoldRecord() {
  const [state, setState] = React.useState('idle'); // idle | rec | trans | done
  const [elapsed, setElapsed] = React.useState(0);
  const timerRef = React.useRef(null);
  const cleanupRefs = React.useRef([]);

  const cancelTimers = () => {
    cleanupRefs.current.forEach(clearTimeout);
    cleanupRefs.current = [];
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const start = (e) => {
    if (e) e.preventDefault();
    cancelTimers();
    setState('rec');
    setElapsed(0);
    const t0 = performance.now();
    timerRef.current = setInterval(() => setElapsed((performance.now() - t0) / 1000), 80);
  };

  const stop = () => {
    setState(s => {
      if (s !== 'rec') return s;
      if (timerRef.current) clearInterval(timerRef.current);
      cleanupRefs.current.push(setTimeout(() => setState('trans'), 0));
      cleanupRefs.current.push(setTimeout(() => setState('done'), 950));
      cleanupRefs.current.push(setTimeout(() => { setState('idle'); setElapsed(0); }, 5500));
      return 'rec'; // setState in timeout above transitions out
    });
  };

  React.useEffect(() => () => cancelTimers(), []);
  return { state, elapsed, start, stop };
}

// ─── live waveform (driven by rAF, not CSS keyframes) ──────
function LiveWave({ active = true, count = 28, color = 'var(--rose)', height = 24 }) {
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    if (!active) return;
    let raf;
    const loop = () => { setTick(performance.now()); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active]);
  const blocks = ['▁','▂','▃','▄','▅','▆','▇','█'];
  return (
    <div style={{
      display: 'flex', gap: 1, alignItems: 'flex-end', height,
      fontFamily: 'var(--font-mono)', color, fontSize: height * 0.85, lineHeight: 0.5, letterSpacing: -1,
    }}>
      {Array.from({ length: count }).map((_, i) => {
        const t = tick / 200 + i * 0.6;
        const v = active
          ? 0.5 + 0.5 * Math.sin(t) * Math.cos(t * 0.7 + i * 0.3) + 0.3 * Math.sin(t * 2.3 + i)
          : 0.2;
        const idx = Math.max(0, Math.min(blocks.length - 1, Math.floor(Math.abs(v) * blocks.length)));
        return <span key={i} style={{ opacity: active ? 0.6 + Math.abs(v) * 0.4 : 0.25 }}>{blocks[idx]}</span>;
      })}
    </div>
  );
}

// ─── transcription tokens (faux) ───────────────────────────
const liveTokens = [
  ['make', 'mid'], ['the', 'mid'], ['reflection-card', 'cyan'],
  ['open', 'mid'], ['with', 'mid'], ['a', 'mid'],
  ['soft', 'rose'], ['chime', 'rose'], ['at', 'mid'], ['9pm', 'cyan'],
];
const TOKEN_COLOR = (c) => c === 'cyan' ? 'var(--cyan)' : c === 'rose' ? 'var(--rose)' : c === 'mint' ? 'var(--mint)' : 'var(--text-mid)';

// ============================================================
// D_Live_Session — interactive portrait session
// ============================================================
const D_Live_Session = () => {
  const mic = useHoldRecord();
  const [turns, setTurns] = React.useState([
    { kind: 'user', text: 'add reflection card at 9pm w/ soft chime', voice: true, dur: 12 },
    { kind: 'ai', tree: true, diff: true },
  ]);

  // when a recording finishes, add a new user turn
  React.useEffect(() => {
    if (mic.state === 'done') {
      setTurns(t => [...t, { kind: 'user', text: 'make it softer at night', voice: true, dur: Math.max(1, Math.round(mic.elapsed * 10) / 10), fresh: true }]);
      const tm = setTimeout(() => setTurns(t => [...t, { kind: 'ai-thinking', fresh: true }]), 400);
      return () => clearTimeout(tm);
    }
  }, [mic.state]);

  const visibleTokens = mic.state === 'rec'
    ? liveTokens.slice(0, Math.min(liveTokens.length, Math.floor(mic.elapsed * 1.5)))
    : [];

  return (
    <TermPhone>
      <TermAppBar project="idea-garden" branch="reflection-card-9pm"
        state={mic.state === 'rec' ? 'REC' : mic.state === 'trans' ? 'STT' : mic.state === 'done' ? 'GEN' : 'IDLE'} />

      <div style={{
        padding: '8px 12px 130px', fontFamily: 'var(--font-mono)', fontSize: 11,
        lineHeight: 1.55, overflow: 'hidden', maxHeight: 480, overflowY: 'auto',
      }} className="no-scrollbar">
        {turns.map((turn, i) => {
          if (turn.kind === 'user') {
            return (
              <div key={i} style={{
                marginBottom: 8,
                animation: turn.fresh ? 'term-fade 0.4s ease-out' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                  <span style={{ color: 'var(--cyan)' }}>›</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: 'var(--text-hi)' }}>{turn.text}</div>
                    <div style={{ color: 'var(--text-lo)', fontSize: 9.5, marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>voice · 0:{String(Math.round(turn.dur * 10) / 10).padStart(2, '0')}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          }
          if (turn.kind === 'ai-thinking') {
            return (
              <div key={i} style={{ marginBottom: 8, animation: 'term-fade 0.3s' }}>
                <div style={{ color: 'var(--rose)' }}>● lucid</div>
                <div style={{ color: 'var(--text-mid)', marginTop: 2 }}>
                  thinking<span style={{ display: 'inline-block', animation: 'breathe 1s steps(2) infinite' }}>▮</span>
                </div>
              </div>
            );
          }
          // ai (existing static)
          return (
            <div key={i}>
              <div style={{ color: 'var(--rose)' }}>● lucid<span style={{ color: 'var(--text-lo)' }}>  thought 4s · 3 files</span></div>
              <div style={{ marginTop: 4, color: 'var(--text-mid)' }}>
                <div><span style={{ color: 'var(--mint)' }}>├─ ✓</span> create ReflectionCard.tsx</div>
                <div><span style={{ color: 'var(--mint)' }}>├─ ✓</span> wire chime hook</div>
                <div><span style={{ color: 'var(--mint)' }}>├─ ✓</span> schedule cron 21:00</div>
                <div><span style={{ color: 'var(--mint)' }}>└─ ✓</span> mount on home</div>
              </div>
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
                  <span><span style={{ color: 'var(--mint)' }}>+22</span></span>
                </div>
                <div style={{ padding: '6px 8px' }}>
                  <Syntax code={`export function ReflectionCard() {
  return (
    <Card chime="soft">
      <Prompt>What stayed?</Prompt>
    </Card>
  )
}`} fontSize={10} />
                </div>
              </div>
              <div style={{ marginTop: 8, color: 'var(--text-mid)' }}>
                <span style={{ color: 'var(--rose)' }}>›</span> ready · <span style={{ color: 'var(--cyan)' }}>ship</span> · <span style={{ color: 'var(--violet)' }}>tweak</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* OVERLAY when recording */}
      {mic.state === 'rec' && (
        <div style={{
          position: 'absolute', left: 12, right: 12, bottom: 140,
          padding: 12, background: 'rgba(255,107,157,0.08)',
          border: '1px solid var(--rose)', boxShadow: '0 0 24px rgba(255,107,157,0.3)',
          fontFamily: 'var(--font-mono)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--rose)', letterSpacing: 0.8, marginBottom: 6 }}>
            <span>● REC</span>
            <span>{mic.elapsed.toFixed(1)}s</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
            <LiveWave active count={42} color="var(--rose)" height={28} />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, minHeight: 16 }}>
            {visibleTokens.map(([t, c], i) => (
              <span key={i} style={{
                padding: '1px 5px', fontSize: 9.5,
                color: TOKEN_COLOR(c),
                border: `1px solid ${
                  c === 'cyan' ? 'rgba(107,229,255,0.4)' :
                  c === 'rose' ? 'rgba(255,107,157,0.4)' :
                  'rgba(255,255,255,0.1)'
                }`,
                animation: 'term-fade 0.2s',
              }}>{t}</span>
            ))}
          </div>
        </div>
      )}

      {mic.state === 'trans' && (
        <div style={{
          position: 'absolute', left: 12, right: 12, bottom: 140,
          padding: 12, background: 'rgba(107,229,255,0.06)',
          border: '1px solid var(--cyan)',
          fontFamily: 'var(--font-mono)', fontSize: 10.5,
          color: 'var(--cyan)', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ width: 6, height: 6, background: 'var(--cyan)', boxShadow: '0 0 6px var(--cyan)', animation: 'breathe 0.6s infinite' }} />
          TRANSCRIBING · whisper-v3
        </div>
      )}

      {/* bottom — input + mic */}
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
          <span>{mic.state === 'rec' ? 'listening…' : 'hold mic to speak'}</span>
        </div>
        <button
          onPointerDown={mic.start}
          onPointerUp={mic.stop}
          onPointerLeave={mic.stop}
          onContextMenu={(e) => e.preventDefault()}
          style={{
            width: 44, height: 36, background: mic.state === 'rec' ? '#fff' : 'var(--rose)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#000', border: 'none', padding: 0, cursor: 'pointer',
            boxShadow: mic.state === 'rec' ? '0 0 28px var(--rose), 0 0 60px rgba(255,107,157,0.4)' : '0 0 12px rgba(255,107,157,0.4)',
            touchAction: 'none', userSelect: 'none',
            transform: mic.state === 'rec' ? 'scale(1.08)' : 'scale(1)',
            transition: 'transform 0.12s ease, box-shadow 0.12s ease',
          }}
        >
          {mic.state === 'rec'
            ? <IconStop size={14} stroke="var(--rose)" fill="var(--rose)" sw={2} />
            : <IconMic size={16} stroke="#000" sw={2.4} />}
        </button>
      </div>

      <VimBar mode={mic.state === 'rec' ? 'VOICE' : 'NORMAL'} cmd={mic.state === 'rec' ? `recording… (${mic.elapsed.toFixed(1)}s)` : 'hold mic'} />
    </TermPhone>
  );
};

// ============================================================
// D_Live_Land — landscape with resizable panes + working mic
// ============================================================
const D_Live_Land = () => {
  const [widths, setWidths] = React.useState([28, 38, 34]);
  const containerRef = React.useRef(null);
  const mic = useHoldRecord();

  const startDrag = (idx) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = containerRef.current.getBoundingClientRect();
    const startX = e.clientX;
    const startWidths = [...widths];
    const minW = 15;
    const onMove = (ev) => {
      const dx = ((ev.clientX - startX) / rect.width) * 100;
      let a = startWidths[idx] + dx;
      let b = startWidths[idx + 1] - dx;
      if (a < minW) { b -= (minW - a); a = minW; }
      if (b < minW) { a -= (minW - b); b = minW; }
      const next = [...startWidths];
      next[idx] = a; next[idx + 1] = b;
      setWidths(next);
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const PaneHandle = ({ idx }) => (
    <div
      onPointerDown={startDrag(idx)}
      style={{
        width: 6, height: '100%', cursor: 'col-resize', flexShrink: 0,
        position: 'relative', userSelect: 'none', touchAction: 'none',
        background: 'rgba(255,255,255,0.04)',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        borderRight: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div style={{
        position: 'absolute', left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)',
        width: 2, height: 22, background: 'rgba(255,107,157,0.6)',
        boxShadow: '0 0 6px rgba(255,107,157,0.5)',
      }} />
    </div>
  );

  return (
    <LandTermPhone>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 10px 6px', fontFamily: 'var(--font-mono)', fontSize: 10.5,
          borderBottom: '1px dashed rgba(255,255,255,0.08)',
        }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ color: 'var(--text-hi)', fontWeight: 700 }}>~/idea-garden</span>
            <span style={{ color: 'var(--cyan)' }}>⎇ reflection-card-9pm</span>
            <span style={{ color: 'var(--rose)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 5, height: 5, background: 'var(--rose)', boxShadow: '0 0 6px var(--rose)' }} />
              {mic.state === 'rec' ? 'REC' : 'LIVE'}
            </span>
          </div>
          <div style={{ color: 'var(--text-lo)', fontSize: 10 }}>drag dividers · hold mic</div>
        </div>

        <div ref={containerRef} style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* PLAN */}
          <div style={{ width: `${widths[0]}%`, height: '100%', overflow: 'hidden' }}>
            <Pane title="PLAN" badge={`${widths[0].toFixed(0)}%`} tone="rose" footer="a:approve">
              <div style={{ color: 'var(--text-mid)', lineHeight: 1.7 }}>
                <div><span style={{ color: 'var(--mint)' }}>├─[✓]</span> card UI</div>
                <div><span style={{ color: 'var(--mint)' }}>├─[✓]</span> chime hook</div>
                <div><span style={{ color: 'var(--violet)', animation: 'breathe 1.4s infinite' }}>├─[◐]</span> <span style={{ color: 'var(--violet)' }}>cron 21:00</span></div>
                <div style={{ paddingLeft: 16, fontSize: 9.5, color: 'var(--text-lo)' }}>│   writing<span style={{ animation: 'breathe 1s steps(2) infinite' }}>▮</span></div>
                <div><span style={{ color: 'var(--text-lo)' }}>├─[ ]</span> mount</div>
                <div><span style={{ color: 'var(--text-lo)' }}>└─[ ]</span> migrate</div>
              </div>
              <div style={{
                marginTop: 10, padding: 5,
                border: '1px solid rgba(94,255,178,0.4)',
                color: 'var(--mint)', fontSize: 9, textAlign: 'center', letterSpacing: 0.6,
              }}>[A] APPROVE</div>
            </Pane>
          </div>

          <PaneHandle idx={0} />

          {/* CODE */}
          <div style={{ width: `${widths[1]}%`, height: '100%', overflow: 'hidden' }}>
            <Pane title="CODE" badge={`background.ts · ${widths[1].toFixed(0)}%`} tone="cyan" footer="cmd-s save">
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ color: 'var(--text-lo)', fontSize: 9, textAlign: 'right', userSelect: 'none', lineHeight: 1.65 }}>
                  {Array.from({ length: 10 }).map((_, i) => <div key={i}>{i + 1}</div>)}
                </div>
                <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                  <Syntax code={`import { schedule } from 'cron'
import { card } from '@/runtime'

export function init() {
  schedule('0 21 * * *', () => {
    card.open('reflection', {
      chime: 'soft',
      moon: today.phase
    })
  })
}`} fontSize={9.5} />
                </div>
              </div>
            </Pane>
          </div>

          <PaneHandle idx={1} />

          {/* PREVIEW */}
          <div style={{ width: `${widths[2]}%`, height: '100%', overflow: 'hidden' }}>
            <Pane title="PREVIEW" badge={`${widths[2].toFixed(0)}%`} tone="mint" footer="● HMR 142ms">
              <div style={{
                border: '1px solid rgba(255,107,157,0.3)',
                background: 'linear-gradient(180deg, #14111e, #0a0a1a)',
                padding: 10, position: 'relative', height: '100%',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              }}>
                <div style={{ position: 'absolute', top: 6, right: 8, color: 'var(--cyan)', fontSize: 9 }}>◐</div>
                <div style={{
                  fontFamily: 'var(--font-display)', fontStyle: 'italic',
                  fontSize: 14, color: 'var(--text-hi)', lineHeight: 1.15,
                }}>
                  What stayed<br/>with you today?
                </div>
                <div style={{ height: 1, background: 'rgba(255,107,157,0.5)', boxShadow: '0 0 6px var(--rose)' }} />
                <div style={{ color: 'var(--text-lo)', fontSize: 9 }}>↑ tap to write</div>
                <div style={{ alignSelf: 'center', fontSize: 8.5, color: 'var(--text-lo)' }}>9:00pm · chime</div>
              </div>
            </Pane>
          </div>
        </div>

        {/* live REC strip (overlay top of bottom bar when recording) */}
        {mic.state === 'rec' && (
          <div style={{
            padding: '6px 12px', background: 'rgba(255,107,157,0.10)',
            borderTop: '1px solid rgba(255,107,157,0.4)',
            display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'var(--font-mono)',
          }}>
            <span style={{ color: 'var(--rose)', fontSize: 10, fontWeight: 700, letterSpacing: 0.8 }}>● REC</span>
            <span style={{ color: 'var(--text-lo)', fontSize: 10 }}>{mic.elapsed.toFixed(1)}s</span>
            <div style={{ flex: 1 }}><LiveWave active count={60} color="var(--rose)" height={18} /></div>
          </div>
        )}

        {/* bottom bar */}
        <div style={{
          height: 30, borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center',
          fontFamily: 'var(--font-mono)', fontSize: 10,
          background: 'rgba(0,0,0,0.6)',
        }}>
          <span style={{
            padding: '0 8px', height: '100%', display: 'flex', alignItems: 'center',
            background: mic.state === 'rec' ? 'var(--rose)' : '#1a1525',
            color: mic.state === 'rec' ? '#000' : 'var(--text-hi)',
            fontWeight: 700, letterSpacing: 0.6,
          }}>{mic.state === 'rec' ? 'VOICE' : 'NORMAL'}</span>
          <span style={{ padding: '0 10px', color: 'var(--text-mid)', flex: 1, minWidth: 0, overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {mic.state === 'rec' ? `› listening… (${mic.elapsed.toFixed(1)}s)` : '› hold mic to speak'}
          </span>
          <button
            onPointerDown={mic.start}
            onPointerUp={mic.stop}
            onPointerLeave={mic.stop}
            onContextMenu={(e) => e.preventDefault()}
            style={{
              padding: '0 12px', height: '100%', display: 'flex', alignItems: 'center', gap: 6,
              background: mic.state === 'rec' ? '#fff' : 'var(--rose)',
              color: '#000', fontWeight: 700, fontSize: 10, border: 'none',
              cursor: 'pointer', touchAction: 'none', userSelect: 'none',
              boxShadow: mic.state === 'rec' ? 'inset 0 0 12px var(--rose)' : 'none',
            }}
          >
            {mic.state === 'rec'
              ? <><IconStop size={11} stroke="var(--rose)" fill="var(--rose)" sw={2} /> {mic.elapsed.toFixed(1)}s</>
              : <><IconMic size={11} stroke="#000" sw={2.4} /> HOLD</>}
          </button>
        </div>
      </div>
    </LandTermPhone>
  );
};

// ============================================================
// D_Deploy — animated ship sequence
// ============================================================
const DEPLOY_STEPS = [
  { id: 'check',  label: 'pnpm typecheck',           detail: '0 errors',          dur: 800,  out: '✓ tsc · 142 files · 0 errors' },
  { id: 'lint',   label: 'pnpm lint',                detail: '0 warnings',        dur: 600,  out: '✓ biome · clean' },
  { id: 'test',   label: 'pnpm test',                detail: '47 passed',         dur: 1200, out: '✓ vitest · 47/47 · 312ms' },
  { id: 'build',  label: 'pnpm build',               detail: '142.4 KB gzipped',  dur: 1500, out: '✓ vite · 1.2s · 142.4 KB' },
  { id: 'upload', label: 'lucid push prod',          detail: 'uploading…',        dur: 1800, out: '✓ uploaded · 28 files · 142 KB' },
  { id: 'deploy', label: 'vercel deploy',            detail: 'provisioning…',     dur: 1400, out: '✓ deployed · vercel · ord1' },
  { id: 'ping',   label: 'curl /healthz',            detail: '200 ok',            dur: 600,  out: '✓ live · 142ms' },
];

const D_Deploy = () => {
  const [phase, setPhase] = React.useState(-1); // -1: pre-run, 0..N-1: step running, N: done
  const timers = React.useRef([]);

  const stop = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const run = () => {
    stop();
    setPhase(0);
    let t = 0;
    DEPLOY_STEPS.forEach((s, i) => {
      t += s.dur;
      timers.current.push(setTimeout(() => setPhase(i + 1), t));
    });
  };

  // auto-run once on mount
  React.useEffect(() => { const tm = setTimeout(run, 600); return () => { clearTimeout(tm); stop(); }; }, []);

  const totalSteps = DEPLOY_STEPS.length;
  const done = phase >= totalSteps;
  const progress = Math.min(1, Math.max(0, phase / totalSteps));

  return (
    <TermPhone>
      <TermAppBar project="idea-garden" branch="main"
        state={done ? 'SHIP' : phase >= 0 ? 'DEPLOY' : 'IDLE'} />
      <div style={{
        padding: '10px 14px 90px', fontFamily: 'var(--font-mono)', fontSize: 11,
        lineHeight: 1.55, overflow: 'hidden',
      }}>
        {/* header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ color: 'var(--text-hi)', fontWeight: 600 }}>
            <span style={{ color: 'var(--rose)' }}>$</span> lucid ship --prod
          </span>
          <button onClick={run} style={{
            border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.4)',
            color: 'var(--text-mid)', fontFamily: 'var(--font-mono)', fontSize: 10,
            padding: '2px 8px', cursor: 'pointer',
          }}>↻ replay</button>
        </div>

        {/* progress bar — terminal style */}
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, marginBottom: 10 }}>
          <span style={{ color: 'var(--rose)' }}>[</span>
          <span style={{ color: 'var(--mint)' }}>{'█'.repeat(Math.floor(progress * 18))}</span>
          {phase >= 0 && !done && (
            <span style={{ color: 'var(--violet)', animation: 'breathe 1s steps(2) infinite' }}>▓</span>
          )}
          <span style={{ color: 'var(--text-lo)' }}>{'░'.repeat(Math.max(0, 18 - Math.floor(progress * 18) - (phase >= 0 && !done ? 1 : 0)))}</span>
          <span style={{ color: 'var(--rose)' }}>]</span>
          <span style={{ color: 'var(--text-mid)', marginLeft: 8 }}>
            {Math.round(progress * 100)}% · {done ? 'shipped' : phase < 0 ? 'waiting' : 'running'}
          </span>
        </div>

        {/* step list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {DEPLOY_STEPS.map((s, i) => {
            const state = phase < 0 ? 'pre' : i < phase ? 'done' : i === phase ? 'running' : 'pending';
            return (
              <div key={s.id} style={{
                padding: '4px 0', display: 'flex', flexDirection: 'column', gap: 1,
                opacity: state === 'pending' || state === 'pre' ? 0.4 : 1,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 14, color:
                    state === 'done' ? 'var(--mint)' :
                    state === 'running' ? 'var(--violet)' :
                    'var(--text-lo)',
                  }}>
                    {state === 'done' && '✓'}
                    {state === 'running' && <span style={{ animation: 'breathe 0.8s steps(2) infinite' }}>◐</span>}
                    {(state === 'pending' || state === 'pre') && '·'}
                  </span>
                  <span style={{
                    color: state === 'done' ? 'var(--text-hi)' :
                           state === 'running' ? 'var(--violet)' :
                           'var(--text-mid)',
                    flex: 1,
                  }}>
                    <span style={{ color: 'var(--rose)' }}>$</span> {s.label}
                  </span>
                  <span style={{ color: 'var(--text-lo)', fontSize: 9.5 }}>{s.detail}</span>
                </div>
                {state === 'done' && (
                  <div style={{ color: 'var(--mint)', fontSize: 10, paddingLeft: 22 }}>{s.out}</div>
                )}
                {state === 'running' && (
                  <div style={{ paddingLeft: 22, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <LiveWave active count={16} color="var(--violet)" height={10} />
                    <span style={{ color: 'var(--text-lo)', fontSize: 9.5 }}>{s.detail}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* SHIPPED panel */}
        {done && (
          <div style={{
            marginTop: 12, padding: 12, position: 'relative',
            border: '1px solid var(--mint)', background: 'rgba(94,255,178,0.06)',
            boxShadow: '0 0 28px rgba(94,255,178,0.2)',
            animation: 'term-fade 0.4s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ width: 8, height: 8, background: 'var(--mint)', boxShadow: '0 0 10px var(--mint)' }} />
              <span style={{ color: 'var(--mint)', fontWeight: 700, letterSpacing: 1.5 }}>SHIPPED · v0.3.2</span>
              <span style={{ marginLeft: 'auto', color: 'var(--text-lo)', fontSize: 9.5 }}>9.6s total</span>
            </div>
            <div style={{
              padding: '8px 10px', background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(94,255,178,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 8,
            }}>
              <span style={{ color: 'var(--cyan)', fontSize: 11 }}>idea-garden.vercel.app</span>
              <span style={{ color: 'var(--text-lo)', fontSize: 9.5 }}>↗ open</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 10 }}>
              <div>
                <div style={{ color: 'var(--text-lo)', fontSize: 9 }}>COMMIT</div>
                <div style={{ color: 'var(--text-mid)' }}>3f7a8c2</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-lo)', fontSize: 9 }}>REGION</div>
                <div style={{ color: 'var(--text-mid)' }}>ord1 · us-central</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-lo)', fontSize: 9 }}>BUNDLE</div>
                <div style={{ color: 'var(--text-mid)' }}>142.4 KB · gzipped</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-lo)', fontSize: 9 }}>UPTIME</div>
                <div style={{ color: 'var(--mint)' }}>● live · 0:08</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <VimBar mode={done ? 'NORMAL' : 'INSERT'} cmd={done ? ':open prod' : ':deploy --prod'} />
    </TermPhone>
  );
};

Object.assign(window, { D_Live_Session, D_Live_Land, D_Deploy, useHoldRecord, LiveWave });
