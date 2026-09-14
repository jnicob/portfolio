import { languageEntrySchema, type LanguageEntry } from './schemas';

const entries = [
  {
    id: 'es',
    language: {
      es: 'Español',
      en: 'Spanish',
    },
    level: {
      es: 'Nativo',
      en: 'Native',
    },
  },
  {
    id: 'en',
    language: {
      es: 'Inglés',
      en: 'English',
    },
    level: {
      es: 'B2 Upper Intermediate',
      en: 'B2 Upper Intermediate',
    },
  },
];

export const languages: LanguageEntry[] = entries.map((e) => languageEntrySchema.parse(e));
