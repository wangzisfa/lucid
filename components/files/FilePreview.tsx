'use client';

import React from 'react';
import { Syntax } from '../Syntax';
import { mockFileContent } from '@/lib/mock-files';

interface FilePreviewProps {
  /** Path of the file to preview, or null when nothing is selected. */
  fileId: string | null;
}

/**
 * Bottom-of-screen syntax-highlighted snippet of the cursored file. Falls
 * back to a polite "no file selected" line when nothing is picked.
 */
export function FilePreview({ fileId }: FilePreviewProps) {
  const code = fileId ? mockFileContent[fileId] ?? defaultStub(fileId) : null;

  return (
    <div
      style={{
        marginTop: 14,
        padding: 8,
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(0,0,0,0.3)',
        maxHeight: 96,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div style={{ color: 'var(--text-lo)', fontSize: 9.5, marginBottom: 4 }}>
        // PREVIEW · {fileId ?? '—'}
      </div>
      {code ? (
        <Syntax code={code} fontSize={10} />
      ) : (
        <div
          style={{
            color: 'var(--text-lo)',
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
          }}
        >
          (no file selected)
        </div>
      )}
    </div>
  );
}

function defaultStub(fileId: string): string {
  return `// ${fileId}\n// preview not available`;
}
