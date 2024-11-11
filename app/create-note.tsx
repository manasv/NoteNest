import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Note } from '../models/Note';

const CreateNote = ({
  onSave,
  onCancel,
}: {
  onSave: (note: Note) => void;
  onCancel: () => void;
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSave = () => {
    if (title.trim() && content.trim()) {
      const newNote: Note = {
        id: Date.now().toString(), // Generate a unique ID
        title,
        content,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      onSave(newNote); // Pass the new note to the onSave function
      onCancel(); // Close the modal after saving
    } else {
      alert('Please fill out both the title and content.');
    }
  };

  const handleCancel = () => {
    onCancel(); // Simply close the modal
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} // iOS-specific behavior for avoiding keyboard
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <View style={styles.innerContainer}>
              <Text style={styles.header}>New Note</Text>

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
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <Text style={styles.saveButtonText}>Save</Text>
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
    justifyContent: 'space-between', // Ensures space between inputs and buttons
    padding: 20,
  },
  scrollViewContent: {
    flexGrow: 1, // Allow scroll view to expand
    justifyContent: 'space-between', // Ensure buttons stay at the bottom
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  titleInput: {
    fontSize: 18,
    padding: 10,
    borderRadius: 8, // Removed borderColor and borderWidth
    marginBottom: 15,
    backgroundColor: '#f0f0f0', // Added a subtle background color for clarity
  },
  contentInput: {
    flex: 1,
    fontSize: 16,
    padding: 10,
    borderRadius: 8, // Removed borderColor and borderWidth
    textAlignVertical: 'top',
    marginBottom: 15,
    backgroundColor: '#f0f0f0', // Same background for consistency
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: Platform.OS === 'ios' ? 20 : 0, // Space for iOS keyboard avoidance
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

export default CreateNote;
