import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentThemeSubject = new BehaviorSubject<Theme>('light');
  public currentTheme$ = this.currentThemeSubject.asObservable();

  constructor() {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('app-theme') as Theme;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      this.setTheme(savedTheme);
    } else {
      // Detect system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setTheme(prefersDark ? 'dark' : 'light');
    }
  }

  getCurrentTheme(): Theme {
    return this.currentThemeSubject.value;
  }

  setTheme(theme: Theme): void {
    this.currentThemeSubject.next(theme);
    localStorage.setItem('app-theme', theme);
    this.applyTheme(theme);
  }

  toggleTheme(): void {
    const newTheme = this.getCurrentTheme() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  private applyTheme(theme: Theme): void {
    // Remove existing theme classes
    document.body.classList.remove('theme-light', 'theme-dark');

    // Add the appropriate theme class
    document.body.classList.add(`theme-${theme}`);
  }
}