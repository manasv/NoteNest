import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard, StyleSheet } from 'react-native';
import { Note } from '../models/Note';
import { useNotes } from '@/app/NotesContext';
import { ThemedText } from '@/components/ThemedText';
import uuid from 'react-native-uuid';
import { RichEditor, RichToolbar } from 'react-native-pell-rich-editor';

interface CreateEditNoteProps {
  note?: Note | null;
  onClose: () => void;
}

const CreateEditNote: React.FC<CreateEditNoteProps> = ({ note, onClose }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const { addNote, updateNote } = useNotes();

  const editorRef = useRef<RichEditor>(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    }
  }, [note]);

  const handleSave = () => {
    if (title.trim() && content.trim()) {
      if (note) {
        const updatedNote: Note = {
          ...note,
          title,
          content,
          updatedAt: new Date(),
        };
        updateNote(updatedNote);
      } else {
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
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.scrollViewContent} keyboardShouldPersistTaps="handled">
            <View style={styles.innerContainer}>
              <ThemedText style={styles.header}>{note ? 'Edit Note' : 'New Note'}</ThemedText>

              <TextInput
                style={styles.titleInput}
                placeholder="Title"
                value={title}
                onChangeText={setTitle}
              />

              <RichEditor
                ref={editorRef}
                style={styles.richEditor}
                placeholder="Write your note here..."
                initialContentHTML={content}
                onChange={(value) => setContent(value)}
              />
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>

        <View style={styles.buttonContainer}>
          <RichToolbar
            editor={editorRef}
            actions={['bold', 'italic', 'unorderedList', 'orderedList']}
            iconTint="#007AFF"
            selectedIconTint="#FF3B30"
            style={styles.toolbar}
          />

          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <ThemedText style={styles.buttonText}>Cancel</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
              <ThemedText style={styles.buttonText}>{note ? 'Update Note' : 'Create Note'}</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    paddingTop: 32,
    paddingHorizontal: 8,
  },
  titleInput: {
    fontSize: 18,
    marginBottom: 20,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    color: '#000',
    borderRadius: 8,
    borderWidth: 0,
  },
  richEditor: {
    minHeight: 300,
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    color: '#000',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  toolbar: {
    backgroundColor: '#fff',
    paddingVertical: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
  },
});

export default CreateEditNote;
