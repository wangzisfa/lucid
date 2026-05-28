/* variation-d-settings.jsx — D Settings screens (terminal-style)
   3 screens:
   - D_Settings_Hub:    sectioned list with inline summaries  (portrait)
   - D_Settings_Model:  agent/model drilldown                  (portrait)
   - D_Settings_Land:   nav | editor | live .lucidrc           (landscape) */

// ─── helpers ─────────────────────────────────────────────
const TermBar = ({ value = 0.5, max = 18, color = 'var(--mint)' }) => {
  const fill = Math.round(value * max);
  return (
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>
      <span style={{ color: 'var(--text-lo)' }}>[</span>
      <span style={{ color }}>{'█'.repeat(fill)}</span>
      <span style={{ color: 'var(--text-lo)' }}>{'░'.repeat(max - fill)}</span>
      <span style={{ color: 'var(--text-lo)' }}>]</span>
    </span>
  );
};

const Toggle = ({ on, color = 'var(--mint)' }) => (
  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, display: 'inline-flex', gap: 3 }}>
    <span style={{
      padding: '1px 6px',
      background: on ? color : 'transparent',
      color: on ? '#000' : 'var(--text-lo)',
      border: `1px solid ${on ? color : 'rgba(255,255,255,0.12)'}`,
      fontWeight: 700, letterSpacing: 0.5,
    }}>ON</span>
    <span style={{
      padding: '1px 6px',
      background: !on ? 'var(--text-lo)' : 'transparent',
      color: !on ? '#000' : 'var(--text-lo)',
      border: `1px solid ${!on ? 'var(--text-lo)' : 'rgba(255,255,255,0.12)'}`,
      fontWeight: 700, letterSpacing: 0.5,
    }}>OFF</span>
  </span>
);

const Stepper = ({ value, color = 'var(--cyan)' }) => (
  <span style={{
    fontFamily: 'var(--font-mono)', fontSize: 10.5, display: 'inline-flex',
    alignItems: 'center', gap: 4, padding: '1px 4px',
    border: `1px solid ${color}55`,
  }}>
    <span style={{ color: 'var(--text-lo)' }}>{'<'}</span>
    <span style={{ color, fontWeight: 600 }}>{value}</span>
    <span style={{ color: 'var(--text-lo)' }}>{'>'}</span>
  </span>
);

// ============================================================
// D_Settings_Hub — main settings menu
// ============================================================
const D_Settings_Hub = () => {
  const sections = [
    { sel: true, key: 'agent',        summary: 'claude-sonnet-4.5 · 200K · think-hard', tone: 'rose' },
    { key: 'providers',    summary: '1 linked · 4 empty · BYOK + lucid cloud', tone: 'cyan', badge: 'NEW' },
    { key: 'voice',        summary: 'whisper-v3 · hold-to-speak · vad 0.4', tone: 'cyan' },
    { key: 'approvals',    summary: 'manual diffs · verify before ship',     tone: 'violet' },
    { key: 'memory',       summary: 'project + global · 142 turns kept',    tone: 'mint' },
    { key: 'tools',        summary: 'bash · pnpm · vite · vercel',           tone: 'cyan' },
    { key: 'integrations', summary: 'github · vercel · supabase · 1 off',   tone: 'mint' },
    { key: 'theme',        summary: 'lucid-terminal · compact · scanlines', tone: 'rose' },
    { key: 'workspace',    summary: 'idea-garden · main · .gitignore',      tone: 'violet' },
    { key: 'account',      summary: 'i@example.com · pro · 142h used',      tone: 'cyan' },
    { key: 'danger',       summary: 'reset · clear cache · sign out',        tone: 'rose' },
  ];
  const tones = {
    rose: 'var(--rose)', cyan: 'var(--cyan)', violet: 'var(--violet)', mint: 'var(--mint)',
  };
  return (
    <TermPhone>
      <TermAppBar project="settings" branch="-" state="CONF" />
      <div style={{
        padding: '10px 14px 90px', fontFamily: 'var(--font-mono)', fontSize: 11.5,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <span style={{ color: 'var(--text-hi)', fontWeight: 600 }}>:Settings</span>
          <span style={{ color: 'var(--text-lo)', fontSize: 9.5 }}>10 sections · j/k · enter</span>
        </div>
        <div style={{ color: 'var(--text-lo)', fontSize: 9.5, marginBottom: 12 }}>
          // ~/.lucidrc · synced 2m ago
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {sections.map((s, i) => (
            <div key={s.key} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 10px', marginLeft: -10, marginRight: -10,
              borderLeft: s.sel ? '2px solid var(--rose)' : '2px solid transparent',
              background: s.sel ? 'rgba(255,107,157,0.06)' : 'transparent',
              borderBottom: i < sections.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
            }}>
              <span style={{ color: 'var(--text-lo)', width: 14, fontFamily: 'var(--font-mono)' }}>
                {s.sel ? '›' : ' '}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1, minWidth: 0 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: tones[s.tone], fontWeight: 600 }}>[{s.key}]</span>
                  {s.badge && <span style={{
                    fontSize: 8.5, padding: '1px 4px', letterSpacing: 0.6,
                    background: 'var(--mint)', color: '#000', fontWeight: 700,
                  }}>{s.badge}</span>}
                </span>
                <span style={{ color: 'var(--text-mid)', fontSize: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.summary}
                </span>
              </div>
              <span style={{ color: 'var(--text-lo)' }}>→</span>
            </div>
          ))}
        </div>

        {/* footer hints */}
        <div style={{ marginTop: 14, padding: 8, border: '1px dashed rgba(255,255,255,0.08)', color: 'var(--text-lo)', fontSize: 9.5, lineHeight: 1.6 }}>
          <div><span style={{ color: 'var(--cyan)' }}>:e</span> edit raw .lucidrc</div>
          <div><span style={{ color: 'var(--cyan)' }}>:reload</span> reload config without restart</div>
          <div><span style={{ color: 'var(--rose)' }}>:reset</span> revert to defaults</div>
        </div>
      </div>
      <VimBar mode="NORMAL" cmd=":settings" />
    </TermPhone>
  );
};

