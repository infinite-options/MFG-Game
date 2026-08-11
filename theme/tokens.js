// Design tokens: the single source of truth for colors, spacing, radii, and type scale.
// Every component should read styling values from here (via useTheme()) rather than
// hardcoding colors/numbers locally.

export const palette = {
  primary: '#3C7A54',
  accent: '#C9982B',
  danger: '#B23B2E',
  neutral: {
    0: '#FFFBF2',
    50: '#F4E8CF',
    100: '#EAD9B8',
    200: '#D8C29C',
    300: '#C3AB80',
    400: '#9C7F55',
    600: '#6B5335',
    800: '#4A3423',
    900: '#2A1B10',
  },
};

export const lightTheme = {
  mode: 'light',
  background: '#EDDBB5',
  surface: '#FFF8E7',
  surfaceAlt: '#F3E8CC',
  text: '#3A2718',
  textMuted: '#8A6F4B',
  border: '#D8C29C',
  primary: palette.primary,
  primaryText: '#FFFBF2',
  primaryEdge: '#2A5A3D',
  primarySoft: '#E1EFE6',
  accent: palette.accent,
  accentSoft: '#F6E6BE',
  accentEdge: '#A67A1E',
  danger: palette.danger,
  dangerSoft: '#F3DAD1',
  dangerEdge: '#8A2C22',
  surfaceEdge: '#C7A96F',
  shadow: '#2A1B10',
};

export const darkTheme = {
  mode: 'dark',
  background: '#241811',
  surface: '#332318',
  surfaceAlt: '#3F2D1F',
  text: '#F5E9D0',
  textMuted: '#B79A73',
  border: '#4E3A28',
  primary: '#4E9868',
  primaryText: '#FBF3DD',
  primaryEdge: '#2F6B48',
  primarySoft: '#1F3327',
  accent: '#E0B34D',
  accentSoft: '#3D2F14',
  accentEdge: '#B5872E',
  danger: '#E2685A',
  dangerSoft: '#3B211D',
  dangerEdge: '#B14538',
  surfaceEdge: '#1B120C',
  shadow: '#000000',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const radii = { sm: 8, md: 14, lg: 22, pill: 999 };

export const typeScale = {
  h1: { fontSize: 30, fontWeight: '800' },
  h2: { fontSize: 22, fontWeight: '800' },
  h3: { fontSize: 18, fontWeight: '700' },
  body: { fontSize: 15, fontWeight: '400' },
  bodyBold: { fontSize: 15, fontWeight: '700' },
  caption: { fontSize: 12, fontWeight: '600' },
  numeric: { fontSize: 26, fontWeight: '800' },
};
