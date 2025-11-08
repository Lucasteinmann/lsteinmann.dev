'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import NotesApp from '@/components/NotesApp';

const Terminal = dynamic(() => import('@/components/Terminal'), { ssr: false });

export default function OsirisShell() {
  const [currentApp, setCurrentApp] = useState<string | null>(null);
  const [showTerminal, setShowTerminal] = useState(true);

  const handleNavigation = (path: string) => {
    setCurrentApp(path);
  };

  const handleCloseApp = () => {
    setCurrentApp(null);
  };

  const handleCloseTerminal = () => {
    setShowTerminal(false);
  };

  // Handle Ctrl + ` keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault();
        setShowTerminal(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Terminal - always visible as base layer */}
      {showTerminal && (
        <Terminal
          onClose={handleCloseTerminal}
          onNavigate={handleNavigation}
        />
      )}

      {/* Notes app overlay */}
      {currentApp === 'notes' && <NotesApp onClose={handleCloseApp} />}

      {/* Text instruction when terminal is closed */}
      {!showTerminal && !currentApp && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-gray-500 text-2xl font-mono animate-pulse">
              Press <kbd className="px-3 py-1 bg-gray-800 border border-gray-700 rounded text-green-400">Ctrl + `</kbd> to open terminal
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
