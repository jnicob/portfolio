import type { SVGProps } from 'react';
import { cn } from '@/lib/cn';

export const TECH_KEYS = [
  'typescript',
  'javascript',
  'react',
  'nextjs',
  'vue',
  'tailwind',
  'nodejs',
  'python',
  'fastapi',
  'php',
  'laravel',
  'postgresql',
  'mysql',
  'redis',
  'docker',
  'git',
] as const;

export type TechKey = (typeof TECH_KEYS)[number];

type TechMeta = {
  name: string;
  category: 'frontend' | 'backend' | 'database' | 'devops';
  color: string;
};

export const TECH_INFO: Record<TechKey, TechMeta> = {
  typescript: { name: 'TypeScript', category: 'frontend', color: '#3178c6' },
  javascript: { name: 'JavaScript', category: 'frontend', color: '#f7df1e' },
  react: { name: 'React', category: 'frontend', color: '#61dafb' },
  nextjs: { name: 'Next.js', category: 'frontend', color: 'currentColor' },
  vue: { name: 'Vue.js', category: 'frontend', color: '#42b883' },
  tailwind: { name: 'Tailwind CSS', category: 'frontend', color: '#38bdf8' },
  nodejs: { name: 'Node.js', category: 'backend', color: '#5fa04e' },
  python: { name: 'Python', category: 'backend', color: '#3776ab' },
  fastapi: { name: 'FastAPI', category: 'backend', color: '#009688' },
  php: { name: 'PHP', category: 'backend', color: '#777bb4' },
  laravel: { name: 'Laravel', category: 'backend', color: '#ff2d20' },
  postgresql: { name: 'PostgreSQL', category: 'database', color: '#336791' },
  mysql: { name: 'MySQL', category: 'database', color: '#00758f' },
  redis: { name: 'Redis', category: 'database', color: '#dc382d' },
  docker: { name: 'Docker', category: 'devops', color: '#2496ed' },
  git: { name: 'Git', category: 'devops', color: '#f05032' },
};

type TechIconProps = SVGProps<SVGSVGElement> & {
  name: TechKey;
  size?: number;
};

