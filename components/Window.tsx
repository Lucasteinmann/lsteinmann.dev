'use client';

import { useRef, useState, useEffect } from 'react';
import { useTheme } from './ThemeContext';

interface WindowProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: string;
  height?: string;
}

export default function Window({ 
  title, 
  onClose, 
  children, 
  width = 'max-w-4xl', 
  height = 'h-[600px]' 
}: WindowProps) {
  const { theme } = useTheme();
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('drag-handle')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        ref={windowRef}
        className={`rounded-lg shadow-2xl w-full ${width} ${height} flex flex-col border overflow-hidden`}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          cursor: isDragging ? 'grabbing' : 'default',
          backgroundColor: theme.background,
          borderColor: theme.brightBlack
        }}
      >
        <div
          className="drag-handle px-4 py-2 border-b flex justify-between items-center cursor-grab active:cursor-grabbing"
          style={{
            backgroundColor: theme.black,
            borderColor: theme.brightBlack
          }}
          onMouseDown={handleMouseDown}
        >
          <span className="text-sm font-mono" style={{ color: theme.brightWhite }}>{title}</span>
          <button 
            className="w-6 h-6 flex items-center justify-center rounded-full transition-colors"
            style={{
              color: theme.brightWhite || '#ffffff'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.red || '#ff0000';
              e.currentTarget.style.color = theme.background || '#000000';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = theme.brightWhite || '#ffffff';
            }}
            onClick={onClose}
            onMouseDown={(e) => e.stopPropagation()}
          >
            ×
          </button>
        </div>
        
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
