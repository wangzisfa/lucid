import { DarkTheme, type Theme } from '@react-navigation/native';
import { colors } from '@/theme/tokens';

/** React Navigation theme — dark canvas so there's no white flash on push/pop. */
export const navTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bgDeep,
    card: colors.bgDeep,
    text: colors.textHi,
    border: colors.glassBorder,
    primary: colors.rose,
    notification: colors.rose,
  },
};
