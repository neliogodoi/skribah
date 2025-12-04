
import { Component, input, output, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-verse-drawer',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="h-full flex flex-col bg-white shadow-xl border-l border-gray-200 w-80 sm:w-96 transition-transform">
      <!-- Header -->
      <div class="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <div>
           <h2 class="font-bold text-gray-800 flex items-center gap-2">
             <span class="material-icons-outlined text-brand-600">edit_note</span>
             My Notes
           </h2>
           <p class="text-xs text-gray-500">Ref: {{ verseRef() }}</p>
        </div>
        <button (click)="close.emit()" class="text-gray-400 hover:text-gray-700 transition-colors">
          <span class="material-icons-outlined">close</span>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 p-4 bg-gray-50/50 flex flex-col overflow-hidden">
        
        <div class="flex-1 flex flex-col">
          <label class="block text-xs font-semibold text-gray-500 uppercase mb-2">Private Exegesis</label>
          <div class="relative flex-1">
            <textarea 
              [(ngModel)]="noteContent"
              class="absolute inset-0 w-full h-full p-4 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none text-sm leading-relaxed shadow-sm"
              placeholder="Write your personal study notes for this verse here..."></textarea>
          </div>
          
          <div class="mt-3 flex justify-between items-center">
             <span class="text-xs text-gray-400 italic">Saved locally</span>
             <button 
              (click)="saveNote()"
              class="bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold py-2 px-6 rounded-lg shadow flex items-center gap-2 transition-all active:scale-95">
               <span class="material-icons-outlined text-sm">save</span> Save
             </button>
          </div>
        </div>

      </div>
    </div>
  `
})
export class VerseDrawerComponent {
  verseId = input.required<string>();
  verseRef = input.required<string>();
  close = output<void>();

  private storage = inject(StorageService);

  // Note State
  noteContent = signal('');

  constructor() {
    // React to verse ID changes to load data
    effect(() => {
      const id = this.verseId();
      if (id) {
        // Load Note
        const note = this.storage.getNoteForVerse(id)();
        this.noteContent.set(note);
      }
    });
  }

  saveNote() {
    this.storage.saveNote(this.verseId(), this.noteContent());
  }
}
