
import { Component, input, output, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common'; // Fallback for some pipes if needed, though mostly using control flow
import { FormsModule } from '@angular/forms';
import { StorageService, Comment } from '../services/storage.service';

@Component({
  selector: 'app-verse-drawer',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="h-full flex flex-col bg-white shadow-xl border-l border-gray-200 w-80 sm:w-96 transition-transform">
      <!-- Header -->
      <div class="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <div>
           <h2 class="font-bold text-gray-800">Verse Tools</h2>
           <p class="text-xs text-gray-500">Selected: {{ verseRef() }}</p>
        </div>
        <button (click)="close.emit()" class="text-gray-400 hover:text-gray-700">
          <span class="material-icons-outlined">close</span>
        </button>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-gray-200">
        <button 
          (click)="activeTab.set('notes')"
          [class.border-brand-500]="activeTab() === 'notes'"
          [class.text-brand-600]="activeTab() === 'notes'"
          class="flex-1 py-3 text-sm font-medium text-center border-b-2 border-transparent hover:text-gray-700 transition-colors">
          My Notes
        </button>
        <button 
          (click)="activeTab.set('comments')"
          [class.border-brand-500]="activeTab() === 'comments'"
          [class.text-brand-600]="activeTab() === 'comments'"
          class="flex-1 py-3 text-sm font-medium text-center border-b-2 border-transparent hover:text-gray-700 transition-colors">
          Community
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-4 bg-gray-50/50">
        
        <!-- NOTES TAB -->
        @if (activeTab() === 'notes') {
          <div class="h-full flex flex-col">
            <label class="block text-xs font-semibold text-gray-500 uppercase mb-2">Private Exegesis</label>
            <textarea 
              [(ngModel)]="noteContent"
              class="flex-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none text-sm leading-relaxed"
              placeholder="Write your personal study notes for this verse here..."></textarea>
            <div class="mt-3 flex justify-end">
               <button 
                (click)="saveNote()"
                class="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold py-2 px-4 rounded flex items-center gap-1">
                 <span class="material-icons-outlined text-xs">save</span> Save Note
               </button>
            </div>
          </div>
        }

        <!-- COMMENTS TAB -->
        @if (activeTab() === 'comments') {
          <div class="flex flex-col h-full">
            <div class="flex-1 space-y-4 mb-4 overflow-y-auto">
              @for (comment of comments(); track comment.id) {
                <div class="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                  <div class="flex items-center justify-between mb-2">
                    <span class="font-bold text-xs text-brand-700">{{ comment.author }}</span>
                    <div class="flex items-center gap-1">
                      @if (comment.visibility === 'private') {
                        <span class="material-icons-outlined text-xs text-gray-400">lock</span>
                      }
                      <span class="text-[10px] text-gray-400">{{ formatTime(comment.timestamp) }}</span>
                    </div>
                  </div>
                  <p class="text-sm text-gray-700">{{ comment.content }}</p>
                </div>
              }
              @if (comments().length === 0) {
                <div class="text-center py-8 text-gray-400">
                  <span class="material-icons-outlined text-4xl mb-2">chat_bubble_outline</span>
                  <p class="text-sm">No comments yet.</p>
                </div>
              }
            </div>

            <!-- New Comment Input -->
            <div class="bg-white p-3 rounded-lg border border-gray-200 shadow-sm mt-auto">
              <textarea 
                [(ngModel)]="newCommentText"
                rows="2"
                class="w-full p-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-brand-400" 
                placeholder="Share a thought..."></textarea>
              <div class="flex items-center justify-between mt-2">
                <label class="flex items-center cursor-pointer">
                   <input type="checkbox" [(ngModel)]="isPublic" class="sr-only peer">
                   <div class="relative w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-600"></div>
                   <span class="ms-2 text-xs font-medium text-gray-600">{{ isPublic() ? 'Public' : 'Private' }}</span>
                </label>
                <button 
                  [disabled]="!newCommentText()"
                  (click)="postComment()"
                  class="text-brand-600 hover:bg-brand-50 p-1 rounded disabled:opacity-50">
                  <span class="material-icons-outlined">send</span>
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class VerseDrawerComponent {
  verseId = input.required<string>();
  verseRef = input.required<string>();
  close = output<void>();

  private storage = inject(StorageService);

  activeTab = signal<'notes' | 'comments'>('notes');
  
  // Note State
  noteContent = signal('');
  
  // Comment State
  comments = signal<Comment[]>([]);
  newCommentText = signal('');
  isPublic = signal(false);

  constructor() {
    // React to verse ID changes to load data
    effect(() => {
      const id = this.verseId();
      if (id) {
        // Load Note
        const note = this.storage.getNoteForVerse(id)();
        this.noteContent.set(note);

        // Load Comments
        const comms = this.storage.getCommentsForVerse(id)();
        this.comments.set(comms);
      }
    });
  }

  saveNote() {
    this.storage.saveNote(this.verseId(), this.noteContent());
  }

  postComment() {
    if (!this.newCommentText().trim()) return;
    this.storage.addComment(this.verseId(), this.newCommentText(), this.isPublic());
    this.newCommentText.set('');
    // Refresh local comments list
    this.comments.set(this.storage.getCommentsForVerse(this.verseId())());
  }

  formatTime(ts: number) {
    return new Date(ts).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  }
}
