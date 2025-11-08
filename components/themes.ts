export interface TerminalTheme {
  name: string;
  background: string;
  foreground: string;
  cursor: string;
  black: string;
  red: string;
  green: string;
  yellow: string;
  blue: string;
  magenta: string;
  cyan: string;
  white: string;
  brightBlack?: string;
  brightRed?: string;
  brightGreen?: string;
  brightYellow?: string;
  brightBlue?: string;
  brightMagenta?: string;
  brightCyan?: string;
  brightWhite?: string;
}

export const terminalThemes: { [key: string]: TerminalTheme } = {
  github: {
    name: 'GitHub Dark',
    background: '#0d1117',
    foreground: '#e6edf3',
    cursor: '#58a6ff',
    black: '#21262d',
    red: '#ff6b6b',
    green: '#3fb950',
    yellow: '#ffd700',
    blue: '#58a6ff',
    magenta: '#bc8cff',
    cyan: '#39c5cf',
    white: '#b1bac4',
    brightBlack: '#8b949e',
    brightRed: '#ff8585',
    brightGreen: '#7ee787',
    brightYellow: '#f0e68c',
    brightBlue: '#79c0ff',
    brightMagenta: '#d2a8ff',
    brightCyan: '#56d4dd',
    brightWhite: '#ffffff',
  },
  
  dracula: {
    name: 'Dracula',
    background: '#111115ff',
    foreground: '#f8f8f2',
    cursor: '#f8f8f0',
    black: '#21222c',
    red: '#ff6e67',
    green: '#5af78e',
    yellow: '#f4f99d',
    blue: '#caa9fa',
    magenta: '#ff92d0',
    cyan: '#9aedfe',
    white: '#f8f8f2',
    brightBlack: '#7984a4',
    brightRed: '#ff8b8b',
    brightGreen: '#69ff94',
    brightYellow: '#ffff00',
    brightBlue: '#d6acff',
    brightMagenta: '#ffb3e6',
    brightCyan: '#c2f0ff',
    brightWhite: '#ffffff',
  },
  
  monokai: {
    name: 'Monokai',
    background: '#272822',
    foreground: '#f8f8f2',
    cursor: '#f8f8f0',
    black: '#272822',
    red: '#ff2c70',
    green: '#a7e22e',
    yellow: '#ffd866',
    blue: '#78dce8',
    magenta: '#c792ea',
    cyan: '#a1efe4',
    white: '#f8f8f2',
    brightBlack: '#908d84',
    brightRed: '#ff6188',
    brightGreen: '#bae67e',
    brightYellow: '#ffe066',
    brightBlue: '#85daed',
    brightMagenta: '#d4b5f8',
    brightCyan: '#b8f4ed',
    brightWhite: '#ffffff',
  },
  
  nord: {
    name: 'Nord',
    background: '#2e3440',
    foreground: '#eceff4',
    cursor: '#d8dee9',
    black: '#3b4252',
    red: '#d06f79',
    green: '#a3be8c',
    yellow: '#f0d399',
    blue: '#88c0d0',
    magenta: '#c895bf',
    cyan: '#8be9fd',
    white: '#e5e9f0',
    brightBlack: '#616e88',
    brightRed: '#dd828c',
    brightGreen: '#b4d4a1',
    brightYellow: '#f5dda7',
    brightBlue: '#a5d6e0',
    brightMagenta: '#d4a5d0',
    brightCyan: '#9ef0ff',
    brightWhite: '#ffffff',
  },
  
  gruvbox: {
    name: 'Gruvbox Dark',
    background: '#282828',
    foreground: '#fbf1c7',
    cursor: '#ebdbb2',
    black: '#282828',
    red: '#fb4934',
    green: '#b8bb26',
    yellow: '#fabd2f',
    blue: '#83a598',
    magenta: '#d3869b',
    cyan: '#8ec07c',
    white: '#a89984',
    brightBlack: '#a89984',
    brightRed: '#fe8019',
    brightGreen: '#d5c4a1',
    brightYellow: '#fdd787',
    brightBlue: '#a4c5db',
    brightMagenta: '#e8b4bc',
    brightCyan: '#b8d4a8',
    brightWhite: '#ffffff',
  },
};

export const themeNames = Object.keys(terminalThemes);

export function getTheme(themeName: string): TerminalTheme {
  return terminalThemes[themeName] || terminalThemes.github;
}