// ============================================================
// D_Settings_Model — agent / model drilldown
// ============================================================
const D_Settings_Model = () => (
  <TermPhone>
    <TermAppBar project="settings" branch="-" state="EDIT" />
    <div style={{
      padding: '10px 14px 90px', fontFamily: 'var(--font-mono)', fontSize: 11,
      lineHeight: 1.55,
    }}>
      {/* breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, marginBottom: 8 }}>
        <span style={{ color: 'var(--text-lo)' }}>settings ›</span>
        <span style={{ color: 'var(--rose)', fontWeight: 600 }}>[agent]</span>
      </div>

      {/* MODEL picker */}
      <div style={{ color: 'var(--text-lo)', fontSize: 9.5, letterSpacing: 0.6, marginTop: 4 }}>// MODEL <span style={{ color: 'var(--text-lo)' }}>· routed via [providers]</span></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>
        {[
          { name: 'claude-haiku-4',    note: 'fast · cheap',        tone: 'cyan',   sel: false, via: 'anthropic',  linked: true  },
          { name: 'claude-sonnet-4.5', note: 'balanced · default',  tone: 'rose',   sel: true,  via: 'anthropic',  linked: true  },
          { name: 'claude-opus-4.1',   note: 'deep · slow',         tone: 'violet', sel: false, via: 'anthropic',  linked: true  },
          { name: 'gpt-5',             note: 'fast · cheap',        tone: 'mint',   sel: false, via: 'openai',     linked: false },
          { name: 'gemini-2.5',        note: 'multimodal',          tone: 'cyan',   sel: false, via: 'google',     linked: false },
          { name: 'qwen-32b',          note: 'on-device · 8 t/s',   tone: 'mint',   sel: false, via: 'ollama',     linked: true  },
        ].map(m => {
          const tones = { rose: 'var(--rose)', cyan: 'var(--cyan)', violet: 'var(--violet)', mint: 'var(--mint)' };
          const softs = {
            rose: 'rgba(255,107,157,0.07)', cyan: 'rgba(107,229,255,0.07)',
            violet: 'rgba(139,111,255,0.07)', mint: 'rgba(94,255,178,0.07)',
          };
          return (
            <div key={m.name} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px',
              border: `1px solid ${m.sel ? tones[m.tone] : 'rgba(255,255,255,0.08)'}`,
              background: m.sel ? softs[m.tone] : 'rgba(0,0,0,0.2)',
              opacity: m.linked ? 1 : 0.7,
            }}>
              <span style={{ color: m.sel ? tones[m.tone] : 'var(--text-lo)', fontFamily: 'var(--font-mono)', width: 12 }}>
                {m.sel ? '◉' : '○'}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: m.sel ? 'var(--text-hi)' : 'var(--text-mid)', fontWeight: m.sel ? 600 : 400 }}>{m.name}</span>
                  <span style={{ color: 'var(--text-lo)', fontSize: 9 }}>· {m.note}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 1, fontSize: 8.5 }}>
                  <span style={{ color: 'var(--text-lo)' }}>via</span>
                  <span style={{ color: m.linked ? 'var(--cyan)' : 'var(--text-lo)' }}>{m.via}</span>
                  <span style={{
                    padding: '0 4px', fontWeight: 700, letterSpacing: 0.5,
                    color: m.linked ? 'var(--mint)' : 'var(--rose)',
                    border: `1px solid ${m.linked ? 'rgba(94,255,178,0.5)' : 'rgba(255,107,157,0.5)'}`,
                  }}>{m.linked ? 'KEY ✓' : 'NEEDS KEY'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 4, fontSize: 9.5, color: 'var(--text-lo)' }}>
        → add or test keys in <span style={{ color: 'var(--cyan)' }}>:settings providers</span>
      </div>

      {/* CONTEXT slider */}
      <div style={{ marginTop: 14, color: 'var(--text-lo)', fontSize: 9.5, letterSpacing: 0.6 }}>// CONTEXT</div>
      <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: 'var(--text-mid)' }}>window</span>
        <span style={{ color: 'var(--cyan)' }}>200,000 tokens</span>
      </div>
      <div style={{ marginTop: 3 }}>
        <TermBar value={0.2} max={20} color="var(--cyan)" />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--text-lo)', marginTop: 2 }}>
        <span>50K</span><span>200K</span><span>1M</span>
      </div>

      {/* THINKING */}
      <div style={{ marginTop: 14, color: 'var(--text-lo)', fontSize: 9.5, letterSpacing: 0.6 }}>// THINKING</div>
      <div style={{ marginTop: 6, padding: 8, border: '1px solid rgba(139,111,255,0.3)', background: 'rgba(139,111,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-mid)' }}>budget</span>
          <Stepper value="think-hard" color="var(--violet)" />
        </div>
        <div style={{ marginTop: 6, color: 'var(--text-lo)', fontSize: 9.5, lineHeight: 1.5 }}>
          off · think · think-hard · think-harder<br/>
          → up to 32K reasoning tokens before each turn
        </div>
      </div>

      {/* TEMPERATURE */}
      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ color: 'var(--text-lo)', fontSize: 9.5 }}>// TEMPERATURE</div>
          <div style={{ color: 'var(--text-mid)', marginTop: 2 }}>creativity</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: 'var(--rose)', fontFamily: 'var(--font-mono)' }}>0.30</div>
          <div style={{ fontSize: 9, color: 'var(--text-lo)' }}>precise → wild</div>
        </div>
      </div>
      <div style={{ marginTop: 3 }}>
        <TermBar value={0.3} max={20} color="var(--rose)" />
      </div>

      {/* SYSTEM PROMPT */}
      <div style={{ marginTop: 12, color: 'var(--text-lo)', fontSize: 9.5, letterSpacing: 0.6 }}>// SYSTEM PROMPT</div>
      <div style={{
        marginTop: 4, padding: 8, border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(0,0,0,0.4)', fontSize: 10, color: 'var(--text-mid)',
        lineHeight: 1.55,
      }}>
        <span style={{ color: 'var(--text-lo)' }}># persona.md</span><br/>
        You are <span style={{ color: 'var(--cyan)' }}>Lucid</span>. Build with care.<br/>
        Speak short. Show, don't tell.<br/>
        Verify before shipping.
        <span style={{
          display: 'inline-block', width: 5, height: 10, background: 'var(--text-hi)',
          marginLeft: 2, animation: 'breathe 1s steps(2) infinite', verticalAlign: 'baseline',
        }} />
      </div>

      {/* TOKEN ESTIMATE */}
      <div style={{
        marginTop: 12, padding: 8, border: '1px dashed rgba(94,255,178,0.3)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10,
      }}>
        <span style={{ color: 'var(--text-lo)' }}>est · cost per turn</span>
        <span style={{ color: 'var(--mint)' }}>~6,200 tok · $0.018</span>
      </div>
    </div>
    <VimBar mode="NORMAL" cmd=":w settings/agent" />
  </TermPhone>
);

