
export interface Note {
  id: string; // Unique identifier for the note
  title: string; // Title of the note
  content: string; // Content of the note
  createdAt: Date; // Timestamp for when the note was created
  updatedAt: Date; // Timestamp for when the note was last updated
  reminderDate?: Date; // Timestamp for when the note need to be reminded
}
