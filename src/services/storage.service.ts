
import { Injectable, signal, computed } from '@angular/core';

export interface User {
  uid: string;
  displayName: string;
}

export interface Note {
  verseId: string;
  content: string;
  updatedAt: number;
}

export interface Comment {
  id: string;
  verseId: string;
  author: string;
  content: string;
  visibility: 'private' | 'public';
  timestamp: number;
}

export interface Sermon {
  id: string;
  title: string;
  content: string; // Simple text or JSON
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  // Auth State
  currentUser = signal<User | null>(this.loadUser());

  // Data Stores (Simulating Firestore)
  private notesMap = signal<Record<string, Note>>(this.loadData('user_notes') || {});
  private commentsMap = signal<Record<string, Comment[]>>(this.loadData('verse_comments') || {});
  private sermonData = signal<Sermon>(this.loadData('current_sermon') || { id: '1', title: 'New Sermon', content: '' });

  constructor() {}

  // --- Auth Methods ---
  private loadUser(): User | null {
    const stored = localStorage.getItem('app_user');
    return stored ? JSON.parse(stored) : null;
  }

  login(name: string) {
    const user = { uid: 'user_' + Date.now(), displayName: name };
    localStorage.setItem('app_user', JSON.stringify(user));
    this.currentUser.set(user);
  }

  logout() {
    localStorage.removeItem('app_user');
    this.currentUser.set(null);
  }

  // --- Notes Methods ---
  getNoteForVerse(verseId: string) {
    return computed(() => this.notesMap()[verseId]?.content || '');
  }

  saveNote(verseId: string, content: string) {
    const current = this.notesMap();
    const updated = {
      ...current,
      [verseId]: { verseId, content, updatedAt: Date.now() }
    };
    this.notesMap.set(updated);
    this.saveData('user_notes', updated);
  }

  // --- Comments Methods ---
  getCommentsForVerse(verseId: string) {
    return computed(() => this.commentsMap()[verseId] || []);
  }

  addComment(verseId: string, content: string, isPublic: boolean) {
    const user = this.currentUser();
    if (!user) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      verseId,
      author: user.displayName,
      content,
      visibility: isPublic ? 'public' : 'private',
      timestamp: Date.now()
    };

    const currentMap = this.commentsMap();
    const existing = currentMap[verseId] || [];
    const updated = {
      ...currentMap,
      [verseId]: [newComment, ...existing] // Newest first
    };
    
    this.commentsMap.set(updated);
    this.saveData('verse_comments', updated);
  }

  // --- Sermon Methods ---
  getSermon() {
    return this.sermonData;
  }

  saveSermon(title: string, content: string) {
    const sermon: Sermon = { id: '1', title, content };
    this.sermonData.set(sermon);
    this.saveData('current_sermon', sermon);
  }

  // --- Helpers ---
  private saveData(key: string, data: any) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  private loadData(key: string): any {
    const d = localStorage.getItem(key);
    return d ? JSON.parse(d) : null;
  }
}
