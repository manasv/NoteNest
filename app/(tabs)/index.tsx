import React, { useState } from "react";
import {
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  View,
  Alert,
} from "react-native";
import { Note } from "@/models/Note";
import { useNotes } from "@/app/NotesContext";
import { ThemedText } from "@/components/ThemedText";
import CreateEditNote from "@/app/create-edit-note";
import Icon from 'react-native-vector-icons/Ionicons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const NotesScreen = () => {
  const { notes, deleteNote, exportNote } = useNotes();
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);

  const renderItem = ({ item }: { item: Note }) => (
    <View style={styles.cardContainer}>
      <TouchableOpacity style={styles.card} onPress={() => openNote(item)}>
        <ThemedText style={styles.title}>{item.title}</ThemedText>
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            onPress={() => confirmDelete(item.id)} 
            style={styles.deleteButton}
          >
            <Icon name="trash-bin-outline" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => exportNoteAsPDF(item)} 
            style={styles.exportButton}
          >
            <Icon name="document-text-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );

  const openNote = (note: Note) => {
    setEditingNote(note);
    setModalVisible(true);
  };

  const closeModal = () => {
    setEditingNote(null);
    setModalVisible(false);
  };

  const confirmDelete = (id: string) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this note?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        { text: "OK", onPress: () => deleteNote(id) },
      ]
    );
  };

  const exportNoteAsPDF = async (note: Note) => {
    const html = `
      <html>
        <body>
          <h1>${note.title}</h1>
          <p>${note.content}</p>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('PDF Generated', `PDF saved to: ${uri}`);
      }

      exportNote(note);
    } catch (error) {
      console.error('Export PDF Error:', error);
      Alert.alert('Error', 'Failed to export PDF');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {notes.length === 0 ? (
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyText}>
            No notes available. Create a new note!
          </ThemedText>
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
    backgroundColor: "#f9f9f9",
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    marginHorizontal: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2.5,
    elevation: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  deleteButton: {
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#888",
    textAlign: "center",
  },
  cardContainer: {
    marginVertical: 12,
  },
  exportButton: {
    backgroundColor: "blue",
    justifyContent: "center",
    alignItems: "center",
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});

export default NotesScreen;