// ============================================================
// D_Settings_Land — landscape: nav | editor | live .lucidrc
// ============================================================
const D_Settings_Land = () => {
  const sections = [
    { k: 'agent',        sel: true,  tone: 'rose' },
    { k: 'voice',        sel: false, tone: 'cyan' },
    { k: 'approvals',    sel: false, tone: 'violet' },
    { k: 'memory',       sel: false, tone: 'mint' },
    { k: 'tools',        sel: false, tone: 'cyan' },
    { k: 'integrations', sel: false, tone: 'mint' },
    { k: 'theme',        sel: false, tone: 'rose' },
    { k: 'workspace',    sel: false, tone: 'violet' },
    { k: 'account',      sel: false, tone: 'cyan' },
    { k: 'danger',       sel: false, tone: 'rose' },
  ];
  const tones = {
    rose: 'var(--rose)', cyan: 'var(--cyan)', violet: 'var(--violet)', mint: 'var(--mint)',
  };

  return (
    <LandTermPhone>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* top bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 10px 6px', fontFamily: 'var(--font-mono)', fontSize: 10.5,
          borderBottom: '1px dashed rgba(255,255,255,0.08)',
        }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ color: 'var(--text-hi)', fontWeight: 700 }}>~/.lucidrc</span>
            <span style={{ color: 'var(--cyan)' }}>⎇ -</span>
            <span style={{ color: 'var(--violet)' }}>● CONF</span>
          </div>
          <div style={{ display: 'flex', gap: 10, color: 'var(--text-lo)' }}>
            <span style={{ color: 'var(--mint)' }}>● synced 2m</span>
            <span>j/k · :w</span>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* LEFT — sections nav */}
          <div style={{ width: '22%', minWidth: 110, height: '100%', overflow: 'hidden' }}>
            <Pane title="SECTIONS" badge="10" tone="rose" footer="↑↓ to nav">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1, fontSize: 10 }}>
                {sections.map(s => (
                  <div key={s.k} style={{
                    display: 'flex', alignItems: 'center', gap: 4, padding: '3px 6px',
                    marginLeft: -6, marginRight: -6,
                    background: s.sel ? 'rgba(255,107,157,0.10)' : 'transparent',
                    borderLeft: s.sel ? '2px solid var(--rose)' : '2px solid transparent',
                  }}>
                    <span style={{ color: 'var(--text-lo)', width: 8 }}>{s.sel ? '›' : ' '}</span>
                    <span style={{ color: tones[s.tone], fontWeight: s.sel ? 700 : 400 }}>[{s.k}]</span>
                  </div>
                ))}
              </div>
            </Pane>
          </div>

          {/* MIDDLE — editor */}
          <div style={{ width: '44%', height: '100%', overflow: 'hidden' }}>
            <Pane title="[agent]" badge="claude-sonnet-4.5" tone="cyan" footer="cmd-s save">
              <div style={{ fontSize: 10, lineHeight: 1.6 }}>
                <div style={{ color: 'var(--text-lo)', fontSize: 9 }}>// MODEL</div>
                <div style={{ marginTop: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {[
                    ['claude-haiku-4', false],
                    ['claude-sonnet-4.5', true],
                    ['claude-opus-4.1', false],
                  ].map(([n, sel]) => (
                    <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ color: sel ? 'var(--rose)' : 'var(--text-lo)' }}>{sel ? '◉' : '○'}</span>
                      <span style={{ color: sel ? 'var(--text-hi)' : 'var(--text-mid)', fontWeight: sel ? 600 : 400 }}>{n}</span>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 10, color: 'var(--text-lo)', fontSize: 9 }}>// CONTEXT</div>
                <div style={{ marginTop: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <TermBar value={0.2} max={14} color="var(--cyan)" />
                  <span style={{ color: 'var(--cyan)', fontSize: 9.5 }}>200K</span>
                </div>

                <div style={{ marginTop: 10, color: 'var(--text-lo)', fontSize: 9 }}>// THINKING</div>
                <div style={{ marginTop: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-mid)' }}>budget</span>
                  <Stepper value="think-hard" color="var(--violet)" />
                </div>

                <div style={{ marginTop: 10, color: 'var(--text-lo)', fontSize: 9 }}>// TEMP</div>
                <div style={{ marginTop: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <TermBar value={0.3} max={14} color="var(--rose)" />
                  <span style={{ color: 'var(--rose)', fontSize: 9.5 }}>0.30</span>
                </div>

                <div style={{ marginTop: 10, color: 'var(--text-lo)', fontSize: 9 }}>// SAFETY</div>
                <div style={{ marginTop: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-mid)' }}>auto-approve diffs</span>
                    <Toggle on={false} color="var(--rose)" />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-mid)' }}>verify before ship</span>
                    <Toggle on={true} color="var(--mint)" />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-mid)' }}>allow shell exec</span>
                    <Toggle on={true} color="var(--mint)" />
                  </div>
                </div>
              </div>
            </Pane>
          </div>

          {/* RIGHT — raw .lucidrc preview */}
          <div style={{ width: '34%', height: '100%', overflow: 'hidden' }}>
            <Pane title=".lucidrc" badge="LIVE" tone="mint" footer="● synced">
              <pre style={{
                margin: 0, fontFamily: 'var(--font-mono)', fontSize: 9, lineHeight: 1.55,
                color: 'var(--text-mid)', whiteSpace: 'pre',
              }}>
<span style={{ color: 'var(--text-lo)' }}># lucid · v0.3.1</span>{'\n'}
<span style={{ color: 'var(--rose)' }}>[agent]</span>{'\n'}
model    = <span style={{ color: 'var(--cyan)' }}>"claude-sonnet-4.5"</span>{'\n'}
context  = <span style={{ color: 'var(--mint)' }}>200000</span>{'\n'}
plan     = <span style={{ color: 'var(--violet)' }}>"think-hard"</span>{'\n'}
temp     = <span style={{ color: 'var(--rose)' }}>0.30</span>{'\n'}
verify   = <span style={{ color: 'var(--mint)' }}>true</span>{'\n'}
auto_ok  = <span style={{ color: 'var(--rose)' }}>false</span>{'\n\n'}
<span style={{ color: 'var(--rose)' }}>[providers]</span>{'\n'}
active   = <span style={{ color: 'var(--cyan)' }}>"anthropic"</span>{'\n'}
anthropic.key = <span style={{ color: 'var(--cyan)' }}>"sk-ant-···"</span>{'\n'}
openai.key    = <span style={{ color: 'var(--text-lo)' }}>""</span>{'\n'}
ollama.url    = <span style={{ color: 'var(--cyan)' }}>"localhost:11434"</span>{'\n'}
fallback = <span style={{ color: 'var(--cyan)' }}>"lucid-cloud"</span>{'\n\n'}
<span style={{ color: 'var(--rose)' }}>[voice]</span>{'\n'}
stt      = <span style={{ color: 'var(--cyan)' }}>"whisper-v3"</span>{'\n'}
hotkey   = <span style={{ color: 'var(--cyan)' }}>"hold-mic"</span>{'\n'}
vad      = <span style={{ color: 'var(--mint)' }}>0.4</span>{'\n\n'}
<span style={{ color: 'var(--rose)' }}>[theme]</span>{'\n'}
name     = <span style={{ color: 'var(--cyan)' }}>"lucid-terminal"</span>{'\n'}
accent   = <span style={{ color: 'var(--cyan)' }}>"#FF6B9D"</span>{'\n'}
scanline = <span style={{ color: 'var(--mint)' }}>true</span>
              </pre>
              <div style={{
                marginTop: 10, padding: 4, fontSize: 8.5, textAlign: 'center',
                background: 'rgba(94,255,178,0.10)',
                border: '1px solid rgba(94,255,178,0.3)',
                color: 'var(--mint)', letterSpacing: 0.6,
              }}>● 3 changes · auto-synced</div>
            </Pane>
          </div>
        </div>

        {/* bottom bar */}
        <div style={{
          height: 26, borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center',
          fontFamily: 'var(--font-mono)', fontSize: 10,
          background: 'rgba(0,0,0,0.6)',
        }}>
          <span style={{ padding: '0 8px', height: '100%', display: 'flex', alignItems: 'center', background: '#1a1525', color: 'var(--text-hi)', fontWeight: 700, letterSpacing: 0.6 }}>NORMAL</span>
          <span style={{ padding: '0 10px', color: 'var(--text-mid)', flex: 1 }}>:w settings/agent</span>
          <span style={{ padding: '0 8px', color: 'var(--text-lo)' }}>:q :reset</span>
        </div>
      </div>
    </LandTermPhone>
  );
};

// ============================================================
// D_Settings_Providers — API keys / BYOK
// ============================================================
const D_Settings_Providers = () => {
  const providers = [
    { id: 'anthropic',  status: 'linked', key: 'sk-ant-···k29x',     models: 'claude-haiku-4 · sonnet · opus', tone: 'rose', sel: true,  added: '2d ago' },
    { id: 'openai',     status: 'empty',  key: '',                       models: 'gpt-5 · gpt-5-mini · o5',           tone: 'mint', sel: false },
    { id: 'google',     status: 'empty',  key: '',                       models: 'gemini-2.5 · flash',               tone: 'cyan', sel: false },
    { id: 'openrouter', status: 'empty',  key: '',                       models: 'any model · unified billing',      tone: 'violet', sel: false },
    { id: 'ollama',     status: 'local',  key: 'localhost:11434',        models: 'qwen-32b · llama-4 · deepseek',     tone: 'mint', sel: false, local: true },
    { id: 'lucid cloud',status: 'pro',    key: 'auto · included in pro', models: 'all hosted models',                 tone: 'cyan', sel: false, hosted: true },
  ];
  const tones = { rose: 'var(--rose)', cyan: 'var(--cyan)', violet: 'var(--violet)', mint: 'var(--mint)' };
  const statusColor = (s) => s === 'linked' || s === 'local' || s === 'pro' ? 'var(--mint)' : 'var(--text-lo)';
  const statusLabel = (s) => s === 'linked' ? '● LINKED' : s === 'local' ? '● LOCAL' : s === 'pro' ? '● PRO' : '○ EMPTY';

  return (
    <TermPhone>
      <TermAppBar project="settings" branch="-" state="KEYS" />
      <div style={{
        padding: '10px 14px 90px', fontFamily: 'var(--font-mono)', fontSize: 11,
        lineHeight: 1.55,
      }}>
        {/* breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, marginBottom: 8 }}>
          <span style={{ color: 'var(--text-lo)' }}>settings ›</span>
          <span style={{ color: 'var(--cyan)', fontWeight: 600 }}>[providers]</span>
          <span style={{ marginLeft: 'auto', color: 'var(--text-lo)', fontSize: 9.5 }}>1 linked · 4 empty</span>
        </div>

        {/* CURRENT */}
        <div style={{ color: 'var(--text-lo)', fontSize: 9.5, letterSpacing: 0.6 }}>// CURRENT</div>
        <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {providers.map(p => (
            <div key={p.id} style={{
              padding: '6px 8px',
              border: `1px solid ${p.sel ? tones[p.tone] : 'rgba(255,255,255,0.08)'}`,
              background: p.sel ? 'rgba(255,107,157,0.05)' : 'rgba(0,0,0,0.2)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: p.sel ? tones[p.tone] : 'var(--text-lo)', width: 12 }}>{p.sel ? '◉' : '○'}</span>
                <span style={{ color: p.sel ? 'var(--text-hi)' : 'var(--text-mid)', fontWeight: p.sel ? 600 : 400 }}>{p.id}</span>
                <span style={{ marginLeft: 'auto', fontSize: 9, letterSpacing: 0.5, color: statusColor(p.status), fontWeight: 700 }}>
                  {statusLabel(p.status)}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2, paddingLeft: 18, fontSize: 9.5 }}>
                <span style={{ color: p.key ? 'var(--text-mid)' : 'var(--text-lo)' }}>
                  {p.key || '— no key on device'}
                </span>
                {p.added && <span style={{ marginLeft: 'auto', color: 'var(--text-lo)' }}>{p.added}</span>}
              </div>
              <div style={{ paddingLeft: 18, color: 'var(--text-lo)', fontSize: 9, marginTop: 1 }}>
                {p.models}
              </div>
            </div>
          ))}
        </div>

        {/* ROUTING */}
        <div style={{ marginTop: 12, color: 'var(--text-lo)', fontSize: 9.5, letterSpacing: 0.6 }}>// PER-MODEL ROUTING</div>
        <div style={{ marginTop: 4, padding: 6, border: '1px dashed rgba(255,255,255,0.08)', fontSize: 9.5, lineHeight: 1.55 }}>
          {[
            ['claude-sonnet-4.5', 'anthropic',  true ],
            ['claude-haiku-4',    'anthropic',  true ],
            ['gpt-5',             'openai',     false],
            ['gemini-2.5',        'google',     false],
            ['qwen-32b',          'ollama',     true ],
          ].map(([m, p, ok], i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: 'var(--text-mid)', flex: 1, fontSize: 9.5 }}>{m}</span>
              <span style={{ color: 'var(--text-lo)' }}>→</span>
              <span style={{ color: ok ? 'var(--text-hi)' : 'var(--text-lo)' }}>{p}</span>
              <span style={{ color: ok ? 'var(--mint)' : 'var(--rose)', fontSize: 9, fontWeight: 700 }}>{ok ? '✓' : '!key'}</span>
            </div>
          ))}
        </div>

        {/* SAFETY */}
        <div style={{ marginTop: 12, color: 'var(--text-lo)', fontSize: 9.5, letterSpacing: 0.6 }}>// SAFETY</div>
        <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[
            { l: 'keys stored on device only', v: true,  tone: 'mint' },
            { l: 'sync via lucid cloud',       v: false, tone: 'rose' },
            { l: 'redact in logs',             v: true,  tone: 'mint' },
            { l: 'fallback to lucid cloud',    v: true,  tone: 'mint' },
          ].map(s => (
            <div key={s.l} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10 }}>
              <span style={{ color: 'var(--text-mid)' }}>{s.l}</span>
              <Toggle on={s.v} color={s.tone === 'rose' ? 'var(--rose)' : 'var(--mint)'} />
            </div>
          ))}
        </div>

        {/* ADD KEY */}
        <div style={{ marginTop: 12, color: 'var(--text-lo)', fontSize: 9.5, letterSpacing: 0.6 }}>// ADD KEY</div>
        <div style={{ marginTop: 4, padding: 8, border: '1px dashed rgba(107,229,255,0.4)', background: 'rgba(107,229,255,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ color: 'var(--text-lo)', fontSize: 9 }}>provider</span>
            <Stepper value="openai" color="var(--cyan)" />
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4, padding: '5px 6px',
            background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)',
            fontFamily: 'var(--font-mono)', fontSize: 10.5,
          }}>
            <span style={{ color: 'var(--text-lo)' }}>sk-</span>
            <span style={{ color: 'var(--text-hi)', letterSpacing: 1.5 }}>••••••••••••••••</span>
            <span style={{
              display: 'inline-block', width: 6, height: 11, background: 'var(--text-hi)',
              animation: 'breathe 1s steps(2) infinite', verticalAlign: 'middle',
            }} />
          </div>
          <div style={{ marginTop: 6, display: 'flex', gap: 4 }}>
            <span style={{ padding: '2px 8px', border: '1px solid var(--cyan)', color: 'var(--cyan)', fontSize: 9.5, letterSpacing: 0.5 }}>[⌘V] PASTE</span>
            <span style={{ padding: '2px 8px', border: '1px solid var(--mint)', color: 'var(--mint)', fontSize: 9.5, letterSpacing: 0.5 }}>[T] TEST</span>
            <span style={{ padding: '2px 8px', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--text-mid)', fontSize: 9.5, letterSpacing: 0.5 }}>[↵] SAVE</span>
          </div>
          <div style={{ marginTop: 6, fontSize: 9, color: 'var(--text-lo)', lineHeight: 1.5 }}>
            → stored in keychain · encrypted with device key<br/>
            → never sent to lucid servers
          </div>
        </div>
      </div>
      <VimBar mode="INSERT" cmd=":w providers" />
    </TermPhone>
  );
};

Object.assign(window, { D_Settings_Hub, D_Settings_Model, D_Settings_Land, D_Settings_Providers, TermBar, Toggle, Stepper });
