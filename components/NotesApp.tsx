'use client';

import { useState, useEffect } from 'react';
import Window from './Window';
import { useTheme } from './ThemeContext';

interface NotesAppProps {
  onClose: () => void;
}

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export default function NotesApp({ onClose }: NotesAppProps) {
  const { theme } = useTheme();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const { terminalListNotes } = await import('@/app/actions');
      const result = await terminalListNotes();
      if (result.success && result.data) {
        setNotes(result.data);
      }
    } catch (error) {
      console.error('Failed to load notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async () => {
    if (!editTitle.trim()) return;

    try {
      const { terminalAddNote } = await import('@/app/actions');
      const result = await terminalAddNote(editTitle, editContent);
      if (result.success) {
        await loadNotes();
        setIsCreating(false);
        setEditTitle('');
        setEditContent('');
      }
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  const handleUpdateNote = async () => {
    if (!selectedNote || !editTitle.trim()) return;

    try {
      const { terminalUpdateNote } = await import('@/app/actions');
      const result = await terminalUpdateNote(selectedNote.id, editTitle, editContent);
      if (result.success) {
        await loadNotes();
        setSelectedNote(null);
        setEditTitle('');
        setEditContent('');
      }
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const { terminalDeleteNote } = await import('@/app/actions');
      const result = await terminalDeleteNote(noteId);
      if (result.success) {
        await loadNotes();
        if (selectedNote?.id === noteId) {
          setSelectedNote(null);
          setEditTitle('');
          setEditContent('');
        }
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setIsCreating(false);
  };

  const handleNewNote = () => {
    setIsCreating(true);
    setSelectedNote(null);
    setEditTitle('');
    setEditContent('');
  };

  const handleCancel = () => {
    setIsCreating(false);
    setSelectedNote(null);
    setEditTitle('');
    setEditContent('');
  };

  return (
    <Window title="~/notes" onClose={onClose}>
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-64 border-r flex flex-col" style={{ backgroundColor: theme.black, borderColor: theme.brightBlack }}>
          <div className="p-3 border-b" style={{ borderColor: theme.brightBlack }}>
            <button
              onClick={handleNewNote}
              className="w-full px-3 py-2 rounded text-sm font-medium transition-opacity"
              style={{ backgroundColor: theme.green, color: theme.background }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              + New Note
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-sm" style={{ color: theme.brightBlack }}>Loading...</div>
            ) : notes.length === 0 ? (
              <div className="p-4 text-center text-sm" style={{ color: theme.brightBlack }}>
                No notes yet
              </div>
            ) : (
              <div>
                {notes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => handleSelectNote(note)}
                    className="p-3 border-b cursor-pointer transition-colors"
                    style={{ 
                      borderColor: theme.brightBlack,
                      backgroundColor: selectedNote?.id === note.id && !isCreating ? theme.brightBlack : 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedNote?.id !== note.id || isCreating) {
                        e.currentTarget.style.backgroundColor = theme.brightBlack || '';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedNote?.id !== note.id || isCreating) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <h3 className="font-medium text-sm truncate mb-1" style={{ color: theme.foreground }}>
                      {note.title}
                    </h3>
                    <p className="text-xs truncate" style={{ color: theme.cyan }}>
                      {note.content || 'Empty note'}
                    </p>
                    <p className="text-xs mt-1" style={{ color: theme.yellow, opacity: 0.7 }}>
                      {new Date(note.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {isCreating || selectedNote ? (
            <>
              {/* Editor Header */}
              <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: theme.brightBlack }}>
                <input
                  type="text"
                  placeholder="Note title..."
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="flex-1 text-lg font-medium border-none outline-none bg-transparent"
                  style={{ color: theme.foreground }}
                  autoFocus
                />
                <div className="flex gap-2 ml-4">
                  {!isCreating && (
                    <button
                      onClick={handleCancel}
                      className="px-3 py-1.5 text-sm rounded transition-opacity"
                      style={{ backgroundColor: theme.brightBlack, color: theme.foreground }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                    >
                      Cancel
                    </button>
                  )}
                  {selectedNote && (
                    <button
                      onClick={() => handleDeleteNote(selectedNote.id)}
                      className="px-3 py-1.5 text-sm rounded transition-opacity"
                      style={{ backgroundColor: theme.red, color: theme.foreground }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                    >
                      Delete
                    </button>
                  )}
                  <button
                    onClick={isCreating ? handleCreateNote : handleUpdateNote}
                    className="px-3 py-1.5 text-sm rounded transition-opacity"
                    style={{ backgroundColor: theme.green, color: theme.background }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    {isCreating ? 'Create' : 'Save'}
                  </button>
                </div>
              </div>

              {/* Editor Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                <textarea
                  placeholder="Start typing..."
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full h-full border-none outline-none resize-none font-mono leading-relaxed text-base bg-transparent"
                  style={{ 
                    minHeight: '100%',
                    color: theme.foreground
                  }}
                />
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="flex-1 flex items-center justify-center" style={{ color: theme.brightBlack }}>
              <div className="text-center">
                <p className="text-lg">Select a note or create a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Window>
  );
}
