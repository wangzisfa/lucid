/* variation-d-auth.jsx — D Auth screens (terminal-style)
   7 screens covering Google + GitHub + Apple + guest auth, OAuth bridge,
   success/error, profile, sign-out, and reauth.

   Reuses TermPhone, TermAppBar, VimBar, BlockWave from variation-d.jsx.
   Aesthetic: command-driven, mono everywhere, "[g] sign in with google".
*/

// ─── tiny helpers ────────────────────────────────────────────
const AuthLine = ({ k, label, mid, hi, tone = 'mid' }) => (
  <div style={{
    display: 'flex', alignItems: 'baseline', gap: 8, padding: '4px 0',
    whiteSpace: 'nowrap',
  }}>
    <span style={{
      fontFamily: 'var(--font-mono)', color: 'var(--text-lo)', width: 22,
      letterSpacing: 0.5, flexShrink: 0,
    }}>
      <span style={{ color: 'var(--rose)' }}>[</span>
      <span style={{
        color: tone === 'rose' ? 'var(--rose)' :
               tone === 'cyan' ? 'var(--cyan)' :
               tone === 'mint' ? 'var(--mint)' :
               tone === 'lo'   ? 'var(--text-lo)' : 'var(--text-hi)',
        fontWeight: 700,
      }}>{k}</span>
      <span style={{ color: 'var(--rose)' }}>]</span>
    </span>
    <span style={{
      color: 'var(--text-hi)', fontWeight: 600, flex: 1, minWidth: 0,
      overflow: 'hidden', textOverflow: 'ellipsis',
    }}>{label}</span>
    {hi && <span style={{ color: 'var(--cyan)', fontSize: 10, flexShrink: 0 }}>{hi}</span>}
    {mid && <span style={{ color: 'var(--text-lo)', fontSize: 10, flexShrink: 0 }}>· {mid}</span>}
  </div>
);

const Glyph = ({ name }) => {
  // Tiny 9px mono-glyph identity marks rendered in ASCII. No real logos.
  const map = {
    google:  'G',
    github:  'H',
    apple:   '',
    guest:   '·',
  };
  return <span style={{
    fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 11,
    width: 13, height: 13, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    border: '1px solid currentColor', letterSpacing: 0, lineHeight: 1,
  }}>{map[name]}</span>;
};

