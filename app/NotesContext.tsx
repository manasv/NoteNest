import React, { createContext, useContext, useState, useEffect } from 'react';
import { Note } from '@/models/Note';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NotesContextType {
  notes: Note[];
  addNote: (note: Note) => void;
  deleteNote: (id: string) => void;
  updateNote: (note: Note) => void;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    const loadNotes = async () => {
      try {
        const storedNotes = await AsyncStorage.getItem('notes');
        if (storedNotes) {
          setNotes(JSON.parse(storedNotes));
        }
      } catch (error) {
        console.error('Failed to load notes:', error);
      }
    };

    loadNotes();
  }, []);

  const saveNotes = async (notesToSave: Note[]) => {
    try {
      await AsyncStorage.setItem('notes', JSON.stringify(notesToSave));
    } catch (error) {
      console.error('Failed to save notes:', error);
    }
  };

  const addNote = (note: Note) => {
    setNotes((prevNotes) => {
      const updatedNotes = [...prevNotes, note];
      saveNotes(updatedNotes);
      return updatedNotes;
    });
  };

  const deleteNote = (id: string) => {
    setNotes((prevNotes) => {
      const updatedNotes = prevNotes.filter(note => note.id !== id);
      saveNotes(updatedNotes);
      return updatedNotes;
    });
  };

  const updateNote = (updatedNote: Note) => {
    setNotes((prevNotes) => {
      const updatedNotes = prevNotes.map(note => (note.id === updatedNote.id ? updatedNote : note));
      saveNotes(updatedNotes);
      return updatedNotes;
    });
  };

  return (
    <NotesContext.Provider value={{ notes, addNote, deleteNote, updateNote }}>
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error("useNotes must be used within a NotesProvider");
  }
  return context;
};