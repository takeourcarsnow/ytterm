// ASCII Art constants for the terminal UI

export const LOGO_ASCII = `
╔═══════════════════════════════════════════════════════════════╗
║  ██╗   ██╗████████╗████████╗███████╗██████╗ ███╗   ███╗      ║
║  ╚██╗ ██╔╝╚══██╔══╝╚══██╔══╝██╔════╝██╔══██╗████╗ ████║      ║
║   ╚████╔╝    ██║      ██║   █████╗  ██████╔╝██╔████╔██║      ║
║    ╚██╔╝     ██║      ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║      ║
║     ██║      ██║      ██║   ███████╗██║  ██║██║ ╚═╝ ██║      ║
║     ╚═╝      ╚═╝      ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝      ║
║                   ═══ REDDITUNES ═══                          ║
╚═══════════════════════════════════════════════════════════════╝
`;

export const LOGO_ASCII_SMALL = `
┌─────────────────────────┐
│  ▀▄▀ ▀█▀ ▀█▀ █▀▀ █▀█ █▄█│
│   █   █   █  ██▄ █▀▄ █ █│
│    ═══ REDDITUNES ═══     │
└─────────────────────────┘
`;

export const PLAYER_FRAME = {
  topLeft: '╔',
  topRight: '╗',
  bottomLeft: '╚',
  bottomRight: '╝',
  horizontal: '═',
  vertical: '║',
  leftT: '╠',
  rightT: '╣',
  topT: '╦',
  bottomT: '╩',
  cross: '╬',
};

export const PROGRESS_CHARS = {
  filled: '█',
  half: '▓',
  empty: '░',
  left: '▐',
  right: '▌',
};

export const VOLUME_BARS = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];

export const PLAY_ICON = '▶';
export const PAUSE_ICON = '⏸';
export const STOP_ICON = '⏹';
export const NEXT_ICON = '⏭';
export const PREV_ICON = '⏮';
export const SHUFFLE_ICON = '🔀';
export const REPEAT_ICON = '🔁';
export const REPEAT_ONE_ICON = '🔂';
export const MUTE_ICON = '🔇';
export const VOLUME_LOW_ICON = '🔈';
export const VOLUME_MED_ICON = '🔉';
export const VOLUME_HIGH_ICON = '🔊';

export const VISUALIZER_CHARS = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];

export const LOADING_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

export const DECORATIVE_LINES = {
  single: '─',
  double: '═',
  dotted: '┄',
  dashed: '┈',
};

export const WINDOW_CONTROLS = {
  close: '×',
  minimize: '─',
  maximize: '□',
};

export const MUSIC_NOTES = ['♪', '♫', '♬', '♩'];

export const generateVisualizerBars = (count: number): string[] => {
  return Array.from({ length: count }, () => 
    VISUALIZER_CHARS[Math.floor(Math.random() * VISUALIZER_CHARS.length)]
  );
};

export const generateProgressBar = (progress: number, width: number): string => {
  const filledWidth = Math.floor((progress / 100) * width);
  const emptyWidth = width - filledWidth;
  return PROGRESS_CHARS.filled.repeat(filledWidth) + PROGRESS_CHARS.empty.repeat(emptyWidth);
};
