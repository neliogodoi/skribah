
import { Component, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-passage-selector',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="bg-white border-b border-gray-200 px-4 py-3 flex flex-col md:flex-row items-center gap-4 shadow-sm z-20 relative">
      <div class="flex items-center gap-2 text-brand-700 font-bold text-xl mr-4">
        <span class="material-icons-outlined">menu_book</span>
        <span class="hidden md:inline">Exegesis Pro</span>
      </div>

      <div class="flex-1 flex flex-wrap items-center gap-2 w-full md:w-auto">
        <!-- Language Selector -->
        <div class="flex items-center border-r border-gray-200 pr-3 mr-1">
          <span class="material-icons-outlined text-gray-400 text-lg mr-1">language</span>
          <select 
            [(ngModel)]="selectedLang"
            (change)="emitLang()"
            class="form-select bg-transparent border-none text-gray-700 text-sm font-bold focus:ring-0 cursor-pointer py-1 pl-1 pr-6">
            <option value="pt">Português</option>
            <option value="en">English</option>
            <option value="all">All / Todos</option>
          </select>
        </div>

        <!-- Book Selector -->
        <select 
          [(ngModel)]="selectedBook"
          class="form-select bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block p-2.5 max-w-[140px] truncate">
          <optgroup label="Old Testament">
            <option value="GEN">Genesis</option>
            <option value="EXO">Exodus</option>
            <option value="LEV">Leviticus</option>
            <option value="NUM">Numbers</option>
            <option value="DEU">Deuteronomy</option>
            <option value="JOS">Joshua</option>
            <option value="PSA">Psalms</option>
            <option value="PRO">Proverbs</option>
            <option value="ISA">Isaiah</option>
          </optgroup>
          <optgroup label="New Testament">
            <option value="MAT">Matthew</option>
            <option value="MAR">Mark</option>
            <option value="LUK">Luke</option>
            <option value="JHN">John</option>
            <option value="ACT">Acts</option>
            <option value="ROM">Romans</option>
            <option value="1CO">1 Corinthians</option>
            <option value="REV">Revelation</option>
          </optgroup>
        </select>

        <!-- Chapter -->
        <div class="flex items-center">
          <span class="px-2 text-gray-500 text-sm font-medium">Ch</span>
          <input 
            type="number" 
            [(ngModel)]="selectedChapter"
            (keyup.enter)="emitLoad()"
            min="1" 
            max="150" 
            class="w-16 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block p-2.5">
        </div>

        <button 
          (click)="emitLoad()"
          class="ml-auto md:ml-2 text-white bg-brand-600 hover:bg-brand-700 focus:ring-4 focus:ring-brand-300 font-medium rounded-lg text-sm px-5 py-2.5 flex items-center gap-2 transition-colors">
          <span class="material-icons-outlined text-sm">refresh</span>
          Load
        </button>
      </div>

      <div class="hidden md:flex items-center gap-3 border-l pl-4 ml-auto">
         <div class="flex items-center gap-1 text-gray-600 text-xs">
            <span class="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
            API Live
         </div>
         <button (click)="logout.emit()" class="text-gray-400 hover:text-red-500">
           <span class="material-icons-outlined">logout</span>
         </button>
      </div>
    </div>
  `
})
export class PassageSelectorComponent {
  onLoad = output<{book: string, chapter: number}>();
  onLangChange = output<string>();
  logout = output<void>();

  selectedBook = signal('GEN');
  selectedChapter = signal(1);
  selectedLang = signal('pt');

  emitLoad() {
    this.onLoad.emit({
      book: this.selectedBook(),
      chapter: this.selectedChapter()
    });
  }

  emitLang() {
    this.onLangChange.emit(this.selectedLang());
  }
}
