import { educationEntrySchema, type EducationEntry } from './schemas';

const entries = [
  {
    id: 'unmdp-especializacion-tecnologia',
    institution: 'Universidad Nacional de Mar del Plata',
    degree: {
      es: 'Especialista en Gestión de la Tecnología y la Innovación',
      en: 'Specialist in Technology and Innovation Management',
    },
    start: '2012',
    end: '2016',
  },
  {
    id: 'fasta-ingenieria-informatica',
    institution: 'Universidad FASTA',
    degree: {
      es: 'Ingeniero en Informática',
      en: 'Computer Engineer',
    },
    start: '2001',
    end: '2010',
  },
];

export const education: EducationEntry[] = entries.map((e) => educationEntrySchema.parse(e));
