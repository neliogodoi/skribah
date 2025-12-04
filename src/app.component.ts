
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthGateComponent } from './components/auth-gate.component';
import { PassageSelectorComponent } from './components/passage-selector.component';
import { VerseGridComponent } from './components/verse-grid.component';
import { VerseDrawerComponent } from './components/verse-drawer.component';
import { SermonPanelComponent } from './components/sermon-panel.component';
import { StorageService } from './services/storage.service';
import { BibleService, VerseData } from './services/bible.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    AuthGateComponent, 
    PassageSelectorComponent, 
    VerseGridComponent, 
    VerseDrawerComponent,
    SermonPanelComponent
  ],
  templateUrl: './app.component.html'
})
export class AppComponent {
  authService = inject(StorageService);
  bibleService = inject(BibleService);

  isDrawerOpen = signal(false);
  selectedVerse = signal<VerseData | null>(null);
  selectedLanguage = signal('pt');

  loadData(event: {book: string, chapter: number}) {
    this.bibleService.loadPassage(event.book, event.chapter);
  }

  updateLanguage(lang: string) {
    this.selectedLanguage.set(lang);
  }

  logout() {
    this.authService.logout();
  }

  openDrawer(verse: VerseData) {
    this.selectedVerse.set(verse);
    this.isDrawerOpen.set(true);
  }

  closeDrawer() {
    this.isDrawerOpen.set(false);
  }
}
