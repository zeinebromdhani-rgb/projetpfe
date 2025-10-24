import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService, Theme } from './services/theme.service';
import { LanguageService, Language } from './services/language.service';
import { TranslatePipe } from './pipes/translate.pipe';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, TranslatePipe],
  templateUrl: './app.component.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected title = 'mon-site';
  currentTheme: Theme = 'light';
  currentLanguage: Language = 'fr';
  availableLanguages: { code: Language; name: string }[] = [];

  constructor(
    private themeService: ThemeService,
    private languageService: LanguageService
  ) {}

  ngOnInit() {
    // Subscribe to theme changes
    this.themeService.currentTheme$.subscribe(theme => {
      this.currentTheme = theme;
    });

    // Subscribe to language changes
    this.languageService.currentLanguage$.subscribe(language => {
      this.currentLanguage = language;
    });

    // Get available languages
    this.availableLanguages = this.languageService.getAvailableLanguages();
  }

  toggleTheme() {
    console.log('🎨 Theme toggle clicked - BEFORE');
    console.log('Current theme before:', this.currentTheme);
    this.themeService.toggleTheme();
    console.log('🎨 Theme toggle executed');
    console.log('New theme from service:', this.themeService.getCurrentTheme());
    console.log('Current theme in component:', this.currentTheme);
    console.log('Body classes:', document.body.className);
  }

  setLanguage(language: Language) {
    this.languageService.setLanguage(language);
  }

  getThemeIcon(): string {
    return this.currentTheme === 'light' ? '🌙' : '☀️';
  }
}
