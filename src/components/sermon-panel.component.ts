
import { Component, inject, signal, ElementRef, ViewChild, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-sermon-panel',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div 
      class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 shadow-[0_-5px_15px_rgba(0,0,0,0.1)] transition-all duration-300 z-30 flex flex-col"
      [class.translate-y-[calc(100%-2.5rem)]]="isCollapsed()"
      [class.translate-y-0]="!isCollapsed()"
      [class.h-64]="!isCollapsed() && !isMaximized()"
      [class.h-[90vh]]="isMaximized()">
      
      <!-- Toggle Handle / Header -->
      <div 
        (click)="toggleCollapse()"
        class="h-10 bg-gray-50 border-b border-gray-200 cursor-pointer flex items-center justify-between px-4 hover:bg-gray-100 transition-colors select-none">
        
        <div class="flex items-center gap-2">
          <span class="material-icons-outlined text-brand-600">edit_note</span>
          <span class="text-sm font-bold text-gray-700">Sermon Builder</span>
        </div>

        <div class="flex items-center gap-2">
           @if (!isCollapsed()) {
             <button 
               (mousedown)="$event.stopPropagation(); toggleMaximize()"
               class="p-1 hover:bg-gray-200 rounded text-gray-500"
               title="Maximize">
               <span class="material-icons-outlined text-sm">
                 {{ isMaximized() ? 'close_fullscreen' : 'open_in_full' }}
               </span>
             </button>
           }
           <span class="material-icons-outlined text-gray-400 text-sm transition-transform duration-300" [class.rotate-180]="!isCollapsed()">expand_less</span>
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 flex flex-col p-4 max-w-7xl mx-auto w-full overflow-hidden">
        
        <!-- Title & Save Row -->
        <div class="flex items-center gap-4 mb-3">
          <input 
            type="text" 
            [(ngModel)]="title"
            class="text-xl font-bold text-gray-800 border-none focus:ring-0 placeholder-gray-400 bg-transparent w-full p-0" 
            placeholder="Sermon Title..." />
          <button (click)="save()" class="text-xs bg-brand-50 text-brand-700 hover:bg-brand-100 px-3 py-1 rounded border border-brand-200 font-medium">
            Save
          </button>
        </div>
        
        <!-- Editor Container -->
        <div class="flex-1 bg-white rounded-lg border border-gray-200 flex flex-col shadow-sm overflow-hidden">
          
          <!-- Visual Toolbar -->
          <div class="bg-gray-50 border-b border-gray-200 p-1 flex items-center gap-1 flex-wrap">
            
            <div class="flex items-center border-r border-gray-300 pr-1 mr-1 gap-0.5">
              <button (mousedown)="$event.preventDefault(); exec('bold')" class="p-1.5 hover:bg-gray-200 rounded text-gray-600" title="Bold">
                <span class="material-icons-outlined text-sm">format_bold</span>
              </button>
              <button (mousedown)="$event.preventDefault(); exec('italic')" class="p-1.5 hover:bg-gray-200 rounded text-gray-600" title="Italic">
                <span class="material-icons-outlined text-sm">format_italic</span>
              </button>
              <button (mousedown)="$event.preventDefault(); exec('underline')" class="p-1.5 hover:bg-gray-200 rounded text-gray-600" title="Underline">
                <span class="material-icons-outlined text-sm">format_underlined</span>
              </button>
            </div>

            <div class="flex items-center border-r border-gray-300 pr-1 mr-1 gap-0.5">
              <button (mousedown)="$event.preventDefault(); exec('formatBlock', 'H1')" class="p-1.5 hover:bg-gray-200 rounded text-gray-600 font-bold text-xs w-8" title="Heading 1">
                H1
              </button>
              <button (mousedown)="$event.preventDefault(); exec('formatBlock', 'H2')" class="p-1.5 hover:bg-gray-200 rounded text-gray-600 font-bold text-xs w-8" title="Heading 2">
                H2
              </button>
            </div>

            <div class="flex items-center gap-0.5">
              <button (mousedown)="$event.preventDefault(); exec('insertUnorderedList')" class="p-1.5 hover:bg-gray-200 rounded text-gray-600" title="Bullet List">
                <span class="material-icons-outlined text-sm">format_list_bulleted</span>
              </button>
              <button (mousedown)="$event.preventDefault(); exec('insertOrderedList')" class="p-1.5 hover:bg-gray-200 rounded text-gray-600" title="Numbered List">
                <span class="material-icons-outlined text-sm">format_list_numbered</span>
              </button>
              <button (mousedown)="$event.preventDefault(); exec('removeFormat')" class="p-1.5 hover:bg-red-50 text-red-400 rounded ml-1" title="Clear Formatting">
                <span class="material-icons-outlined text-sm">format_clear</span>
              </button>
            </div>
            
          </div>

          <!-- WYSIWYG Content Area -->
          <!-- 'wysiwyg-content' class connects to styles in index.html to restore lists/headings -->
          <div 
            #editor
            contenteditable="true"
            class="wysiwyg-content flex-1 w-full p-4 overflow-y-auto outline-none text-gray-800 leading-relaxed"
            (blur)="onContentChange()">
          </div>

        </div>
      </div>
    </div>
  `
})
export class SermonPanelComponent {
  private storage = inject(StorageService);
  
  @ViewChild('editor') editorRef!: ElementRef<HTMLDivElement>;
  
  isCollapsed = signal(true);
  isMaximized = signal(false);
  
  title = signal('');
  
  constructor() {
    const sermon = this.storage.getSermon()();
    this.title.set(sermon.title);
    
    // Defer loading content into div until view is init
    effect(() => {
      setTimeout(() => {
        if (this.editorRef?.nativeElement) {
          this.editorRef.nativeElement.innerHTML = sermon.content;
        }
      }, 100);
    });
  }

  toggleCollapse() {
    if (this.isMaximized()) {
      this.isMaximized.set(false);
      return;
    }
    this.isCollapsed.update(v => !v);
  }

  toggleMaximize() {
    this.isMaximized.update(v => !v);
    if (this.isMaximized()) {
      this.isCollapsed.set(false);
    }
  }

  exec(command: string, value: string | undefined = undefined) {
    document.execCommand(command, false, value);
    // We do NOT need to manually focus here because preventing Default on mousedown
    // keeps the focus on the contenteditable element.
    this.onContentChange(); 
  }

  onContentChange() {
    // Save content to storage if needed, or just let save() handle it
  }

  save() {
    const content = this.editorRef.nativeElement.innerHTML;
    this.storage.saveSermon(this.title(), content);
  }
}