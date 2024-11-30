import React, { useState, useEffect } from 'react';
import { Alert, PermissionsAndroid, SafeAreaView, View, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

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
  
  const exportPDF = async () => {
    if (!note) return;
  
    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #000000; text-align:center; }
            p { font-size: 16px; line-height: 1.5; }
          </style>
        </head>
        <body>
          <h1>${note.title}</h1>
          ${note.content}
        </body>
      </html>
    `;
  
    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });

      // MB file size check
      const fileInfo = await FileSystem.getInfoAsync(uri);

      if (fileInfo.exists) {
        const fileSizeInBytes = fileInfo.size;  // Size in bytes
        const fileSizeInMB = Number((fileSizeInBytes / (1024 * 1024)).toFixed(2)); // Size in MB
        console.log(`File Size: ${fileSizeInMB} MB`);

        if (fileSizeInMB > 50)
        {
          alert("PDF size exceeds 50 MB.");
          return;
        }

        // Save the file (prompt)
        await Sharing.shareAsync(uri);

      } else {
        console.error('File not found!');
        return;
      }

      //alert('Note exported to PDF successfully.'); //${uri}
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'Failed to export PDF. Please try again.');
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

                {note && (
                  <TouchableOpacity style={styles.exportButton} onPress={exportPDF}>
                    <ThemedText style={styles.exportButtonText}>PDF</ThemedText>
                  </TouchableOpacity>
                )}

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
  exportButton: {
    backgroundColor: '#C4C4C4',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CreateEditNote;
