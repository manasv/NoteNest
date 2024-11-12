import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Note } from '../models/Note';
import { useNotes } from '@/app/NotesContext';
import { ThemedText } from '@/components/ThemedText';
import uuid from 'react-native-uuid';

interface CreateEditNoteProps {
  note?: Note | null; // Allow note to be null
  onClose: () => void; // Function to close the modal or navigate back
}

const CreateEditNote: React.FC<CreateEditNoteProps> = ({ note, onClose }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const { addNote, updateNote } = useNotes();

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    }
  }, [note]);

  const handleSave = () => {
    if (title.trim() && content.trim()) {
      if (note) {
        // Update existing note
        const updatedNote: Note = {
          ...note,
          title,
          content,
          updatedAt: new Date(),
        };
        updateNote(updatedNote);
      } else {
        // Create new note
        const newNote: Note = {
          id: uuid.v4().toString(),
          title,
          content,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        addNote(newNote);
      }
      onClose();
    } else {
      alert('Please fill out both the title and content.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <View style={styles.innerContainer}>
              <ThemedText style={styles.header}>{note ? 'Edit Note' : 'New Note'}</ThemedText>

              <TextInput
                style={styles.titleInput}
                placeholder="Title"
                value={title}
                onChangeText={setTitle}
              />

              <TextInput
                style={styles.contentInput}
                placeholder="Write your note here..."
                value={content}
                onChangeText={setContent}
                multiline
              />

              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                  <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <ThemedText style={styles.saveButtonText}>{note ? 'Update Note' : 'Create Note'}</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  titleInput: {
    fontSize: 18,
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#f0f0f0',
  },
  contentInput: {
    flex: 1,
    fontSize: 16,
    padding: 10,
    borderRadius: 8,
    textAlignVertical: 'top',
    marginBottom: 15,
    backgroundColor: '#f0f0f0',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CreateEditNote;