// ============================================================
// D_Auth_Login — main login screen
// "$ lucid auth --provider <p>" command-driven picker
// ============================================================
const D_Auth_Login = () => (
  <TermPhone>
    <div style={{
      height: 'calc(100% - 30px)', padding: '20px 18px 50px',
      fontFamily: 'var(--font-mono)', fontSize: 11.5,
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      {/* top brand strip */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            width: 7, height: 7, background: 'var(--rose)',
            boxShadow: '0 0 8px var(--rose)', animation: 'breathe 1.4s infinite',
          }} />
          <span style={{ color: 'var(--text-hi)', fontWeight: 600 }}>LUCID</span>
          <span style={{ color: 'var(--text-lo)' }}>· auth</span>
        </div>
        <span style={{ color: 'var(--text-lo)', fontSize: 9.5 }}>unauthenticated</span>
      </div>

      {/* invocation */}
      <div style={{ marginTop: 2 }}>
        <div style={{ color: 'var(--text-mid)' }}>
          <span style={{ color: 'var(--rose)' }}>$ </span>
          <span style={{ color: 'var(--text-hi)' }}>lucid auth</span>
          <span style={{ color: 'var(--cyan)' }}> --provider</span>
          <span style={{ color: 'var(--text-lo)' }}> &lt;p&gt;</span>
        </div>
        <div style={{ color: 'var(--text-lo)', fontSize: 9.5, marginTop: 2 }}>
          // pick a sign-in method · we'll open a secure browser tab
        </div>
      </div>

      {/* providers */}
      <div style={{ marginTop: 4 }}>
        <div style={{ color: 'var(--text-lo)', fontSize: 9.5, paddingBottom: 4, borderBottom: '1px dashed rgba(255,255,255,0.08)', marginBottom: 6 }}>
          PROVIDERS · 4 available
        </div>

        {/* google — recommended */}
        <div style={{
          padding: '7px 8px', marginLeft: -8, marginRight: -8,
          background: 'linear-gradient(90deg, rgba(255,107,157,0.08), transparent 70%)',
          borderLeft: '2px solid var(--rose)',
          display: 'flex', flexDirection: 'column', gap: 2,
        }}>
          <AuthLine k="g" label="sign in with google" tone="rose" hi="pkce" />
          <div style={{ color: 'var(--text-lo)', fontSize: 9.5, paddingLeft: 30 }}>
            identity only · email + avatar · no drive/calendar
          </div>
        </div>

        <AuthLine k="h" label="sign in with github" tone="cyan" hi="+ repo scope" />
        <div style={{ color: 'var(--text-lo)', fontSize: 9.5, paddingLeft: 30, marginTop: -2, marginBottom: 2 }}>
          best for devs · clone + push to your repos
        </div>

        <AuthLine k="a" label="sign in with apple" tone="mint" hi="ios native" />
        <AuthLine k="·" label="continue as guest" tone="lo" hi="30 min" />
      </div>

      {/* prompt */}
      <div style={{
        marginTop: 'auto',
        padding: '8px 10px',
        border: '1px dashed rgba(255,107,157,0.3)',
        background: 'rgba(255,107,157,0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: 'var(--rose)' }}>›</span>
          <span style={{ color: 'var(--text-mid)' }}>press </span>
          <span style={{ color: 'var(--text-hi)', fontWeight: 700 }}>g</span>
          <span style={{
            display: 'inline-block', width: 7, height: 12, background: 'var(--text-hi)',
            animation: 'breathe 1s steps(2) infinite',
          }} />
        </div>
        <div style={{ color: 'var(--text-lo)', fontSize: 9.5, marginTop: 4 }}>
          tokens stored in secure-enclave · refresh handled silently
        </div>
      </div>

      {/* legal */}
      <div style={{ color: 'var(--text-lo)', fontSize: 9, lineHeight: 1.5, letterSpacing: 0.2 }}>
        // by continuing you accept ~/.lucid/terms · ~/.lucid/privacy
      </div>
    </div>
    <VimBar mode="NORMAL" cmd=":auth google" />
  </TermPhone>
);

// ============================================================
// D_Auth_Bridge — OAuth handoff (browser tab opened)
// ============================================================
const D_Auth_Bridge = () => (
  <TermPhone>
    <div style={{
      height: 'calc(100% - 30px)', padding: '20px 18px 50px',
      fontFamily: 'var(--font-mono)', fontSize: 11.5,
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            width: 7, height: 7, background: 'var(--amber)',
            boxShadow: '0 0 8px var(--amber)', animation: 'breathe 0.9s infinite',
          }} />
          <span style={{ color: 'var(--text-hi)', fontWeight: 600 }}>LUCID</span>
          <span style={{ color: 'var(--text-lo)' }}>· auth · bridge</span>
        </div>
        <span style={{ color: 'var(--amber)', fontSize: 9.5 }}>WAITING</span>
      </div>

      {/* log */}
      <div style={{ marginTop: 4 }}>
        {[
          { c: 'mint', t: '✓ pkce verifier generated · sha256' },
          { c: 'mint', t: '✓ state nonce signed · 32b' },
          { c: 'mint', t: '✓ deep-link registered · lucid://auth/cb' },
          { c: 'mint', t: '✓ opened accounts.google.com/o/oauth2/...' },
          { c: 'amber', t: '◐ waiting for consent · t=12s' },
        ].map((l, i) => (
          <div key={i} style={{
            color: l.c === 'mint' ? 'var(--mint)' :
                   l.c === 'amber' ? 'var(--amber)' : 'var(--text-mid)',
            opacity: 0, animation: `term-fade-bridge 0.4s ease-in ${i * 0.18}s forwards`,
          }}>{l.t}</div>
        ))}
        <style>{`@keyframes term-fade-bridge { to { opacity: 1 } }`}</style>
      </div>

      {/* spinner block */}
      <div style={{
        marginTop: 8, padding: '12px 14px',
        border: '1px dashed rgba(255,197,107,0.4)',
        background: 'rgba(255,197,107,0.04)',
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        <div style={{ color: 'var(--amber)', fontSize: 9.5, letterSpacing: 1.2 }}>// HANDOFF</div>
        <div style={{ color: 'var(--text-hi)', fontSize: 13 }}>
          finish sign-in in the browser
        </div>
        <div style={{ color: 'var(--text-mid)', fontSize: 10.5, lineHeight: 1.5 }}>
          we opened a safari tab for google.com.<br/>
          confirm there, then it'll bounce back to lucid.
        </div>

        {/* ascii spinner */}
        <div style={{ marginTop: 4, fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--amber)', letterSpacing: 6 }}>
          <span style={{ animation: 'spin 1.4s linear infinite', display: 'inline-block' }}>◐</span>
          <span style={{ color: 'var(--text-lo)', fontSize: 10, letterSpacing: 1, marginLeft: 8 }}>
            polling /token · 0.5s
          </span>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>

      {/* actions */}
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <AuthLine k="↻" label="resend link" tone="cyan" />
        <AuthLine k="x" label="cancel · use another provider" tone="rose" />
      </div>

      <div style={{ color: 'var(--text-lo)', fontSize: 9, lineHeight: 1.5 }}>
        // request_id · req_01HXG7K2Z9TPVQ4M
      </div>
    </div>
    <VimBar mode="VOICE" cmd="waiting on google.com..." cursor={false} />
  </TermPhone>
);

// ============================================================
// D_Auth_Success — flash before redirect to repos
// ============================================================
const D_Auth_Success = () => (
  <TermPhone>
    <div style={{
      height: 'calc(100% - 30px)', padding: '20px 18px 50px',
      fontFamily: 'var(--font-mono)', fontSize: 11.5,
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            width: 7, height: 7, background: 'var(--mint)',
            boxShadow: '0 0 10px var(--mint)',
          }} />
          <span style={{ color: 'var(--text-hi)', fontWeight: 600 }}>LUCID</span>
          <span style={{ color: 'var(--text-lo)' }}>· authenticated</span>
        </div>
        <span style={{ color: 'var(--mint)', fontSize: 9.5 }}>OK · 200</span>
      </div>

      <div style={{ marginTop: 4 }}>
        {[
          '✓ callback received · code=4/0AeaY...',
          '✓ token exchange · 142ms',
          '✓ identity verified · iris@hey.com',
          '✓ refresh token stored · SecureStore',
          '✓ session opened · sid_01HXG8KP',
          '→ jumping to ~/repos in 0.4s',
        ].map((l, i) => (
          <div key={i} style={{
            color: l.startsWith('→') ? 'var(--rose)' : 'var(--mint)',
            opacity: 0, animation: `term-fade-ok 0.3s ease-in ${i * 0.1}s forwards`,
          }}>{l}</div>
        ))}
        <style>{`@keyframes term-fade-ok { to { opacity: 1 } }`}</style>
      </div>

      {/* user card */}
      <div style={{
        marginTop: 8, padding: 14,
        border: '1px solid rgba(94,255,178,0.3)',
        background: 'rgba(94,255,178,0.04)',
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        <div style={{ color: 'var(--mint)', fontSize: 9.5, letterSpacing: 1.2 }}>// IDENTITY</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* ascii avatar */}
          <div style={{
            width: 44, height: 44, border: '1px solid var(--mint)',
            color: 'var(--mint)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700,
          }}>IR</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <span style={{ color: 'var(--text-hi)', fontSize: 13, fontWeight: 600 }}>Iris Chen</span>
            <span style={{ color: 'var(--text-mid)', fontSize: 10 }}>iris@hey.com</span>
            <span style={{ color: 'var(--text-lo)', fontSize: 9.5 }}>via google · oauth pkce</span>
          </div>
        </div>
      </div>

      <div style={{
        marginTop: 'auto', padding: 10,
        border: '1px dashed rgba(255,107,157,0.3)',
        background: 'rgba(255,107,157,0.04)',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <span style={{ color: 'var(--rose)' }}>›</span>
        <span style={{ color: 'var(--text-mid)' }}>opening</span>
        <span style={{ color: 'var(--cyan)' }}>~/repos</span>
        <span style={{
          display: 'inline-block', width: 7, height: 12, background: 'var(--text-hi)',
          animation: 'breathe 0.6s steps(2) infinite', marginLeft: 4,
        }} />
      </div>

      <div style={{ color: 'var(--text-lo)', fontSize: 9, letterSpacing: 0.3 }}>
        // session ends in 30d · refresh handled silently
      </div>
    </div>
    <VimBar mode="NORMAL" cmd=":cd ~/repos" cursor={false} />
  </TermPhone>
);

// ============================================================
// D_Auth_Error — failed sign-in / network error
// ============================================================
const D_Auth_Error = () => (
  <TermPhone>
    <div style={{
      height: 'calc(100% - 30px)', padding: '20px 18px 50px',
      fontFamily: 'var(--font-mono)', fontSize: 11.5,
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            width: 7, height: 7, background: 'var(--rose)',
            boxShadow: '0 0 10px var(--rose)',
          }} />
          <span style={{ color: 'var(--text-hi)', fontWeight: 600 }}>LUCID</span>
          <span style={{ color: 'var(--text-lo)' }}>· auth · failed</span>
        </div>
        <span style={{ color: 'var(--rose)', fontSize: 9.5 }}>ERR · 401</span>
      </div>

      {/* log */}
      <div style={{ marginTop: 4 }}>
        {[
          { c: 'mint', t: '✓ pkce verifier · sha256' },
          { c: 'mint', t: '✓ deep-link callback · 142ms' },
          { c: 'mint', t: '✓ code received · 4/0AeaY...' },
          { c: 'rose', t: '✗ POST /token failed · 401 invalid_grant' },
          { c: 'rose', t: '✗ session not opened' },
        ].map((l, i) => (
          <div key={i} style={{
            color: l.c === 'mint' ? 'var(--mint)' :
                   l.c === 'rose' ? 'var(--rose)' : 'var(--text-mid)',
          }}>{l.t}</div>
        ))}
      </div>

      {/* error card */}
      <div style={{
        marginTop: 8, padding: 12,
        border: '1px solid rgba(255,107,157,0.4)',
        background: 'rgba(255,107,157,0.06)',
        display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--rose)', fontSize: 9.5, letterSpacing: 1.2 }}>// FAULT</span>
          <span style={{ color: 'var(--text-lo)', fontSize: 9 }}>req_01HXG7K2</span>
        </div>
        <div style={{ color: 'var(--text-hi)', fontSize: 13, lineHeight: 1.3 }}>
          Google handoff timed out
        </div>
        <div style={{ color: 'var(--text-mid)', fontSize: 10.5, lineHeight: 1.5 }}>
          authorization code expired before we could exchange it.<br/>
          this usually means a slow network or you closed the tab.
        </div>
        <div style={{ marginTop: 4, color: 'var(--text-lo)', fontSize: 9.5 }}>
          stack:
        </div>
        <div style={{ color: 'var(--text-mid)', fontSize: 10, paddingLeft: 4 }}>
          <div>├─ AuthBridge.exchange()</div>
          <div>├─ <span style={{ color: 'var(--rose)' }}>oauth.token() ← 401</span></div>
          <div>└─ network.fetch · timed out @ 30s</div>
        </div>
      </div>

      {/* actions */}
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <AuthLine k="r" label="retry · same provider" tone="rose" />
        <AuthLine k="g" label="try google again from scratch" tone="cyan" />
        <AuthLine k="b" label="back · choose another method" tone="lo" />
        <AuthLine k="?" label="copy diagnostics to clipboard" tone="lo" />
      </div>

      <div style={{ color: 'var(--text-lo)', fontSize: 9, letterSpacing: 0.3 }}>
        // status.lucid.app · all systems nominal
      </div>
    </div>
    <VimBar mode="NORMAL" cmd=":retry" />
  </TermPhone>
);

// ============================================================
// D_Settings_Account — profile screen in Settings
// ============================================================
const D_Settings_Account = () => (
  <TermPhone>
    <TermAppBar project="settings/account" branch="-" state="CONF" />
    <div style={{
      padding: '10px 14px 90px', fontFamily: 'var(--font-mono)', fontSize: 11.5,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ color: 'var(--text-hi)', fontWeight: 600 }}>:Account</span>
        <span style={{ color: 'var(--text-lo)', fontSize: 9.5 }}>j/k · esc back</span>
      </div>
      <div style={{ color: 'var(--text-lo)', fontSize: 9.5, marginBottom: 12 }}>
        // ~/.lucidrc · identity + linked providers
      </div>

      {/* identity card */}
      <div style={{
        padding: 12, marginBottom: 12,
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(0,0,0,0.25)',
        display: 'flex', gap: 12, alignItems: 'center',
      }}>
        <div style={{
          width: 48, height: 48, border: '1px solid var(--rose)',
          background: 'linear-gradient(135deg, rgba(255,107,157,0.18), rgba(139,111,255,0.12))',
          color: 'var(--rose)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700,
          boxShadow: '0 0 0 1px rgba(255,107,157,0.15)',
        }}>IR</div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <span style={{ color: 'var(--text-hi)', fontSize: 13, fontWeight: 600 }}>Iris Chen</span>
          <span style={{ color: 'var(--text-mid)', fontSize: 10 }}>iris@hey.com</span>
          <span style={{ color: 'var(--text-lo)', fontSize: 9.5 }}>
            <span style={{ color: 'var(--mint)' }}>● pro</span> · 142h used · since may '25
          </span>
        </div>
      </div>

      {/* linked providers */}
      <div style={{
        color: 'var(--text-lo)', fontSize: 9.5, paddingBottom: 4,
        borderBottom: '1px dashed rgba(255,255,255,0.08)', marginBottom: 6,
      }}>
        LINKED PROVIDERS · 2 of 4
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {[
          { k: 'g', name: 'google',  status: 'primary',   meta: 'iris@hey.com · 32d',  tone: 'rose' },
          { k: 'h', name: 'github',  status: 'linked',    meta: '@irisc · repos: 14',   tone: 'cyan' },
          { k: 'a', name: 'apple',   status: 'unlinked',  meta: 'link to enable ios passkey', tone: 'lo' },
          { k: '·', name: 'email',   status: 'unlinked',  meta: 'magic-link fallback',  tone: 'lo' },
        ].map((p, i) => (
          <div key={p.name} style={{
            display: 'grid', gridTemplateColumns: '22px 80px 1fr auto',
            gap: 8, alignItems: 'center', padding: '7px 0',
            borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none',
          }}>
            <span style={{ color: 'var(--text-lo)' }}>
              <span style={{ color: 'var(--rose)' }}>[</span>
              <span style={{ color: 'var(--text-hi)', fontWeight: 700 }}>{p.k}</span>
              <span style={{ color: 'var(--rose)' }}>]</span>
            </span>
            <span style={{
              color: p.tone === 'rose' ? 'var(--rose)' :
                     p.tone === 'cyan' ? 'var(--cyan)' :
                     p.tone === 'mint' ? 'var(--mint)' : 'var(--text-lo)',
              fontWeight: 600,
            }}>[{p.name}]</span>
            <span style={{ color: p.tone === 'lo' ? 'var(--text-lo)' : 'var(--text-mid)', fontSize: 10 }}>
              {p.meta}
            </span>
            <span style={{
              fontSize: 9, letterSpacing: 0.5, padding: '2px 5px',
              color: p.status === 'unlinked' ? 'var(--text-lo)' :
                     p.status === 'primary' ? '#000' : 'var(--cyan)',
              background: p.status === 'primary' ? 'var(--rose)' : 'transparent',
              border: `1px solid ${
                p.status === 'unlinked' ? 'rgba(255,255,255,0.12)' :
                p.status === 'primary' ? 'var(--rose)' : 'rgba(107,229,255,0.5)'
              }`,
              fontWeight: 700, textTransform: 'uppercase',
            }}>{p.status === 'primary' ? 'PRIMARY' : p.status === 'linked' ? 'LINKED' : 'LINK'}</span>
          </div>
        ))}
      </div>

      {/* session info */}
      <div style={{
        marginTop: 14, padding: 10,
        border: '1px dashed rgba(255,255,255,0.08)',
        color: 'var(--text-mid)', fontSize: 10, lineHeight: 1.7,
      }}>
        <div><span style={{ color: 'var(--text-lo)' }}>session</span> · sid_01HXG8KPQ </div>
        <div><span style={{ color: 'var(--text-lo)' }}>opened </span> · 12 may · iphone 15 pro</div>
        <div><span style={{ color: 'var(--text-lo)' }}>expires</span> · in 28d · auto-refresh</div>
        <div><span style={{ color: 'var(--text-lo)' }}>devices</span> · 2 active <span style={{ color: 'var(--cyan)' }}>(view all)</span></div>
      </div>

      {/* danger row */}
      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <AuthLine k="x" label="sign out · this device" tone="rose" />
        <AuthLine k="X" label="sign out · all devices" tone="rose" />
        <AuthLine k="!" label="delete account · 14d cool-down" tone="rose" mid="permanent" />
      </div>
    </div>
    <VimBar mode="NORMAL" cmd=":w" cursor={false} />
  </TermPhone>
);

// ============================================================
// D_Auth_Signout — confirm modal-style
// ============================================================
const D_Auth_Signout = () => (
  <TermPhone>
    <TermAppBar project="settings/account" branch="-" state="CONF" />
    <div style={{
      padding: '10px 14px 90px', fontFamily: 'var(--font-mono)', fontSize: 11.5,
      position: 'relative',
    }}>
      {/* dimmed background context */}
      <div style={{ opacity: 0.25, pointerEvents: 'none' }}>
        <div style={{ color: 'var(--text-hi)', fontWeight: 600, marginBottom: 4 }}>:Account</div>
        <div style={{ color: 'var(--text-lo)', fontSize: 9.5, marginBottom: 12 }}>// ~/.lucidrc</div>
        <div style={{
          padding: 12, marginBottom: 12,
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', gap: 12, alignItems: 'center',
        }}>
          <div style={{
            width: 48, height: 48, border: '1px solid var(--rose)',
            color: 'var(--rose)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700,
          }}>IR</div>
          <div>
            <div style={{ color: 'var(--text-hi)', fontSize: 13 }}>Iris Chen</div>
            <div style={{ color: 'var(--text-mid)', fontSize: 10 }}>iris@hey.com</div>
          </div>
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ height: 26, marginBottom: 4, background: 'rgba(255,255,255,0.04)' }} />
        ))}
      </div>

      {/* modal */}
      <div style={{
        position: 'absolute', top: 80, left: 14, right: 14,
        border: '1px solid var(--rose)',
        background: 'linear-gradient(180deg, #1a0e15 0%, #0e070b 100%)',
        boxShadow: '0 20px 50px -10px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,107,157,0.15)',
      }}>
        <div style={{
          padding: '6px 10px', background: 'var(--rose)', color: '#000',
          fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 700,
          letterSpacing: 1.2, display: 'flex', justifyContent: 'space-between',
        }}>
          <span>:CONFIRM</span>
          <span>sign-out · esc to cancel</span>
        </div>
        <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontStyle: 'italic',
            fontSize: 22, color: 'var(--text-hi)', lineHeight: 1.1,
          }}>
            Sign out of <span style={{ color: 'var(--rose)' }}>lucid</span>?
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--text-mid)',
            lineHeight: 1.55,
          }}>
            this device only · 2 active sessions remain.<br/>
            running agents will be paused · drafts kept.
          </div>

          <div style={{
            marginTop: 4, padding: 8,
            background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.06)',
            color: 'var(--text-lo)', fontSize: 10, lineHeight: 1.6,
          }}>
            <div>$ lucid auth signout --device this</div>
            <div style={{ color: 'var(--text-mid)' }}>↳ revoke refresh-token · drop secure-enclave key</div>
            <div style={{ color: 'var(--text-mid)' }}>↳ purge cache · 14.2mb</div>
          </div>

          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
            <button style={{
              flex: 1, padding: '8px 10px', fontFamily: 'var(--font-mono)', fontSize: 11,
              background: 'transparent', color: 'var(--text-mid)',
              border: '1px solid rgba(255,255,255,0.15)', fontWeight: 600, letterSpacing: 0.5,
            }}>[esc] cancel</button>
            <button style={{
              flex: 1, padding: '8px 10px', fontFamily: 'var(--font-mono)', fontSize: 11,
              background: 'var(--rose)', color: '#000',
              border: '1px solid var(--rose)', fontWeight: 700, letterSpacing: 0.5,
            }}>[↵] sign out</button>
          </div>
        </div>
      </div>
    </div>
    <VimBar mode="VOICE" cmd=":q! signout" cursor={false} />
  </TermPhone>
);

