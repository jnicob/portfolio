import { profileSchema } from './schemas';

export const profile = profileSchema.parse({
  name: 'Nico Behm',
  headline: {
    es: 'Ingeniero full-stack — plataformas de API de IA end-to-end',
    en: 'Full-stack engineer — end-to-end AI API platforms',
  },
  summary: {
    es: 'Ingeniero en Informática con más de 10 años desarrollando aplicaciones web full-stack. Desde 2022 construye la plataforma pública de APIs de IA de Freepik/Magnific: especificación OpenAPI, servidor FastAPI, gateway y documentación de generación de imagen y vídeo, con 779 PRs en el ecosistema de la plataforma.',
    en: 'Computer engineer with 10+ years building full-stack web applications. Since 2022 he has been building the Freepik/Magnific public AI API platform: OpenAPI specification, FastAPI server, gateway and documentation for image and video generation, with 779 PRs across the platform ecosystem.',
  },
  location: { es: 'España', en: 'Spain' },
  links: {
    github: 'https://github.com/jnicob',
    linkedin: 'https://www.linkedin.com/in/nicobehm',
  },
});
