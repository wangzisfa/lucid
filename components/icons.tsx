import React from 'react';

interface IconProps {
  size?: number;
  stroke?: string;
  fill?: string;
  sw?: number;
}

function Icon({
  d,
  size = 18,
  stroke = 'currentColor',
  fill = 'none',
  sw = 1.6,
}: IconProps & { d: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={stroke}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
      aria-hidden
    >
      <path d={d} />
    </svg>
  );
}

export const IconMic       = (p: IconProps) => <Icon {...p} d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3" />;
export const IconStop      = (p: IconProps) => <Icon {...p} d="M5 5h14v14H5z" fill={p.fill ?? 'currentColor'} stroke="none" />;
export const IconSend      = (p: IconProps) => <Icon {...p} d="M4 12l16-8-4 18-5-7-7-3z" />;
export const IconChevR     = (p: IconProps) => <Icon {...p} d="M9 6l6 6-6 6" />;
export const IconChevL     = (p: IconProps) => <Icon {...p} d="M15 6l-6 6 6 6" />;
export const IconChevD     = (p: IconProps) => <Icon {...p} d="M6 9l6 6 6-6" />;
export const IconMenu      = (p: IconProps) => <Icon {...p} d="M4 7h16M4 12h16M4 17h16" />;
export const IconPlus      = (p: IconProps) => <Icon {...p} d="M12 5v14M5 12h14" />;
export const IconSearch    = (p: IconProps) => <Icon {...p} d="M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14zM21 21l-4.3-4.3" />;
export const IconFile      = (p: IconProps) => <Icon {...p} d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5zM14 3v5h5" />;
export const IconFolder    = (p: IconProps) => <Icon {...p} d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z" />;
export const IconCheck     = (p: IconProps) => <Icon {...p} d="M5 12l4 4 10-10" />;
export const IconClose     = (p: IconProps) => <Icon {...p} d="M6 6l12 12M18 6L6 18" />;
export const IconRefresh   = (p: IconProps) => <Icon {...p} d="M3 12a9 9 0 0 1 15.5-6.3L21 8M21 3v5h-5M21 12a9 9 0 0 1-15.5 6.3L3 16M3 21v-5h5" />;
export const IconTerminal  = (p: IconProps) => <Icon {...p} d="M4 6l5 6-5 6M12 18h8" />;
export const IconEye       = (p: IconProps) => <Icon {...p} d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" />;
export const IconSettings  = (p: IconProps) => <Icon {...p} d="M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />;
export const IconBranch    = (p: IconProps) => <Icon {...p} d="M6 3v12a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3M6 3a2 2 0 1 0 0 4M6 3a2 2 0 1 1 0 4M18 15a2 2 0 1 0 0 4M18 15a2 2 0 1 1 0 4M6 7v0" />;
