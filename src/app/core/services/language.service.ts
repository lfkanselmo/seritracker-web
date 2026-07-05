import { Injectable, inject, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

export type Lang = 'es' | 'en';
const STORAGE_KEY = 'lang';
export const AVAILABLE_LANGS: Lang[] = ['es', 'en'];

export function resolveInitialLang(): Lang {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'es' || stored === 'en') return stored;
  return navigator.language.toLowerCase().startsWith('en') ? 'en' : 'es';
}

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private transloco = inject(TranslocoService);

  readonly lang = signal<Lang>(this.transloco.getActiveLang() as Lang);

  toggle(): void {
    this.setLang(this.lang() === 'es' ? 'en' : 'es');
  }

  setLang(lang: Lang): void {
    this.lang.set(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    this.transloco.setActiveLang(lang);
  }
}
