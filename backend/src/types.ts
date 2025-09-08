export type Note = {
  id: number;
  title: string;
  content: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

export type NoteInput = {
  title: string;
  content: string;
};