export function TechIcon({
  name,
  size = 20,
  className,
  'aria-hidden': ariaHidden,
  ...props
}: TechIconProps) {
  const meta = TECH_INFO[name];
  const title = meta?.name ?? name;

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden={ariaHidden}
      role={ariaHidden ? 'presentation' : 'img'}
      className={cn('shrink-0 transition-transform duration-200', className)}
      {...props}
    >
      {!ariaHidden && <title>{title}</title>}

      {name === 'typescript' && (
        <>
          <rect width="24" height="24" rx="3.5" fill="#3178c6" />
          <path
            fill="#ffffff"
            d="M11.75 15.6H9.25V9.9H6.45V7.4h7.4v2.5h-2.1v5.7zm6.7-.4c-.5.4-1.2.6-2 .6-1.1 0-1.9-.3-2.5-.9-.6-.6-.9-1.4-.9-2.5 0-1.1.3-1.9.9-2.5.6-.6 1.4-.9 2.5-.9.8 0 1.5.2 2 .5v2.4c-.6-.4-1.2-.6-1.8-.6-.6 0-1 .2-1.3.5-.3.3-.4.8-.4 1.5 0 .6.1 1.1.4 1.4.3.3.7.5 1.3.5.7 0 1.3-.2 1.8-.6v2.5z"
          />
        </>
      )}

      {name === 'javascript' && (
        <>
          <rect width="24" height="24" rx="3.5" fill="#f7df1e" />
          <path
            fill="#000000"
            d="M6.7 18.5c.8.5 1.7.8 2.7.8 2.5 0 3.7-1.3 3.7-3.4V7.5H10.5v8.4c0 1.1-.6 1.6-1.7 1.6-.6 0-1.1-.2-1.5-.5l-.6 1.5zm8.5-.2c.9.6 2 .9 3.2.9 2.4 0 3.8-1.2 3.8-3.1 0-1.8-1.1-2.6-2.9-3.4-1.2-.5-1.7-.8-1.7-1.5 0-.6.5-1.1 1.4-1.1.8 0 1.6.3 2.1.7l.7-1.6c-.6-.5-1.6-.8-2.7-.8-2.3 0-3.7 1.3-3.7 3 0 1.7 1.1 2.6 2.8 3.3 1.2.5 1.8.9 1.8 1.6 0 .7-.6 1.2-1.6 1.2-.9 0-1.8-.4-2.4-.9l-.8 1.7z"
          />
        </>
      )}

      {name === 'react' && (
        <g transform="translate(12 12)">
          <circle cx="0" cy="0" r="2.05" fill="#61dafb" />
          <g stroke="#61dafb" strokeWidth="1" fill="none">
            <ellipse rx="10" ry="3.8" />
            <ellipse rx="10" ry="3.8" transform="rotate(60)" />
            <ellipse rx="10" ry="3.8" transform="rotate(120)" />
          </g>
        </g>
      )}

      {name === 'nextjs' && (
        <>
          <circle
            cx="12"
            cy="12"
            r="11"
            fill="currentColor"
            fillOpacity="0.12"
            stroke="currentColor"
            strokeWidth="1"
          />
          <path fill="currentColor" d="M16.5 17.2l-5.6-7.8V17H9V7.1h2l5.5 7.8V7.1h1.9v10.1h-1.9z" />
        </>
      )}

      {name === 'vue' && (
        <>
          <path fill="#42b883" d="M2 3h3.5L12 14.2 18.5 3H22L12 21 2 3z" />
          <path fill="#35495e" d="M6.2 3h3.3L12 7.7 14.5 3h3.3L12 13 6.2 3z" />
        </>
      )}

      {name === 'tailwind' && (
        <path
          fill="#38bdf8"
          d="M12 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.9.2 1.6.9 2.3 1.6C13.7 10.6 15 12 18 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.9-.2-1.6-.9-2.3-1.6C16.3 6.2 15 4.8 12 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.9.2 1.6.9 2.3 1.6 1.2 1.2 2.5 2.6 5.5 2.6 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.9-.2-1.6-.9-2.3-1.6-1.2-1.2-2.5-2.6-5.5-2.6z"
        />
      )}

      {name === 'nodejs' && (
        <path
          fill="#5fa04e"
          d="M12 1l10.4 6v12L12 25 1.6 19V7L12 1zm-.9 19.3c-3.1 0-5.1-1.5-5.1-4.2v-.4h2.5v.4c0 1.5 1.1 2.2 2.6 2.2 1.4 0 2.3-.7 2.3-1.8 0-1-.7-1.5-2.7-2-2.8-.7-4.4-1.6-4.4-3.9 0-2.4 1.9-4 4.7-4 2.9 0 4.7 1.5 4.7 3.8v.3h-2.4v-.3c0-1.3-.9-1.9-2.3-1.9-1.4 0-2.2.7-2.2 1.7 0 .9.7 1.4 2.5 1.8 3 .7 4.6 1.7 4.6 4 0 2.6-1.9 4.1-4.9 4.1z"
        />
      )}

      {name === 'python' && (
        <>
          <path
            fill="#3776ab"
            d="M11.9 0c-3.1 0-5 1.4-5 3.5v2.6h5.1v.8H4.2C1.9 6.9 0 8.8 0 11.2c0 2.4 1.9 4.2 4.2 4.2h1.7v-2.5c0-1.8 1.5-3.3 3.3-3.3h5.1c1.5 0 2.6-1.2 2.6-2.6V3.5C16.9 1.4 15 0 11.9 0zm-2.1 1.8c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1z"
          />
          <path
            fill="#ffd438"
            d="M12.1 24c3.1 0 5-1.4 5-3.5v-2.6H12v-.8h7.8c2.3 0 4.2-1.9 4.2-4.2 0-2.4-1.9-4.2-4.2-4.2h-1.7v2.5c0 1.8-1.5 3.3-3.3 3.3H9.7c-1.5 0-2.6 1.2-2.6 2.6v3.5c0 2.1 1.9 3.5 5 3.5zm2.1-1.8c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z"
          />
        </>
      )}

      {name === 'fastapi' && (
        <>
          <circle cx="12" cy="12" r="12" fill="#009688" />
          <path fill="#ffffff" d="M13.3 4.5l-5.6 8.2h4.5l-2.4 6.8 7.9-9.5h-4.8l2.4-5.5h-2z" />
        </>
      )}

      {name === 'php' && (
        <path
          fill="#777bb4"
          d="M12 3C5.37 3 0 7 0 12s5.37 9 12 9 12-4 12-9-5.37-9-12-9zm-5.6 12.8h-1.6l1.3-6.6h2.8c1.3 0 2.1.7 1.8 2.1-.3 1.5-1.5 2.5-2.7 2.5h-1.2l-.4 2zm6.2 0h-1.6l1.3-6.6h1.6l-.6 2.5h1.9l.6-2.5h1.6l-1.3 6.6h-1.6l.6-2.5h-1.9l-.6 2.5zm6.2 0h-1.6l1.3-6.6h2.8c1.3 0 2.1.7 1.8 2.1-.3 1.5-1.5 2.5-2.7 2.5h-1.2l-.4 2z"
        />
      )}

      {name === 'laravel' && (
        <path
          fill="#ff2d20"
          d="M23.6 7.4L13.8 1.8c-.5-.3-1.1-.3-1.6 0L2.4 7.4c-.5.3-.8.8-.8 1.4v11.4c0 .6.3 1.1.8 1.4l9.8 5.6c.5.3 1.1.3 1.6 0l9.8-5.6c.5-.3.8-.8.8-1.4V8.8c0-.6-.3-1.1-.8-1.4zm-1.8 11.2l-8.8 5v-9.5l8.8-5v9.5zm-9.8-11.2l8.4-4.8-8.4-4.8-8.4 4.8 8.4 4.8zm-1 16.2l-8.8-5V9.1l8.8 5v9.5z"
        />
      )}

      {name === 'postgresql' && (
        <path
          fill="#336791"
          d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.1 17.6c-1.4 1.3-3.2 2-5.1 2-2.6 0-5-1.3-6.4-3.5-.3-.5-.1-1.2.4-1.5.5-.3 1.2-.1 1.5.4 1.1 1.6 2.8 2.6 4.6 2.6 1.4 0 2.7-.5 3.7-1.4 1-1 1.6-2.3 1.6-3.7v-.5c-.8.5-1.8.8-2.8.8-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5v7.2c0 1-.4 1.9-1.1 2.6zM14.6 9.4c0-1.7-1.3-3-3-3s-3 1.3-3 3 1.3 3 3 3 3-1.3 3-3z"
        />
      )}

      {name === 'mysql' && (
        <path
          fill="#00758f"
          d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm6.8 15.6c-.6 1.4-2.1 2.4-3.7 2.4-1.2 0-2.3-.5-3.1-1.4l1.4-1.4c.5.5 1.1.8 1.7.8 1.1 0 1.9-.7 2.2-1.7H13v-2h6.5c.1.4.1.9.1 1.3 0 .7-.1 1.4-.4 2zm-9-1.2l-1.8-4.8H6.1L4.3 14.4h1.7l.3-1.1h2.2l.4 1.1h1.9zm-2.4-2.4h-1.4l.7-2.1.7 2.1z"
        />
      )}

      {name === 'redis' && (
        <path
          fill="#dc382d"
          d="M1.5 7.8L12 1.5l10.5 6.3L12 14.1 1.5 7.8zm0 5.2l10.5 6.3 10.5-6.3-2.1-1.3L12 16.7 3.6 11.7l-2.1 1.3zm0 4.2l10.5 6.3 10.5-6.3-2.1-1.3L12 20.9 3.6 15.9l-2.1 1.3z"
        />
      )}

      {name === 'docker' && (
        <path
          fill="#2496ed"
          d="M13.9 6.8h2.3v2.3h-2.3V6.8zm-3.1 0h2.3v2.3h-2.3V6.8zm-3.1 0h2.3v2.3H7.7V6.8zm-3.1 0h2.3v2.3H4.6V6.8zm9.3 3.1h2.3v2.3h-2.3V9.9zm-3.1 0h2.3v2.3h-2.3V9.9zm-3.1 0h2.3v2.3H7.7V9.9zm-3.1 0h2.3v2.3H4.6V9.9zm-3.1 0h2.3v2.3H1.5V9.9zm22.4 3.6c-.4-.3-1.5-.7-2.7-.4-.3-.7-.8-1.3-1.4-1.8l-.6-.4-.4.6c-.5 1-1.3 1.7-2.3 2.1H1.5c-.7 3.1 1.4 6.2 4.6 6.8 4.2.8 8.6.6 12.8-.5 2.6-.7 4.6-2.5 5.2-5.1.3-.4.2-.9-.2-1.3z"
        />
      )}

      {name === 'git' && (
        <path
          fill="#f05032"
          d="M23.5 10.9L13.1.5c-.7-.7-1.8-.7-2.4 0L8.3 2.9l3.1 3.1c.7-.2 1.6 0 2.1.6.6.6.7 1.5.4 2.2l3 3c.7-.3 1.6-.2 2.2.4.8.8.8 2.2 0 3-.8.8-2.2.8-3 0-.6-.6-.7-1.5-.4-2.2l-2.8-2.8v5.5c.2.2.3.4.3.7 0 .9-.8 1.7-1.7 1.7s-1.7-.8-1.7-1.7c0-.7.4-1.3 1-1.6V8.6c-.6-.3-1-.9-1-1.6 0-.3.1-.5.2-.7L5.7 3.3.5 8.5c-.7.7-.7 1.8 0 2.4l10.4 10.4c.7.7 1.8.7 2.4 0l10.2-10.4z"
        />
      )}
    </svg>
  );
}

type TechIconStripProps = {
  className?: string;
  label?: string;
};

export function TechIconStrip({
  className,
  label = 'Technologies I work with',
}: TechIconStripProps) {
  return (
    <div className={cn('flex flex-col gap-2.5', className)}>
      <span className="text-xs font-semibold tracking-wider uppercase text-fg-muted">{label}</span>
      <div className="flex flex-wrap items-center gap-2">
        {TECH_KEYS.map((key) => {
          const info = TECH_INFO[key];
          return (
            <div
              key={key}
              title={info.name}
              className="group flex items-center gap-1.5 rounded-full border border-border/70 bg-surface/70 px-2.5 py-1 text-xs font-medium text-fg shadow-2xs backdrop-blur-xs transition-all hover:border-accent hover:bg-surface hover:text-accent focus-visible:outline-2 focus-visible:outline-ring"
            >
              <TechIcon name={key} size={15} aria-hidden="true" />
              <span>{info.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
