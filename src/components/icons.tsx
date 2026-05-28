import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

interface IconProps {
  size?: number;
  stroke?: string;
  fill?: string;
  sw?: number;
}

function Icon({
  d,
  size = 18,
  stroke = '#f6f4ff',
  fill = 'none',
  sw = 1.6,
}: IconProps & { d: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill}>
      <Path
        d={d}
        stroke={stroke}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export const IconMic = (p: IconProps) => (
  <Icon {...p} d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3" />
);
export const IconStop = ({ size = 18, fill = '#f6f4ff' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect x={5} y={5} width={14} height={14} fill={fill} />
  </Svg>
);
export const IconSend = (p: IconProps) => <Icon {...p} d="M4 12l16-8-4 18-5-7-7-3z" />;
export const IconChevR = (p: IconProps) => <Icon {...p} d="M9 6l6 6-6 6" />;
export const IconChevL = (p: IconProps) => <Icon {...p} d="M15 6l-6 6 6 6" />;
export const IconChevD = (p: IconProps) => <Icon {...p} d="M6 9l6 6 6-6" />;
export const IconMenu = (p: IconProps) => <Icon {...p} d="M3 6h18M3 12h18M3 18h18" />;
export const IconClose = (p: IconProps) => <Icon {...p} d="M6 6l12 12M18 6L6 18" />;
