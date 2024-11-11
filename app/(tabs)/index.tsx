import React, { useState } from 'react';
import { SafeAreaView, View, Text, FlatList } from 'react-native';
import { Note } from '../../models/Note';
import CreateNote from '../create-note';

const NotesScreen = () => {
  const [notes, setNotes] = useState<Note[]>([]); // State to hold notes

  const handleSaveNote = (newNote: Note) => {
    setNotes((prevNotes) => [...prevNotes, newNote]); // Add new note to the list
  };

  return (
    <SafeAreaView>
      <FlatList
        data={notes}
        renderItem={({ item }) => (
          <View>
            <Text>{item.title}</Text>
            <Text>{item.content}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />
      <CreateNote onSave={handleSaveNote} onCancel={() => { /* Close modal logic */ }} />
    </SafeAreaView>
  );
};

export default NotesScreen;
