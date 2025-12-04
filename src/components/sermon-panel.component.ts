
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-sermon-panel',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div 
      class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 shadow-[0_-5px_15px_rgba(0,0,0,0.1)] transition-transform duration-300 z-30"
      [class.translate-y-full]="isCollapsed()"
      [class.translate-y-0]="!isCollapsed()">
      
      <!-- Toggle Handle -->
      <div 
        (click)="toggle()"
        class="absolute -top-10 left-1/2 -translate-x-1/2 bg-white border border-b-0 border-gray-300 rounded-t-lg px-4 py-2 cursor-pointer flex items-center gap-2 shadow-[0_-2px_5px_rgba(0,0,0,0.05)]">
        <span class="material-icons-outlined text-brand-600 text-sm">edit_note</span>
        <span class="text-xs font-bold text-gray-700">Sermon Builder</span>
        <span class="material-icons-outlined text-gray-400 text-sm transition-transform duration-300" [class.rotate-180]="!isCollapsed()">expand_less</span>
      </div>

      <!-- Content -->
      <div class="h-64 flex flex-col p-4 max-w-7xl mx-auto">
        <div class="flex items-center gap-4 mb-3">
          <input 
            type="text" 
            [(ngModel)]="title"
            class="text-lg font-bold text-gray-800 border-none focus:ring-0 placeholder-gray-400 bg-transparent w-full" 
            placeholder="Sermon Title..." />
          <button (click)="save()" class="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded">Save</button>
        </div>
        
        <div class="flex-1 bg-gray-50 rounded-lg border border-gray-200 p-2 relative">
          <textarea 
            [(ngModel)]="content"
            class="w-full h-full bg-transparent border-none resize-none focus:ring-0 text-sm font-mono text-gray-600 leading-relaxed" 
            placeholder="Start outlining your sermon structure (JSON or Text)..."></textarea>
            
          <div class="absolute bottom-2 right-2 flex gap-1">
             <span class="text-[10px] text-gray-400 bg-white px-2 py-1 rounded border border-gray-200">Draft saved</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SermonPanelComponent {
  private storage = inject(StorageService);
  
  isCollapsed = signal(true);
  title = signal('');
  content = signal('');

  constructor() {
    const sermon = this.storage.getSermon()();
    this.title.set(sermon.title);
    this.content.set(sermon.content);
  }

  toggle() {
    this.isCollapsed.update(v => !v);
  }

  save() {
    this.storage.saveSermon(this.title(), this.content());
  }
}
