
import { Component, input, output, signal, computed, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { VerseData, InterlinearWord } from '../services/bible.service';

@Component({
  selector: 'app-verse-grid',
  standalone: true,
  imports: [FormsModule],
  template: `
    <!-- Main Scroll Container -->
    <div class="h-full overflow-y-auto custom-scrollbar bg-gray-100 p-2 pb-32">
      
      @if (loading()) {
        <!-- LOADING STATE -->
        <div class="flex flex-col items-center justify-center h-64 text-gray-400">
          <span class="material-icons-outlined text-5xl mb-4 animate-spin">sync</span>
          <p>Loading Scriptures...</p>
        </div>
      } 
      @else if (verses().length === 0) {
        <!-- EMPTY / ERROR STATE -->
        <div class="flex flex-col items-center justify-center h-64 text-gray-400 text-center px-4">
          <span class="material-icons-outlined text-5xl mb-4 text-orange-300">warning_amber</span>
          <h3 class="text-lg font-bold text-gray-600">Unable to load verses</h3>
          <p class="max-w-md mt-2">
            The external API (abibliadigital.com.br) may have rate-limited your IP address. 
            This is common for public free APIs.
          </p>
          <p class="text-xs mt-2 text-gray-300">Try waiting a few minutes or changing the book/chapter.</p>
        </div>
      } 
      @else {
        <!-- CONTENT GRID -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-1 min-h-full">

          <!-- COLUMN 1: Dynamic -->
          <div class="bg-white rounded shadow-sm border border-gray-200 flex flex-col">
            <div class="bg-gray-50/95 backdrop-blur px-2 py-2 border-b border-gray-200 sticky top-0 z-10 shadow-sm flex items-center justify-between">
              <select 
                [(ngModel)]="col1Version" 
                class="bg-transparent text-xs font-bold text-gray-700 uppercase tracking-wider border-none focus:ring-0 cursor-pointer hover:text-brand-600 w-full">
                @for (opt of filteredVersions(); track opt.id) {
                  <option [value]="opt.id">{{ opt.label }}</option>
                }
              </select>
            </div>
            <div class="p-3 text-lg leading-loose text-gray-800 font-serif">
              @for (verse of verses(); track verse.id) {
                <span 
                  (click)="handleVerseClick(verse)"
                  [class.bg-yellow-200]="activeVerseNum() === verse.verseNumber"
                  [class.text-brand-900]="activeVerseNum() === verse.verseNumber"
                  class="inline hover:bg-yellow-50 cursor-pointer rounded px-1 transition-colors duration-150 select-text">
                  <sup class="text-[10px] font-sans font-bold text-gray-400 select-none mr-0.5">{{ verse.verseNumber }}</sup>
                  <span>{{ getVerseText(verse, col1Version()) }}</span>
                </span>
                <span> </span> 
              }
            </div>
          </div>

          <!-- COLUMN 2: Dynamic -->
          <div class="bg-white rounded shadow-sm border border-gray-200 flex flex-col">
             <div class="bg-gray-50/95 backdrop-blur px-2 py-2 border-b border-gray-200 sticky top-0 z-10 shadow-sm flex items-center justify-between">
              <select 
                [(ngModel)]="col2Version" 
                class="bg-transparent text-xs font-bold text-gray-700 uppercase tracking-wider border-none focus:ring-0 cursor-pointer hover:text-brand-600 w-full">
                @for (opt of filteredVersions(); track opt.id) {
                  <option [value]="opt.id">{{ opt.label }}</option>
                }
              </select>
            </div>
            <div class="p-3 text-lg leading-loose text-gray-800 font-serif">
              @for (verse of verses(); track verse.id) {
                <span 
                  (click)="handleVerseClick(verse)"
                  [class.bg-yellow-200]="activeVerseNum() === verse.verseNumber"
                  [class.text-brand-900]="activeVerseNum() === verse.verseNumber"
                  class="inline hover:bg-yellow-50 cursor-pointer rounded px-1 transition-colors duration-150 select-text">
                  <sup class="text-[10px] font-sans font-bold text-gray-400 select-none mr-0.5">{{ verse.verseNumber }}</sup>
                  <span>{{ getVerseText(verse, col2Version()) }}</span>
                </span>
                <span> </span>
              }
            </div>
          </div>

          <!-- COLUMN 3: Dynamic -->
          <div class="bg-white rounded shadow-sm border border-gray-200 flex flex-col">
             <div class="bg-gray-50/95 backdrop-blur px-2 py-2 border-b border-gray-200 sticky top-0 z-10 shadow-sm flex items-center justify-between">
              <select 
                [(ngModel)]="col3Version" 
                class="bg-transparent text-xs font-bold text-gray-700 uppercase tracking-wider border-none focus:ring-0 cursor-pointer hover:text-brand-600 w-full">
                @for (opt of filteredVersions(); track opt.id) {
                  <option [value]="opt.id">{{ opt.label }}</option>
                }
              </select>
            </div>
            <div class="p-3 text-lg leading-loose text-gray-700 font-serif italic">
              @for (verse of verses(); track verse.id) {
                <span 
                  (click)="handleVerseClick(verse)"
                  [class.bg-yellow-200]="activeVerseNum() === verse.verseNumber"
                  [class.text-brand-900]="activeVerseNum() === verse.verseNumber"
                  class="inline hover:bg-yellow-50 cursor-pointer rounded px-1 transition-colors duration-150 select-text">
                  <sup class="text-[10px] font-sans font-bold text-gray-400 select-none mr-0.5">{{ verse.verseNumber }}</sup>
                  <span>{{ getVerseText(verse, col3Version()) }}</span>
                </span>
                <span> </span>
              }
            </div>
          </div>

          <!-- COLUMN 4: ORIGINAL (Fixed for this demo) -->
          <div class="bg-amber-50/30 rounded shadow-sm border border-amber-100 flex flex-col">
            <div class="bg-amber-100/90 backdrop-blur px-3 py-3 border-b border-amber-200 sticky top-0 z-10 shadow-sm h-[45px] flex items-center">
              <h3 class="font-bold text-amber-800 text-xs uppercase tracking-wider">Original (Hebrew/Greek)</h3>
            </div>
            <div class="p-3 text-right">
              @for (verse of verses(); track verse.id) {
                <div 
                  (click)="handleVerseClick(verse)"
                  [class.bg-yellow-200]="activeVerseNum() === verse.verseNumber"
                  [class.bg-white]="activeVerseNum() !== verse.verseNumber"
                  class="mb-2 p-2 rounded border border-transparent hover:border-amber-200 transition-colors cursor-pointer">
                  
                  <div class="flex items-center gap-2 mb-2 direction-ltr">
                     <span class="text-[10px] font-bold text-amber-600 bg-amber-100 px-1.5 rounded-full">{{ verse.ref }}</span>
                  </div>
                  
                  @if (getOriginal(verse).length > 0) {
                    <div class="flex flex-wrap gap-1.5 justify-end">
                      @for (word of getOriginal(verse); track $index) {
                        <div class="group relative flex flex-col items-center p-0.5 rounded hover:bg-amber-100/50">
                          <span class="text-xl hebrew-text text-gray-900 leading-normal">{{ word.original }}</span>
                          <span class="text-[9px] text-gray-500 font-mono hidden group-hover:block">{{ word.transliteration }}</span>
                          <span class="text-[9px] text-brand-600 font-bold hidden group-hover:block bg-brand-50 px-1 rounded">{{ word.gloss }}</span>
                        </div>
                      }
                    </div>
                  } @else {
                     <p class="text-xs text-gray-400 italic text-center py-1 direction-ltr">Interlinear data unavailable</p>
                  }
                </div>
              }
            </div>
          </div>

        </div>
      }
    </div>
  `
})
export class VerseGridComponent {
  verses = input.required<VerseData[]>();
  loading = input<boolean>(false); // Added loading input
  language = input<string>('pt'); 
  onOpenDrawer = output<VerseData>();

  activeVerseNum = signal<number | null>(null);

  // Column States
  col1Version = signal('nvi');
  col2Version = signal('acf');
  col3Version = signal('kja');

  allVersions = [
    // Portuguese
    { id: 'nvi', label: 'PT - Nova Versão Intl (NVI)', lang: 'pt' },
    { id: 'acf', label: 'PT - Almeida Corrigida (ACF)', lang: 'pt' },
    { id: 'ra',  label: 'PT - Almeida R. Atualizada (ARA)', lang: 'pt' },
    { id: 'kja', label: 'PT - King James Atualizada (KJA)', lang: 'pt' },
    
    // English
    { id: 'kjv', label: 'EN - King James (KJV)', lang: 'en' },
    { id: 'bbe', label: 'EN - Basic English (BBE)', lang: 'en' },
  ];

  filteredVersions = computed(() => {
    const lang = this.language();
    if (lang === 'all') return this.allVersions;
    return this.allVersions.filter(v => v.lang === lang);
  });

  constructor() {
    // Automatically switch columns when language changes
    effect(() => {
      const lang = this.language();
      if (lang === 'pt') {
        this.col1Version.set('nvi');
        this.col2Version.set('acf');
        this.col3Version.set('ra');
      } else if (lang === 'en') {
        this.col1Version.set('kjv');
        this.col2Version.set('bbe');
        this.col3Version.set('kjv');
      } else {
        // Mixed mode defaults
        this.col1Version.set('nvi');
        this.col2Version.set('kjv');
        this.col3Version.set('acf');
      }
    });
  }

  handleVerseClick(verse: VerseData) {
    this.activeVerseNum.set(verse.verseNumber);
    this.onOpenDrawer.emit(verse);
  }

  getVerseText(verse: VerseData, versionKey: string): string {
    const val = verse.versions[versionKey];
    return typeof val === 'string' ? val : '';
  }

  getOriginal(verse: VerseData): InterlinearWord[] {
    const val = verse.versions['original'];
    return Array.isArray(val) ? val : [];
  }
}