// ============================================================
// D_Auth_Reauth — token expired prompt (banner takeover)
// ============================================================
const D_Auth_Reauth = () => (
  <TermPhone>
    <TermAppBar project="idea-garden" branch="main" state="IDLE" />
    <div style={{
      padding: '10px 14px 90px', fontFamily: 'var(--font-mono)', fontSize: 11,
      position: 'relative',
    }}>
      {/* dimmed underlying session */}
      <div style={{ opacity: 0.18, pointerEvents: 'none' }}>
        <div style={{ color: 'var(--cyan)' }}>› add reflection card at 9pm w/ soft chime</div>
        <div style={{ color: 'var(--text-lo)', fontSize: 9.5 }}>voice · 0:12</div>
        <div style={{ color: 'var(--rose)', marginTop: 6 }}>● lucid · thought 4s</div>
        <div style={{ color: 'var(--text-mid)' }}>├─ ✓ create ReflectionCard.tsx</div>
        <div style={{ color: 'var(--text-mid)' }}>├─ ✓ wire chime hook</div>
        <div style={{ color: 'var(--text-mid)' }}>├─ ◐ schedule cron 21:00</div>
        <div style={{ color: 'var(--text-mid)' }}>└─ ○ mount on home</div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ height: 16, marginTop: 4, background: 'rgba(255,255,255,0.03)' }} />
        ))}
      </div>

      {/* banner */}
      <div style={{
        position: 'absolute', top: 12, left: 14, right: 14,
        border: '1px solid var(--amber)',
        background: 'linear-gradient(180deg, #1a1408 0%, #0d0a05 100%)',
        boxShadow: '0 20px 50px -10px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,197,107,0.15)',
      }}>
        <div style={{
          padding: '5px 10px', background: 'var(--amber)', color: '#000',
          fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 700,
          letterSpacing: 1.2, display: 'flex', justifyContent: 'space-between',
        }}>
          <span>! REAUTH REQUIRED</span>
          <span>401 · token expired</span>
        </div>
        <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontStyle: 'italic',
            fontSize: 19, color: 'var(--text-hi)', lineHeight: 1.15,
          }}>
            Your google session lapsed
          </div>
          <div style={{ color: 'var(--text-mid)', fontSize: 10.5, lineHeight: 1.55 }}>
            refresh-token rejected · grant was revoked or your password changed.
            sign in once more to keep this conversation going.
          </div>

          <div style={{
            padding: 8, background: 'rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.06)',
            color: 'var(--text-lo)', fontSize: 10, lineHeight: 1.6,
          }}>
            <div>$ lucid auth refresh --provider google</div>
            <div style={{ color: 'var(--rose)' }}>↳ refresh-token denied · invalid_grant</div>
            <div style={{ color: 'var(--text-mid)' }}>↳ session paused · 1 agent on hold</div>
          </div>

          {/* status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 10 }}>
            <div style={{ color: 'var(--text-mid)' }}>session</div>
            <div style={{ color: 'var(--amber)', textAlign: 'right' }}>PAUSED</div>
            <div style={{ color: 'var(--text-mid)' }}>drafts kept</div>
            <div style={{ color: 'var(--mint)', textAlign: 'right' }}>YES · 14m ago</div>
            <div style={{ color: 'var(--text-mid)' }}>token expired</div>
            <div style={{ color: 'var(--text-lo)', textAlign: 'right' }}>2m ago</div>
          </div>

          <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
            <button style={{
              flex: 1, padding: '8px 10px', fontFamily: 'var(--font-mono)', fontSize: 10.5,
              background: 'transparent', color: 'var(--text-mid)',
              border: '1px solid rgba(255,255,255,0.15)', fontWeight: 600, letterSpacing: 0.5,
            }}>[s] sign out</button>
            <button style={{
              flex: 2, padding: '8px 10px', fontFamily: 'var(--font-mono)', fontSize: 10.5,
              background: 'var(--amber)', color: '#000',
              border: '1px solid var(--amber)', fontWeight: 700, letterSpacing: 0.5,
            }}>[g] re-auth with google</button>
          </div>
        </div>
      </div>
    </div>
    <VimBar mode="VOICE" cmd=":reauth google" cursor={false} />
  </TermPhone>
);

// expose to global so the capture harness can resolve them
Object.assign(window, {
  D_Auth_Login,
  D_Auth_Bridge,
  D_Auth_Success,
  D_Auth_Error,
  D_Settings_Account,
  D_Auth_Signout,
  D_Auth_Reauth,
});
