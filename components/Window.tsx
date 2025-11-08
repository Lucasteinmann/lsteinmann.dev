'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';

interface WindowProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
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
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      setPosition({
        x: position.x + deltaX,
        y: position.y + deltaY
      });
      
      setDragStart({ x: e.clientX, y: e.clientY });
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
  }, [isDragging, dragStart, position]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        ref={windowRef}
        className={`bg-[#0d1117] rounded-lg shadow-2xl w-full ${width} ${height} flex flex-col border border-gray-700 overflow-hidden`}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          cursor: isDragging ? 'grabbing' : 'default'
        }}
      >
        {/* Header - matching terminal style */}
        <div 
          className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex justify-between items-center cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
        >
          <span className="text-gray-400 text-sm font-mono">{title}</span>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-red-500 w-6 h-6 flex items-center justify-center rounded-full transition-colors"
            onMouseDown={(e) => e.stopPropagation()}
          >
            ×
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-[#0d1117] overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
