import React from 'react';

interface SyntaxProps {
  code: string;
  fontSize?: number;
}

interface Token {
  t: string;
  c: keyof typeof colors;
}

const colors = {
  plain:   'var(--text-hi)',
  comment: 'var(--text-lo)',
  string:  '#FFB99B',
  keyword: '#C792FF',
  builtin: 'var(--cyan)',
  type:    '#FFD86B',
  fn:      'var(--cyan)',
  num:     'var(--rose)',
  punct:   'var(--text-mid)',
};

const RE =
  /(\/\/[^\n]*)|('[^']*'|"[^"]*"|`[^`]*`)|\b(const|let|var|function|return|if|else|for|while|import|from|export|default|class|new|async|await|true|false|null)\b|\b(useState|useEffect|useMemo|setTimeout|console)\b|([A-Z][a-zA-Z]+)|([a-z][a-zA-Z]*)(?=\()|(\d+(?:\.\d+)?)|([{}()\[\];,.<>=+\-*/!?:|&])/g;

function tokenize(line: string): Token[] {
  const out: Token[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  // reset state for each line
  const re = new RegExp(RE.source, 'g');
  while ((m = re.exec(line)) !== null) {
    if (m.index > last) out.push({ t: line.slice(last, m.index), c: 'plain' });
    if (m[1]) out.push({ t: m[1], c: 'comment' });
    else if (m[2]) out.push({ t: m[2], c: 'string' });
    else if (m[3]) out.push({ t: m[3], c: 'keyword' });
    else if (m[4]) out.push({ t: m[4], c: 'builtin' });
    else if (m[5]) out.push({ t: m[5], c: 'type' });
    else if (m[6]) out.push({ t: m[6], c: 'fn' });
    else if (m[7]) out.push({ t: m[7], c: 'num' });
    else if (m[8]) out.push({ t: m[8], c: 'punct' });
    last = re.lastIndex;
  }
  if (last < line.length) out.push({ t: line.slice(last), c: 'plain' });
  return out;
}

/** Lightweight syntax highlighter — colors keywords, strings, numbers, types, comments. */
export function Syntax({ code, fontSize = 11.5 }: SyntaxProps) {
  return (
    <pre
      style={{
        margin: 0,
        fontFamily: 'var(--font-mono)',
        fontSize,
        lineHeight: 1.65,
        whiteSpace: 'pre',
        overflow: 'hidden',
      }}
    >
      {code.split('\n').map((line, i) => (
        <div key={i}>
          {tokenize(line).map((tok, j) => (
            <span key={j} style={{ color: colors[tok.c] }}>{tok.t}</span>
          ))}
        </div>
      ))}
    </pre>
  );
}
