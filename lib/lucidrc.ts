import {
  CONTEXT_OPTIONS,
  ContextWindow,
  ModelId,
  ProviderId,
  SettingsShape,
  Thinking,
  THINKING_OPTIONS,
  defaults,
} from './settings-store';

/**
 * Tiny TOML serializer / parser tailored to the SettingsShape.
 *
 * We don't use a real TOML lib — the schema is flat (`[section]` + `key = value`)
 * and supports only strings, numbers, booleans. Comments (`# …`) are preserved
 * on emit but ignored on parse.
 */

const MODELS: ModelId[] = [
  'claude-haiku-4',
  'claude-sonnet-4.5',
  'claude-opus-4.1',
  'gpt-5',
  'gemini-2.5',
  'qwen-32b',
];

const PROVIDERS: ProviderId[] = [
  'anthropic',
  'openai',
  'google',
  'openrouter',
  'ollama',
  'lucid-cloud',
];

function q(s: string): string {
  return `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function multilineString(s: string): string {
  // TOML multi-line basic string. Open then close on their own lines so
  // the value reads naturally in the editor.
  return `"""\n${s.replace(/"""/g, '\\"\\"\\"')}\n"""`;
}

export function settingsToToml(s: SettingsShape): string {
  const lines: string[] = [];
  lines.push('# lucid · v0.3.1');
  lines.push('');

  lines.push('[agent]');
  lines.push(`model    = ${q(s.agent.model)}`);
  lines.push(`context  = ${s.agent.contextWindow}`);
  lines.push(`plan     = ${q(s.agent.thinking)}`);
  lines.push(`temp     = ${s.agent.temperature.toFixed(2)}`);
  lines.push(`verify   = ${s.agent.verifyBeforeShip}`);
  lines.push(`auto_ok  = ${s.agent.autoApprove}`);
  lines.push(`shell    = ${s.agent.allowShellExec}`);
  lines.push(`prompt   = ${multilineString(s.agent.systemPrompt)}`);
  lines.push('');

  lines.push('[providers]');
  lines.push(`active   = ${q(s.providers.active)}`);
  lines.push(`anthropic.key = ${q(s.providers.anthropicKey)}`);
  lines.push(`openai.key    = ${q(s.providers.openaiKey)}`);
  lines.push(`google.key    = ${q(s.providers.googleKey)}`);
  lines.push(`ollama.url    = ${q(s.providers.ollamaUrl)}`);
  lines.push(`server.url    = ${q(s.providers.serverUrl)}`);
  lines.push(`fallback = ${q(s.providers.fallback)}`);
  lines.push(`on_device_only = ${s.providers.onDeviceOnly}`);
  lines.push('');

  lines.push('[voice]');
  lines.push(`stt      = ${q(s.voice.stt)}`);
  lines.push(`hotkey   = ${q(s.voice.hotkey)}`);
  lines.push(`vad      = ${s.voice.vad}`);
  lines.push('');

  lines.push('[ui]');
  lines.push(`theme    = ${q(s.ui.theme)}`);
  lines.push(`density  = ${q(s.ui.density)}`);
  lines.push(`scanline = ${s.ui.scanlines}`);
  lines.push(`accent   = ${q(s.ui.auroraAccent)}`);

  return lines.join('\n');
}

// ─── parser ─────────────────────────────────────────────

export interface ParseError {
  line: number;
  message: string;
}

export interface ParseResult {
  ok: boolean;
  value?: SettingsShape;
  error?: ParseError;
}

function parseValue(raw: string): string | number | boolean | null {
  const v = raw.trim();
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (v.startsWith('"') && v.endsWith('"') && v.length >= 2) {
    return v
      .slice(1, -1)
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\');
  }
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  return null;
}

export function tomlToSettings(src: string): ParseResult {
  const lines = src.split(/\r?\n/);
  let section = '';
  // build atop defaults so partial files still parse
  const draft: SettingsShape = JSON.parse(JSON.stringify(defaults));

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // multi-line string opener: key = """
    const triple = line.match(/^([\w.]+)\s*=\s*"""\s*$/);
    if (triple) {
      const key = triple[1];
      const collected: string[] = [];
      let closed = false;
      i++;
      for (; i < lines.length; i++) {
        if (lines[i].trim() === '"""') {
          closed = true;
          break;
        }
        collected.push(lines[i]);
      }
      if (!closed) {
        return {
          ok: false,
          error: { line: i + 1, message: `unterminated multi-line string for ${key}` },
        };
      }
      const value = collected.join('\n');
      const r = assign(draft, section, key, value, i + 1);
      if (r) return { ok: false, error: r };
      continue;
    }

    // strip trailing comment, but not inside strings — schema is simple, so
    // approximate: only trim if the # is outside of a quoted string
    const hashIdx = stripCommentIndex(line);
    if (hashIdx >= 0) line = line.slice(0, hashIdx);
    line = line.trim();
    if (!line) continue;

    const header = line.match(/^\[([\w.-]+)\]$/);
    if (header) {
      section = header[1];
      continue;
    }

    const kv = line.match(/^([\w.]+)\s*=\s*(.+)$/);
    if (!kv) {
      return { ok: false, error: { line: i + 1, message: `cannot parse "${line}"` } };
    }
    const key = kv[1];
    const value = parseValue(kv[2]);
    if (value === null) {
      return { ok: false, error: { line: i + 1, message: `bad value for ${key}` } };
    }
    const err = assign(draft, section, key, value, i + 1);
    if (err) return { ok: false, error: err };
  }

  return { ok: true, value: draft };
}

