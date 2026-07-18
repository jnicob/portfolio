import { profileSchema } from './schemas';

export const profile = profileSchema.parse({
  name: 'Nico Behm',
  headline: {
    es: 'Ingeniero full-stack — plataformas de API de IA end-to-end',
    en: 'Full-stack engineer — end-to-end AI API platforms',
  },
  summary: {
    es: 'Ingeniero en Informática con más de 12 años construyendo software full-stack en tres mundos distintos: salud (historia clínica electrónica e interoperabilidad HL7), producto internacional para clientes de EE. UU. y plataformas públicas de APIs de IA a gran escala. Perfil de punta a punta: del spec y el backend al frontend, la documentación y el producto, con más de 1.000 PRs en los últimos cuatro años. Cómodo liderando proyectos, mentorizando y trabajando con equipos distribuidos.',
    en: 'Computer engineer with 12+ years building full-stack software across three different worlds: healthcare (EHR and HL7 interoperability), international product work for US clients, and large-scale public AI API platforms. End-to-end profile: from spec and backend to frontend, documentation and product, with 1,000+ PRs over the last four years. Comfortable leading projects, mentoring and working with distributed teams.',
  },
  location: { es: 'España', en: 'Spain' },
  links: {
    github: 'https://github.com/jnicob',
    linkedin: 'https://www.linkedin.com/in/nicobehm',
  },
});
