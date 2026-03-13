export const COLORS = {
  bg: '#0a0a14',
  bgCard: '#0f0e17',
  bgElevated: '#15142a',
  bgInput: 'rgba(15,14,23,0.9)',

  textPrimary: '#fffffe',
  textSecondary: '#a7a9be',
  textMuted: '#5a5a7a',

  border: '#2d2b42',
  borderLight: '#3a3a5a',

  gold: '#e6a817',
  goldLight: '#f5d060',

  status: {
    locked:      { bg: '#12111e', border: '#2a2a3a', text: '#4a4a5a', opacity: 0.4 },
    available:   { bg: '#1a1a2e', border: '#8899bb', text: '#d0d0e0', opacity: 0.95 },
    in_progress: { bg: '#1e2a3a', border: '#7abba0', text: '#fffffe', opacity: 1.0  },
    completed:   { bg: '#1a2e1a', border: '#2dc653', text: '#fffffe', opacity: 1.0  },
    mastered:    { bg: '#2e2800', border: '#FFD700', text: '#fffffe', opacity: 1.0  },
  } as Record<string, { bg: string; border: string; text: string; opacity: number }>,

  realms: {
    1:   { color: '#D4A017', border: '#F5D060', glow: '#D4A01740', locked: '#3A3520' },
    2:   { color: '#5A6A8A', border: '#8899BB', glow: '#5A6A8A40', locked: '#2A2E38' },
    3:   { color: '#1A8A7A', border: '#40D4B8', glow: '#1A8A7A40', locked: '#1A2E2A' },
    4:   { color: '#7B4FBF', border: '#B89AE8', glow: '#7B4FBF40', locked: '#2A2038' },
    5:   { color: '#B5334A', border: '#E86B7F', glow: '#B5334A40', locked: '#381A22' },
    6:   { color: '#2255AA', border: '#5599EE', glow: '#2255AA40', locked: '#1A2238' },
    7:   { color: '#E6A817', border: '#FFD65C', glow: '#E6A81740', locked: '#3A3520' },
    '8a':{ color: '#1B998B', border: '#3DCBB8', glow: '#1B998B40', locked: '#1A2E28' },
    '8b':{ color: '#6C5CE7', border: '#A29BFE', glow: '#6C5CE740', locked: '#221E38' },
  } as Record<string | number, { color: string; border: string; glow: string; locked: string }>,

  capstone: { color: '#FF6B35', border: '#FF9A6C', glow: '#FF6B3540', locked: '#382218' },
};
