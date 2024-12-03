import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NotesProvider } from '@/app/NotesContext';
import CreateEditNote from '@/app/create-edit-note';
import * as Notifications from 'expo-notifications';
import * as Calendar from 'expo-calendar';

// Mock dependencies
jest.mock('expo-notifications');
jest.mock('expo-calendar');
jest.mock('@react-native-async-storage/async-storage');
jest.mock('react-native-uuid', () => ({ v4: () => 'test-uuid' }));

describe('CreateEditNote', () => {
  // Test 1: Component renders correctly
  it('renders correctly with empty note', () => {
    const { getByPlaceholderText, getByText } = render(
      <NotesProvider>
        <CreateEditNote onClose={() => {}} />
      </NotesProvider>
    );

    expect(getByPlaceholderText('Title')).toBeTruthy();
    expect(getByText('New Note')).toBeTruthy();
  });

  // Test 2: Validates empty fields
  it('shows validation error for empty fields', async () => {
    const { getByText } = render(
      <NotesProvider>
        <CreateEditNote onClose={() => {}} />
      </NotesProvider>
    );

    const saveButton = getByText('Create Note');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Please fill out both the title and content.');
    });
  });

  // Test 3: Sets reminder correctly
  it('sets reminder date correctly', async () => {
    const { getByTestId } = render(
      <NotesProvider>
        <CreateEditNote onClose={() => {}} />
      </NotesProvider>
    );

    const reminderButton = getByTestId('reminder-button');
    fireEvent.press(reminderButton);

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);

    await waitFor(() => {
      expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
    });
  });

  // Test 4: Handles calendar event creation
  it('creates calendar event successfully', async () => {
    const { getByTestId } = render(
      <NotesProvider>
        <CreateEditNote onClose={() => {}} />
      </NotesProvider>
    );

    const calendarButton = getByTestId('calendar-button');
    fireEvent.press(calendarButton);

    await waitFor(() => {
      expect(Calendar.requestCalendarPermissionsAsync).toHaveBeenCalled();
    });
  });

  // Test 5: Updates existing note
  it('updates existing note correctly', () => {
    const mockNote = {
      id: '1',
      title: 'Test Note',
      content: 'Test Content',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const { getByDisplayValue } = render(
      <NotesProvider>
        <CreateEditNote note={mockNote} onClose={() => {}} />
      </NotesProvider>
    );

    expect(getByDisplayValue('Test Note')).toBeTruthy();
  });

  // Test 6: Handles reminder deletion
  it('deletes reminder correctly', async () => {
    const mockNote = {
      id: '1',
      title: 'Test Note',
      content: 'Test Content',
      createdAt: new Date(),
      updatedAt: new Date(),
      reminderDate: new Date(Date.now() + 86400000) // Tomorrow
    };

    const { getByText } = render(
      <NotesProvider>
        <CreateEditNote note={mockNote} onClose={() => {}} />
      </NotesProvider>
    );

    const deleteButton = getByText('Delete Reminder');
    fireEvent.press(deleteButton);

    expect(getByText('Set Reminder')).toBeTruthy();
  });

  // Test 7: Validates future dates for reminders
  it('validates future dates for reminders', async () => {
    const { getByTestId } = render(
      <NotesProvider>
        <CreateEditNote onClose={() => {}} />
      </NotesProvider>
    );

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);

    const reminderButton = getByTestId('reminder-button');
    fireEvent.press(reminderButton);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Please select a future date.');
    });
  });

  // Test 8: Rich editor functionality
  it('handles rich editor content changes', () => {
    const { getByTestId } = render(
      <NotesProvider>
        <CreateEditNote onClose={() => {}} />
      </NotesProvider>
    );

    const richEditor = getByTestId('rich-editor');
    fireEvent(richEditor, 'onChange', '<p>New content</p>');

    expect(richEditor.props.initialContentHTML).toBe('<p>New content</p>');
  });

  // Test 9: Calendar date validation
  it('validates calendar dates', async () => {
    const { getByTestId } = render(
      <NotesProvider>
        <CreateEditNote onClose={() => {}} />
      </NotesProvider>
    );

    const calendarButton = getByTestId('calendar-button');
    fireEvent.press(calendarButton);

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Please select a future date.');
    });
  });

  // Test 10: Handles close action
  it('handles close action correctly', () => {
    const mockOnClose = jest.fn();
    const { getByText } = render(
      <NotesProvider>
        <CreateEditNote onClose={mockOnClose} />
      </NotesProvider>
    );

    const cancelButton = getByText('Cancel');
    fireEvent.press(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
});