import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import { Note } from '../models/Note';
import { useNotes } from '@/app/NotesContext';
import { ThemedText } from '@/components/ThemedText';
import uuid from 'react-native-uuid';
import { RichEditor, RichToolbar } from 'react-native-pell-rich-editor';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import * as Calendar from 'expo-calendar';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface CreateEditNoteProps {
  note?: Note | null;
  onClose: () => void;
}

const CreateEditNote: React.FC<CreateEditNoteProps> = ({ note, onClose }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [reminderDate, setReminderDate] = useState<Date | undefined>(note?.reminderDate);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(note?.startDate);
  const [endDate, setEndDate] = useState<Date | undefined>(note?.endDate);
  const { addNote, updateNote } = useNotes();

  const editorRef = useRef<RichEditor>(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setReminderDate(note.reminderDate);
      setStartDate(note.startDate);
      setEndDate(note.endDate);
    }
  }, [note]);

  const handleSave = async () => {
    if (title.trim() && content.trim()) {
      const newNote: Note = {
        id: note ? note.id : uuid.v4().toString(),
        title,
        content,
        createdAt: note ? note.createdAt : new Date(),
        updatedAt: new Date(),
        reminderDate,
        startDate,
        endDate,
      };

      if (note) {
        updateNote(newNote);
      } else {
        addNote(newNote);
      }

      if (reminderDate) {
        await scheduleNotification(reminderDate, newNote.id, newNote.title);
      }

      if (startDate && endDate) {
        await addEventToCalendar(newNote.title, startDate, endDate);
      }

      onClose();
    } else {
      alert('Please fill out both the title and content.');
    }
  };

  const scheduleNotification = async (date: Date, noteId: string, title: string) => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      const { status: newStatus } = await Notifications.requestPermissionsAsync();
      if (newStatus !== 'granted') {
        alert('Permission for notifications is required.');
        return;
      }
    }

    const trigger = new Date(date);
    trigger.setSeconds(0);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Reminder for: ${title}`,
        body: `You set a reminder for this note.`,
        data: { noteId },
      },
      trigger,
    });
  };

  const addEventToCalendar = async (eventTitle: string, start: Date, end: Date) => {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access the calendar is required.');
      return;
    }

    const defaultCalendarSource = {
      isLocalAccount: true,
      name: 'Default',
    };

    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const defaultCalendar = calendars.find((cal) => cal.source.name === defaultCalendarSource.name);

    const calendarId = defaultCalendar?.id || calendars[0]?.id;

    if (!calendarId) {
      Alert.alert('Error', 'Unable to find a suitable calendar to add the event.');
      return;
    }

    try {
      await Calendar.createEventAsync(calendarId, {
        title: eventTitle,
        startDate: start,
        endDate: end,
        alarms: [{ relativeOffset: -10 }], // Notify 10 minutes before the event
      });
      Alert.alert('Event Created', 'The event has been added to your calendar.');
    } catch (error) {
      console.error('Error creating event:', error);
      Alert.alert('Error', 'There was an error creating the calendar event.');
    }
  };

  const handleDeleteReminder = () => {
    setReminderDate(undefined);
    setShowDatePicker(false);
  };

  const handleConfirmReminder = () => {
    if (reminderDate && reminderDate < new Date()) {
      alert('Please select a future date for the reminder.');
      return;
    }
    setShowDatePicker(false);
  };

  const handleCancelCalendar = () => {
    setShowCalendarModal(false);
  };

  const handleSetCalendar = () => {
    if (startDate && endDate && (startDate < new Date() || endDate < new Date())) {
      alert('Please select a future date.');
      return;
    }
    setShowCalendarModal(false);
  };

  const reminderExists = reminderDate && reminderDate > new Date();

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
                onChange={(value) => setContent(value)} // Handle content change
              />
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>

        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.reminderButton}>
          <MaterialCommunityIcons name="alarm" size={30} color={reminderExists ? "#FF3B30" : "#007AFF"} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setShowCalendarModal(true)} style={styles.calendarButton}>
          <MaterialCommunityIcons name="calendar" size={30} color="#007AFF" />
        </TouchableOpacity>

        <Modal visible={showDatePicker} animationType="fade" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <DateTimePicker
                value={reminderDate || new Date()}
                mode="datetime"
                display="default"
                onChange={(event, selectedDate) => {
                  const date = selectedDate || reminderDate;
                  if (date && date >= new Date()) {
                    setReminderDate(date);
                  } else {
                    alert('Please select a future date.');
                  }
                }}
              />
              <View style={styles.modalButtons}>
                {reminderExists ? (
                  <TouchableOpacity onPress={handleDeleteReminder} style={styles.deleteButton}>
                    <ThemedText style={styles.buttonText}>Delete Reminder</ThemedText>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={() => setShowDatePicker(false)} style={styles.cancelButton}>
                    <ThemedText style={styles.buttonText}>Cancel</ThemedText>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={handleConfirmReminder} style={styles.confirmButton}>
                  <ThemedText style={styles.buttonText}>{reminderExists ? 'Confirm' : 'Set Reminder'}</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal visible={showCalendarModal} animationType="fade" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ThemedText style={styles.titleInput}>Set Start and End Date</ThemedText>

              <DateTimePicker
                value={startDate || new Date()}
                mode="datetime"
                display="default"
                onChange={(event, selectedDate) => setStartDate(selectedDate || startDate)}
              />
              <DateTimePicker
                value={endDate || new Date()}
                mode="datetime"
                display="default"
                onChange={(event, selectedDate) => setEndDate(selectedDate || endDate)}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity onPress={handleCancelCalendar} style={styles.cancelButton}>
                  <ThemedText style={styles.buttonText}>Cancel</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSetCalendar} style={styles.confirmButton}>
                  <ThemedText style={styles.buttonText}>Confirm</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

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
  reminderButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#F0F0F0',
    padding: 10,
    borderRadius: 50,
  },
  calendarButton: {
    position: 'absolute',
    top: 16,
    right: 80,
    backgroundColor: '#F0F0F0',
    padding: 10,
    borderRadius: 50,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  confirmButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
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
});

export default CreateEditNote;
