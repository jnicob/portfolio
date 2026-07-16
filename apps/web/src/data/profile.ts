import { profileSchema } from './schemas';

export const profile = profileSchema.parse({
  name: 'Nico Behm',
  headline: {
    es: 'Ingeniero full-stack — plataformas de API de IA end-to-end',
    en: 'Full-stack engineer — end-to-end AI API platforms',
  },
  summary: {
    es: 'Ingeniero en Informática con más de 10 años desarrollando aplicaciones web full-stack. Desde 2022 construye la plataforma pública de APIs de Freepik/Magnific — generación de IA, stock y estado de tareas — de la especificación OpenAPI al gateway, la documentación, el Playground web y el panel de desarrollador, con más de 1.000 PRs entre GitHub y Bitbucket.',
    en: 'Computer engineer with 10+ years building full-stack web applications. Since 2022 he has been building the Freepik/Magnific public API platform — AI generation, stock and task-status APIs — from the OpenAPI spec to the gateway, documentation, web Playground and developer dashboard, with 1,000+ PRs across GitHub and Bitbucket.',
  },
  location: { es: 'España', en: 'Spain' },
  links: {
    github: 'https://github.com/jnicob',
    linkedin: 'https://www.linkedin.com/in/nicobehm',
  },
});
