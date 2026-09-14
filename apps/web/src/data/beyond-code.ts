import { beyondCodeSchema, type BeyondCode } from './schemas';

export const beyondCode: BeyondCode = beyondCodeSchema.parse({
  title: {
    es: 'Más allá del código',
    en: 'Beyond Code',
  },
  subtitle: {
    es: 'Familia, raíces, aficiones y la forma en que entiendo el trabajo colaborativo.',
    en: 'Family, roots, hobbies, and my perspective on collaborative teamwork.',
  },
  location: {
    es: 'Vivo en Aguadulce (Almería, España) junto a mi familia, combinando la tranquilidad del Mediterráneo y la cercanía de la montaña con proyectos de impacto global.',
    en: 'Based in Aguadulce (Almería, Spain) with my family, enjoying Mediterranean living and coastal mountains while building software for global products.',
  },
  origin: {
    es: 'Nací en Argentina y cuento con nacionalidad española, lo que me brinda una perspectiva multicultural natural.',
    en: 'Born in Argentina with Spanish citizenship, offering a natural multicultural mindset.',
  },
  interestsTitle: {
    es: 'Deporte & Exploración',
    en: 'Sports & Exploration',
  },
  interests: [
    {
      es: 'Fútbol y Pádel: pasión por el deporte en equipo, la estrategia y el juego dinámico.',
      en: 'Football & Padel: passion for team spirit, strategy, and dynamic matches.',
    },
    {
      es: 'Ciclismo: desconectar pedaleando por rutas costeras y senderos de montaña.',
      en: 'Cycling: clearing the mind on coastal trails and mountain routes.',
    },
    {
      es: 'Viajar y descubrir playas: fascinación por explorar nuevos rincones y culturas.',
      en: 'Traveling & discovering beaches: eager to explore new coastlines and cultures.',
    },
  ],
  makerTitle: {
    es: 'Curiosidad Maker & IoT',
    en: 'Maker & IoT Curiosity',
  },
  makerDescription: {
    es: 'Fascinado por la domótica y el prototipado de hardware con Arduino y Raspberry Pi. Me encanta conectar software con el mundo real, automatizar rutinas y explorar sensores.',
    en: 'Enthusiastic about home automation and embedded prototyping with Arduino and Raspberry Pi. I love bridging software with physical hardware, automating routines, and tinkering with sensors.',
  },
  philosophyTitle: {
    es: 'Filosofía de Trabajo',
    en: 'Work Philosophy',
  },
  philosophyDescription: {
    es: 'Defensor convencido del trabajo asíncrono, la documentación clara como fuente única de verdad y la comunicación transparente. He colaborado de manera fluida y cercana con equipos multiculturales y remotos en España, EE. UU. y Latinoamérica.',
    en: 'Firm advocate of asynchronous communication, crisp documentation as the single source of truth, and transparent collaboration. Experienced in working closely with distributed multicultural teams across Spain, the US, and Latin America.',
  },
  images: [
    {
      src: '/profile/gallery/ski.webp',
      alt: {
        es: 'Nico Behm esquiando en las montañas nevadas de Sierra Nevada',
        en: 'Nico Behm skiing in the snowy mountains of Sierra Nevada',
      },
      caption: {
        es: 'Sierra Nevada (Granada) — esquí, deporte y alta montaña',
        en: 'Sierra Nevada (Granada) — skiing, winter sports & alpine peaks',
      },
    },
    {
      src: '/profile/gallery/beach.webp',
      alt: {
        es: 'Acantilados y costa mediterránea en Nerja, Málaga',
        en: 'Cliffs and Mediterranean coastline in Nerja, Málaga',
      },
      caption: {
        es: 'Nerja (Málaga) — mar Mediterráneo y calas vírgenes',
        en: 'Nerja (Málaga) — Mediterranean sea & coastal cliffs',
      },
    },
    {
      src: '/profile/gallery/mountain.webp',
      alt: {
        es: 'Nico Behm disfrutando de una ruta de senderismo en la montaña',
        en: 'Nico Behm enjoying a hiking route in the mountains',
      },
      caption: {
        es: 'Senderismo de montaña — aire puro y perspectiva',
        en: 'Mountain hiking — fresh air & panoramic views',
      },
    },
    {
      src: '/profile/gallery/london.webp',
      alt: {
        es: 'Nico Behm junto al Tower Bridge en Londres',
        en: 'Nico Behm by Tower Bridge in London',
      },
      caption: {
        es: 'Londres (Tower Bridge) — viajes y descubrimiento cultural',
        en: 'London (Tower Bridge) — travel & cultural exploration',
      },
    },
    {
      src: '/profile/gallery/madrid.webp',
      alt: {
        es: 'Nico Behm en la Puerta del Sol en Madrid',
        en: 'Nico Behm at Puerta del Sol in Madrid',
      },
      caption: {
        es: 'Madrid (Puerta del Sol) — escapadas urbanas',
        en: 'Madrid (Puerta del Sol) — city breaks & culture',
      },
    },
    {
      src: '/profile/gallery/travel.webp',
      alt: {
        es: 'Nico Behm en el aeropuerto preparándose para viajar',
        en: 'Nico Behm at the airport boarding a flight',
      },
      caption: {
        es: 'En ruta — explorando nuevos horizontes y culturas',
        en: 'On the move — exploring new horizons & cultures',
      },
    },
  ],
});