function stripCommentIndex(line: string): number {
  let inString = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"' && line[i - 1] !== '\\') inString = !inString;
    if (!inString && c === '#') return i;
  }
  return -1;
}

function assign(
  out: SettingsShape,
  section: string,
  key: string,
  value: string | number | boolean,
  lineNo: number,
): ParseError | null {
  if (section === 'agent') {
    switch (key) {
      case 'model':
        if (typeof value === 'string' && MODELS.includes(value as ModelId)) {
          out.agent.model = value as ModelId;
          return null;
        }
        return { line: lineNo, message: `unknown model "${value}"` };
      case 'context': {
        if (typeof value !== 'number') return { line: lineNo, message: 'context must be a number' };
        if (!CONTEXT_OPTIONS.includes(value as ContextWindow)) {
          return { line: lineNo, message: 'context must be 50000, 200000, or 1000000' };
        }
        out.agent.contextWindow = value as ContextWindow;
        return null;
      }
      case 'plan':
        if (typeof value === 'string' && THINKING_OPTIONS.includes(value as Thinking)) {
          out.agent.thinking = value as Thinking;
          return null;
        }
        return { line: lineNo, message: `unknown thinking budget "${value}"` };
      case 'temp':
        if (typeof value !== 'number' || value < 0 || value > 1) {
          return { line: lineNo, message: 'temp must be 0..1' };
        }
        out.agent.temperature = value;
        return null;
      case 'verify':
        if (typeof value !== 'boolean') return { line: lineNo, message: 'verify must be true/false' };
        out.agent.verifyBeforeShip = value;
        return null;
      case 'auto_ok':
        if (typeof value !== 'boolean') return { line: lineNo, message: 'auto_ok must be true/false' };
        out.agent.autoApprove = value;
        return null;
      case 'shell':
        if (typeof value !== 'boolean') return { line: lineNo, message: 'shell must be true/false' };
        out.agent.allowShellExec = value;
        return null;
      case 'prompt':
        if (typeof value !== 'string') return { line: lineNo, message: 'prompt must be a string' };
        out.agent.systemPrompt = value;
        return null;
    }
  } else if (section === 'providers') {
    switch (key) {
      case 'active':
        if (typeof value === 'string' && PROVIDERS.includes(value as ProviderId)) {
          out.providers.active = value as ProviderId;
          return null;
        }
        return { line: lineNo, message: `unknown provider "${value}"` };
      case 'anthropic.key':
        if (typeof value !== 'string') return { line: lineNo, message: 'key must be a string' };
        out.providers.anthropicKey = value;
        return null;
      case 'openai.key':
        if (typeof value !== 'string') return { line: lineNo, message: 'key must be a string' };
        out.providers.openaiKey = value;
        return null;
      case 'google.key':
        if (typeof value !== 'string') return { line: lineNo, message: 'key must be a string' };
        out.providers.googleKey = value;
        return null;
      case 'ollama.url':
        if (typeof value !== 'string') return { line: lineNo, message: 'url must be a string' };
        out.providers.ollamaUrl = value;
        return null;
      case 'server.url':
        if (typeof value !== 'string') return { line: lineNo, message: 'url must be a string' };
        out.providers.serverUrl = value;
        return null;
      case 'fallback':
        if (value === 'lucid-cloud' || value === 'none') {
          out.providers.fallback = value;
          return null;
        }
        return { line: lineNo, message: `fallback must be "lucid-cloud" or "none"` };
      case 'on_device_only':
        if (typeof value !== 'boolean') return { line: lineNo, message: 'on_device_only must be true/false' };
        out.providers.onDeviceOnly = value;
        return null;
    }
  } else if (section === 'voice') {
    switch (key) {
      case 'stt':
        if (value === 'whisper-v3' || value === 'apple' || value === 'android') {
          out.voice.stt = value;
          return null;
        }
        return { line: lineNo, message: `unknown stt "${value}"` };
      case 'hotkey':
        if (value === 'hold-mic' || value === 'tap-twice') {
          out.voice.hotkey = value;
          return null;
        }
        return { line: lineNo, message: `unknown hotkey "${value}"` };
      case 'vad':
        if (typeof value !== 'number' || value < 0 || value > 1) {
          return { line: lineNo, message: 'vad must be 0..1' };
        }
        out.voice.vad = value;
        return null;
    }
  } else if (section === 'ui' || section === 'theme') {
    switch (key) {
      case 'theme':
      case 'name':
        if (value === 'lucid-terminal') {
          out.ui.theme = value;
          return null;
        }
        return { line: lineNo, message: `theme must be "lucid-terminal"` };
      case 'density':
        if (value === 'compact' || value === 'roomy') {
          out.ui.density = value;
          return null;
        }
        return { line: lineNo, message: `density must be "compact" or "roomy"` };
      case 'scanline':
      case 'scanlines':
        if (typeof value !== 'boolean') return { line: lineNo, message: 'scanline must be true/false' };
        out.ui.scanlines = value;
        return null;
      case 'accent':
        if (typeof value !== 'string') return { line: lineNo, message: 'accent must be a string' };
        out.ui.auroraAccent = value;
        return null;
    }
  } else {
    return { line: lineNo, message: `unknown section [${section}]` };
  }
  return { line: lineNo, message: `unknown key "${key}" in [${section}]` };
}
