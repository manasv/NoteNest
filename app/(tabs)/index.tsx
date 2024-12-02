import React, { useState } from 'react';
import { SafeAreaView, FlatList, TouchableOpacity, StyleSheet, Modal, View } from 'react-native';
import { Note } from '@/models/Note';
import { useNotes } from '@/app/NotesContext';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { ThemedText } from '@/components/ThemedText';
import CreateEditNote from '@/app/create-edit-note';

const NotesScreen = () => {
  const { notes, deleteNote } = useNotes();
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);

  const renderItem = ({ item }: { item: Note }) => (
    <Swipeable
      renderRightActions={() => (
        <TouchableOpacity onPress={() => deleteNote(item.id)} style={styles.deleteButton}>
          <ThemedText style={styles.deleteText}>Delete</ThemedText>
        </TouchableOpacity>
      )}
    >
      <TouchableOpacity style={styles.card} onPress={() => openNote(item)}>
        <ThemedText style={styles.title}>{item.title}</ThemedText>
      </TouchableOpacity>
    </Swipeable>
  );

  const openNote = (note: Note) => {
    setEditingNote(note);
    setModalVisible(true);
  };

  const closeModal = () => {
    setEditingNote(null);
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {notes.length === 0 ? (
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyText}>No notes available. Create a new note!</ThemedText>
        </View>
      ) : (
        <FlatList
          data={notes}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      )}
      <Modal visible={isModalVisible} animationType="slide">
        <CreateEditNote note={editingNote} onClose={closeModal} />
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9', // Light background for a minimalist look
  },
  card: {
    backgroundColor: '#fff',
    padding: 16, // Increased padding for a more spacious feel
    marginVertical: 8,
    height: 60, // Set a fixed height to match the swipeable height
    justifyContent: 'center', // Center the text vertically
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333', // Darker text for better readability
  },
  deleteButton: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
  deleteText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#888', // Gray color for the empty state text
    textAlign: 'center',
  },
});

export default NotesScreen;
