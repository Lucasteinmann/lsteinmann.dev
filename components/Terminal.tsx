'use client';

import { useEffect, useRef, useState } from 'react';
import '@xterm/xterm/css/xterm.css';
import { getTheme, themeNames } from './themes';
import { useTheme } from './ThemeContext';

interface TerminalProps {
  className?: string;
  onClose?: () => void;
  onNavigate?: (path: string) => void;
}

export default function Terminal({ className = '', onClose, onNavigate }: TerminalProps) {
  const { theme } = useTheme();
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminal = useRef<any>(null);
  const fitAddon = useRef<any>(null);
  const isLoggedInRef = useRef(false);
  const usernameRef = useRef('guest');
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('guest');
  const [sessionChecked, setSessionChecked] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('terminal-theme') || 'github';
    }
    return 'github';
  });

  // Save theme to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('terminal-theme', currentTheme);
    }
  }, [currentTheme]);

  // Sync state with refs
  useEffect(() => {
    isLoggedInRef.current = isLoggedIn;
    usernameRef.current = username;
  }, [isLoggedIn, username]);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const { createClient } = await import('@/utils/supabase/client');
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('user_id', user.id)
          .single();
        
        if (profile?.username) {
          setIsLoggedIn(true);
          setUsername(profile.username);
        }
      }
      
      setSessionChecked(true);
    };
    
    checkSession();
  }, []);

  useEffect(() => {
    if (!terminalRef.current || typeof window === 'undefined' || terminal.current || !sessionChecked) return;

    const initTerminal = async () => {
      try {
        const { Terminal: XTerminal } = await import('@xterm/xterm');
        const { FitAddon: XTermFitAddon } = await import('@xterm/addon-fit');

        const theme = getTheme(currentTheme);

        terminal.current = new XTerminal({
          cursorBlink: true,
          theme: {
            background: theme.background,
            foreground: theme.foreground,
            cursor: theme.cursor,
            black: theme.black,
            red: theme.red,
            green: theme.green,
            yellow: theme.yellow,
            blue: theme.blue,
            magenta: theme.magenta,
            cyan: theme.cyan,
            white: theme.white,
            brightBlack: theme.brightBlack,
            brightRed: theme.brightRed,
            brightGreen: theme.brightGreen,
            brightYellow: theme.brightYellow,
            brightBlue: theme.brightBlue,
            brightMagenta: theme.brightMagenta,
            brightCyan: theme.brightCyan,
            brightWhite: theme.brightWhite,
          },
          fontSize: 14,
          fontFamily: 'Fira Code, monospace',
        });

        fitAddon.current = new XTermFitAddon();
        terminal.current.loadAddon(fitAddon.current);
        terminal.current.open(terminalRef.current);
        fitAddon.current.fit();

        // Welcome message
        terminal.current.writeln('');
        terminal.current.writeln('\x1b[1;33m ██████╗ ███████╗██╗██████╗ ██╗███████╗\x1b[0m');
        terminal.current.writeln('\x1b[1;33m██╔═══██╗██╔════╝██║██╔══██╗██║██╔════╝\x1b[0m');
        terminal.current.writeln('\x1b[1;33m██║   ██║███████╗██║██████╔╝██║███████╗\x1b[0m');
        terminal.current.writeln('\x1b[1;33m██║   ██║╚════██║██║██╔══██╗██║╚════██║\x1b[0m');
        terminal.current.writeln('\x1b[1;33m╚██████╔╝███████║██║██║  ██║██║███████║\x1b[0m');
        terminal.current.writeln('\x1b[1;33m ╚═════╝ ╚══════╝╚═╝╚═╝  ╚═╝╚═╝╚══════╝\x1b[0m');
        terminal.current.writeln('');
        terminal.current.writeln('Type \x1b[1;36mhelp\x1b[0m to see available commands.');
        terminal.current.writeln('');
        
        const getPrompt = () => {
          const user = isLoggedInRef.current ? usernameRef.current : 'guest';
          return `\x1b[1;32m[${user}@osiris ~]$ \x1b[0m`;
        };
        
        terminal.current.write(getPrompt());
        setTimeout(() => terminal.current?.focus(), 100);

        let currentLine = '';
        let commandHistory: string[] = [];
        let historyIndex = -1;
        let isInInteractiveMode = false;
        let interactiveStep: 'username' | 'password' | 'email' = 'username';
        let interactiveMode: 'login' | 'signup' = 'login';
        let interactiveUsername = '';
        let interactivePassword = '';
        let interactiveEmail = '';

        const handleCommand = (command: string): boolean | void => {
          const args = command.split(' ');
          const cmd = args[0].toLowerCase();
          
          switch (cmd) {
            case 'help':
              terminal.current?.writeln('\x1b[1;33mAvailable commands:\x1b[0m');
              terminal.current?.writeln('');
              terminal.current?.writeln('\x1b[1;35mNavigation:\x1b[0m');
              terminal.current?.writeln('  \x1b[1;36mls\x1b[0m        - List applications');
              terminal.current?.writeln('  \x1b[1;36mcd\x1b[0m        - Open Application');
              terminal.current?.writeln('');
              terminal.current?.writeln('\x1b[1;35mAuthentication:\x1b[0m');
              terminal.current?.writeln('  \x1b[1;36msignup\x1b[0m    - Create new account');
              terminal.current?.writeln('  \x1b[1;36mlogin\x1b[0m     - Login');
              terminal.current?.writeln('  \x1b[1;36mlogout\x1b[0m    - Logout');
              terminal.current?.writeln('  \x1b[1;36mwhoami\x1b[0m    - Show user info');
              terminal.current?.writeln('');
              terminal.current?.writeln('\x1b[1;35mSystem:\x1b[0m');
              terminal.current?.writeln('  \x1b[1;36mclear\x1b[0m     - Clear terminal');
              terminal.current?.writeln('  \x1b[1;36mtheme\x1b[0m     - Change terminal theme');
              terminal.current?.writeln('  \x1b[1;36mexit\x1b[0m      - Close terminal');
              terminal.current?.writeln('');
              break;
            case 'ls':
              terminal.current?.writeln('\x1b[1;34mnotes\x1b[0m      \x1b[1;34mprojects\x1b[0m');
              break;
            case 'cd':
              const target = args[1];
              if (target === 'notes') {
                terminal.current?.writeln(`\x1b[1;32mOpening Notes...\x1b[0m`);
                setTimeout(() => onNavigate?.('notes'), 300);
                // Don't return false - show prompt immediately
              } else if (target) {
                terminal.current?.writeln(`\x1b[1;31mcd: ${target}: No such directory\x1b[0m`);
              }
              break;
            case 'whoami':
              import('@/app/actions').then(async ({ terminalWhoami }) => {
                const result = await terminalWhoami();
                if (result.success && result.user) {
                  terminal.current?.writeln(`\x1b[1;32m${result.user.email}\x1b[0m`);
                } else {
                  terminal.current?.writeln('\x1b[1;31mNot logged in\x1b[0m');
                }
                terminal.current?.write(getPrompt());
              });
              return false;
            case 'signup':
              terminal.current?.writeln('Create Account');
              terminal.current?.write('Email: ');
              isInInteractiveMode = true;
              interactiveMode = 'signup';
              interactiveStep = 'email';
              interactiveUsername = '';
              interactivePassword = '';
              interactiveEmail = '';
              return false;
            case 'login':
              terminal.current?.write('Username: ');
              isInInteractiveMode = true;
              interactiveMode = 'login';
              interactiveStep = 'username';
              interactiveUsername = '';
              interactivePassword = '';
              interactiveEmail = '';
              return false;
            case 'logout':
              import('@/app/actions').then(async ({ terminalLogout }) => {
                const result = await terminalLogout();
                terminal.current?.writeln(result.success ? '\x1b[1;32mLogged out\x1b[0m' : '\x1b[1;31mError\x1b[0m');
                if (result.success) {
                  // Update the username in state and refs immediately
                  setIsLoggedIn(false);
                  setUsername('guest');
                  isLoggedInRef.current = false;
                  usernameRef.current = 'guest';
                }
                terminal.current?.write(getPrompt());
              });
              return false;
            case 'clear':
              terminal.current?.clear();
              break;
            case 'theme':
              const themeName = args[1];
              if (!themeName) {
                terminal.current?.writeln('\x1b[1;33mAvailable themes:\x1b[0m');
                themeNames.forEach(name => {
                  const indicator = name === currentTheme ? '\x1b[1;32m*\x1b[0m' : ' ';
                  terminal.current?.writeln(`  ${indicator} \x1b[1;36m${name}\x1b[0m`);
                });
                terminal.current?.writeln('');
                terminal.current?.writeln('Usage: \x1b[1;36mtheme <name>\x1b[0m');
              } else if (themeNames.includes(themeName)) {
                setCurrentTheme(themeName);
                terminal.current?.writeln(`\x1b[1;32mTheme changed to: ${themeName}\x1b[0m`);
                terminal.current?.writeln('\x1b[1;33mReloading terminal...\x1b[0m');
                setTimeout(() => {
                  window.location.reload();
                }, 500);
                return false;
              } else {
                terminal.current?.writeln(`\x1b[1;31mUnknown theme: ${themeName}\x1b[0m`);
                terminal.current?.writeln('Available themes: ' + themeNames.join(', '));
              }
              break;
            case 'neofetch':
              terminal.current?.writeln('\x1b[1;36mluca\x1b[0m@\x1b[1;36mosiris\x1b[0m');
              terminal.current?.writeln('OS: Arch Linux');
              terminal.current?.writeln('Shell: bash');
              break;
            case 'banner':
              terminal.current?.writeln('');
              terminal.current?.writeln('\x1b[1;33m ██████╗ ███████╗██╗██████╗ ██╗███████╗\x1b[0m');
              terminal.current?.writeln('\x1b[1;33m██╔═══██╗██╔════╝██║██╔══██╗██║██╔════╝\x1b[0m');
              terminal.current?.writeln('\x1b[1;33m██║   ██║███████╗██║██████╔╝██║███████╗\x1b[0m');
              terminal.current?.writeln('\x1b[1;33m██║   ██║╚════██║██║██╔══██╗██║╚════██║\x1b[0m');
              terminal.current?.writeln('\x1b[1;33m╚██████╔╝███████║██║██║  ██║██║███████║\x1b[0m');
              terminal.current?.writeln('\x1b[1;33m ╚═════╝ ╚══════╝╚═╝╚═╝  ╚═╝╚═╝╚══════╝\x1b[0m');
              terminal.current?.writeln('');
              break;
            case 'exit':
              terminal.current?.writeln('\x1b[1;33mClosing...\x1b[0m');
              setTimeout(() => onClose?.(), 300);
              break;
            default:
              terminal.current?.writeln(`\x1b[1;31mbash: ${command}: command not found\x1b[0m`);
              break;
          }
        };

        terminal.current.onKey(({ key, domEvent }: any) => {
          const printable = !domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey;

          if (isInInteractiveMode) {
            if (domEvent.keyCode === 13) {
              if (interactiveMode === 'signup') {
                if (interactiveStep === 'email') {
                  if (!interactiveEmail.trim() || !interactiveEmail.includes('@')) {
                    terminal.current?.writeln('\x1b[1;31mValid email required\x1b[0m');
                    terminal.current?.write(getPrompt());
                    isInInteractiveMode = false;
                    return;
                  }
                  terminal.current?.writeln('');
                  terminal.current?.write('Username: ');
                  interactiveStep = 'username';
                } else if (interactiveStep === 'username') {
                  if (!interactiveUsername.trim()) {
                    terminal.current?.writeln('\x1b[1;31mUsername required\x1b[0m');
                    terminal.current?.write(getPrompt());
                    isInInteractiveMode = false;
                    return;
                  }
                  terminal.current?.writeln('');
                  terminal.current?.write('Password: ');
                  interactiveStep = 'password';
                } else {
                  terminal.current?.writeln('');
                  if (!interactivePassword.trim() || interactivePassword.length < 6) {
                    terminal.current?.writeln('\x1b[1;31mPassword must be at least 6 characters\x1b[0m');
                    terminal.current?.write(getPrompt());
                    isInInteractiveMode = false;
                    return;
                  }
                  
                  const email = interactiveEmail;
                  const user = interactiveUsername;
                  const pass = interactivePassword;
                  isInInteractiveMode = false;
                  
                  import('@/app/actions').then(async ({ terminalSignup }) => {
                    const result = await terminalSignup(email, pass, user);
                    terminal.current?.writeln(result.success ? '\x1b[1;32m' + result.message + '\x1b[0m' : '\x1b[1;31m' + result.message + '\x1b[0m');
                    if (result.success) {
                      // Update the username in state and refs immediately
                      setIsLoggedIn(true);
                      setUsername(user);
                      isLoggedInRef.current = true;
                      usernameRef.current = user;
                    }
                    terminal.current?.write(getPrompt());
                  });
                }
              } else {
                // Login mode
                if (interactiveStep === 'username') {
                  if (!interactiveUsername.trim()) {
                    terminal.current?.writeln('\x1b[1;31mUsername required\x1b[0m');
                    terminal.current?.write(getPrompt());
                    isInInteractiveMode = false;
                    return;
                  }
                  terminal.current?.writeln('');
                  terminal.current?.write('Password: ');
                  interactiveStep = 'password';
                } else {
                  terminal.current?.writeln('');
                  if (!interactivePassword.trim()) {
                    terminal.current?.writeln('\x1b[1;31mPassword required\x1b[0m');
                    terminal.current?.write(getPrompt());
                    isInInteractiveMode = false;
                    return;
                  }
                  
                  const user = interactiveUsername;
                  const pass = interactivePassword;
                  isInInteractiveMode = false;
                  
                  import('@/app/actions').then(async ({ terminalLogin }) => {
                    const result = await terminalLogin(user, pass);
                    terminal.current?.writeln(result.success ? '\x1b[1;32mLogin successful\x1b[0m' : '\x1b[1;31mLogin failed\x1b[0m');
                    if (result.success) {
                      // Update the username in state and refs immediately
                      setIsLoggedIn(true);
                      setUsername(user);
                      isLoggedInRef.current = true;
                      usernameRef.current = user;
                    }
                    terminal.current?.write(getPrompt());
                  });
                }
              }
            } else if (domEvent.keyCode === 8) {
              if (interactiveStep === 'email' && interactiveEmail.length > 0) {
                interactiveEmail = interactiveEmail.slice(0, -1);
                terminal.current?.write('\b \b');
              } else if (interactiveStep === 'username' && interactiveUsername.length > 0) {
                interactiveUsername = interactiveUsername.slice(0, -1);
                terminal.current?.write('\b \b');
              } else if (interactiveStep === 'password' && interactivePassword.length > 0) {
                interactivePassword = interactivePassword.slice(0, -1);
                terminal.current?.write('\b \b');
              }
            } else if (printable) {
              if (interactiveStep === 'email') {
                interactiveEmail += key;
                terminal.current?.write(key);
              } else if (interactiveStep === 'username') {
                interactiveUsername += key;
                terminal.current?.write(key);
              } else {
                interactivePassword += key;
                terminal.current?.write('*');
              }
            }
            return;
          }

          if (domEvent.keyCode === 13) {
            terminal.current?.writeln('');
            if (currentLine.trim()) {
              commandHistory.push(currentLine.trim());
              const shouldShowPrompt = handleCommand(currentLine.trim());
              if (shouldShowPrompt !== false) {
                terminal.current?.write(getPrompt());
              }
            } else {
              terminal.current?.write(getPrompt());
            }
            currentLine = '';
            historyIndex = -1;
          } else if (domEvent.keyCode === 8) {
            if (currentLine.length > 0) {
              currentLine = currentLine.slice(0, -1);
              terminal.current?.write('\b \b');
            }
          } else if (domEvent.keyCode === 38) {
            if (commandHistory.length > 0) {
              terminal.current?.write('\b'.repeat(currentLine.length));
              terminal.current?.write(' '.repeat(currentLine.length));
              terminal.current?.write('\b'.repeat(currentLine.length));
              
              if (historyIndex === -1) {
                historyIndex = commandHistory.length - 1;
              } else if (historyIndex > 0) {
                historyIndex--;
              }
              
              currentLine = commandHistory[historyIndex];
              terminal.current?.write(currentLine);
            }
          } else if (printable) {
            currentLine += key;
            terminal.current?.write(key);
          }
        });

        const handleResize = () => fitAddon.current?.fit();
        window.addEventListener('resize', handleResize);
        return () => {
          window.removeEventListener('resize', handleResize);
          terminal.current?.dispose();
        };
      } catch (error) {
        console.error('Failed to initialize terminal:', error);
      }
    };

    initTerminal();
  }, [sessionChecked, onClose, onNavigate]);

  return (
    <div className="h-screen w-screen flex items-center justify-center" style={{ backgroundColor: theme.background }}>
      <div 
        className="w-full max-w-4xl h-[600px] rounded-lg shadow-2xl overflow-hidden border"
        style={{ 
          borderColor: theme.brightBlack,
          backgroundColor: theme.background 
        }}
      >
        <div 
          className="px-4 py-2 border-b flex justify-between items-center"
          style={{ 
            backgroundColor: theme.black,
            borderColor: theme.brightBlack 
          }}
        >
          <span className="text-sm font-mono" style={{ color: theme.brightWhite }}>~/terminal</span>
          <button 
            className="w-6 h-6 flex items-center justify-center rounded-full transition-colors"
            style={{ color: theme.brightWhite }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.red || '#ff0000';
              e.currentTarget.style.color = theme.background || '#000000';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = theme.brightWhite || '#ffffff';
            }}
            onClick={onClose}
          >
            ×
          </button>
        </div>
        
        <div className="p-4 h-[calc(100%-42px)] overflow-hidden">
          <div ref={terminalRef} className="w-full h-full [&_.xterm-viewport]:!overflow-hidden" />
        </div>
      </div>
    </div>
  );
}
