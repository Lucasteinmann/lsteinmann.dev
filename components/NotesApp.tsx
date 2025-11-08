'use client';

import { useState, useEffect } from 'react';
import Window from './Window';

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
        <div className="w-64 bg-[#161b22] border-r border-gray-700 flex flex-col">
          <div className="p-3 border-b border-gray-700">
            <button
              onClick={handleNewNote}
              className="w-full bg-[#238636] hover:bg-[#2ea043] text-white px-3 py-2 rounded text-sm font-medium transition-colors"
            >
              + New Note
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500 text-sm">Loading...</div>
            ) : notes.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                No notes yet
              </div>
            ) : (
              <div>
                {notes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => handleSelectNote(note)}
                    className={`p-3 border-b border-gray-800 cursor-pointer hover:bg-[#1c2128] transition-colors ${
                      selectedNote?.id === note.id && !isCreating ? 'bg-[#1c2128]' : ''
                    }`}
                  >
                    <h3 className="text-white font-medium text-sm truncate mb-1">
                      {note.title}
                    </h3>
                    <p className="text-gray-400 text-xs truncate">
                      {note.content || 'Empty note'}
                    </p>
                    <p className="text-gray-600 text-xs mt-1">
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
              <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <input
                  type="text"
                  placeholder="Untitled"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="text-2xl font-bold bg-transparent text-white border-none outline-none flex-1"
                  autoFocus={isCreating}
                />
                <div className="flex gap-2 ml-4">
                  {selectedNote && (
                    <button
                      onClick={() => handleDeleteNote(selectedNote.id)}
                      className="px-3 py-1.5 bg-[#da3633] hover:bg-[#f85149] text-white text-sm rounded transition-colors"
                    >
                      Delete
                    </button>
                  )}
                  <button
                    onClick={handleCancel}
                    className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={isCreating ? handleCreateNote : handleUpdateNote}
                    className="px-3 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-white text-sm rounded transition-colors"
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
                  className="w-full h-full bg-transparent text-white text-base border-none outline-none resize-none font-mono leading-relaxed"
                  style={{ minHeight: '100%' }}
                />
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-4">→</div>
                <p className="text-lg">Select a note or create a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Window>
  );
}
