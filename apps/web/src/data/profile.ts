import { profileSchema } from './schemas';

export const profile = profileSchema.parse({
  name: 'Nico Behm',
  headline: {
    es: 'Ingeniero full-stack — plataformas de API de IA end-to-end',
    en: 'Full-stack engineer — end-to-end AI API platforms',
  },
  summary: {
    es: 'Ingeniero en Informática con más de 15 años construyendo software full-stack en entornos muy distintos: salud (historia clínica electrónica e interoperabilidad HL7), producto internacional para clientes de EE. UU., sistemas de gestión internos, webs de alta demanda y plataformas públicas de APIs de IA, incluido el desarrollo de sistemas con agentes de IA. Perfil de punta a punta: del spec y el backend al frontend, la documentación y el ciclo completo del producto, con más de 1.000 PRs en los últimos cuatro años. Cómodo en equipos multidisciplinarios y distribuidos.',
    en: 'Computer engineer with 15+ years building full-stack software across very different environments: healthcare (EHR and HL7 interoperability), international product work for US clients, internal management systems, high-traffic web platforms and public AI API platforms — including building systems with AI agents. End-to-end profile: from spec and backend to frontend, documentation and the full product cycle, with 1,000+ PRs over the last four years. Comfortable in multidisciplinary, distributed teams.',
  },
  location: { es: 'España', en: 'Spain' },
  links: {
    github: 'https://github.com/jnicob',
    linkedin: 'https://www.linkedin.com/in/nicobehm',
  },
});
