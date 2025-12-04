
import { Component, inject, signal } from '@angular/core';
import { StorageService } from '../services/storage.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-auth-gate',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div class="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <div class="text-center mb-8">
          <span class="material-icons-outlined text-6xl text-brand-600 mb-2">menu_book</span>
          <h1 class="text-3xl font-bold text-gray-800">Skribah</h1>
          <p class="text-gray-500 mt-2">Professional Bible Study Tool</p>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Enter your name to start</label>
            <input 
              type="text" 
              [(ngModel)]="username" 
              (keyup.enter)="handleLogin()"
              class="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition placeholder-gray-400"
              placeholder="e.g. John Doe"
            />
          </div>

          <button 
            (click)="handleLogin()"
            [disabled]="!username()"
            class="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
            <span>Enter Studio</span>
            <span class="material-icons-outlined text-sm">arrow_forward</span>
          </button>
        </div>
        
        <p class="mt-6 text-xs text-center text-gray-400">
          Powered by Angular & Firebase Mock
        </p>
      </div>
    </div>
  `
})
export class AuthGateComponent {
  private storage = inject(StorageService);
  username = signal('');

  handleLogin() {
    if (this.username().trim()) {
      this.storage.login(this.username().trim());
    }
  }
}