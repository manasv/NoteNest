import React from 'react';
import { SafeAreaView, View, Text, FlatList } from 'react-native';
import { Note } from '../../models/Note';

import { useNotes } from '@/app/NotesContext'; // Import the useNotes hook

const NotesScreen = () => {
  const { notes, addNote } = useNotes(); // Access notes and addNote

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
    </SafeAreaView>
  );
};

export default NotesScreen;
