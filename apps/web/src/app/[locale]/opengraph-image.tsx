import { ImageResponse } from 'next/og';
import { profile } from '@/data/profile';
import { routing, type Locale } from '@/i18n/routing';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Nico Behm';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = { params: Promise<{ locale: string }> };

export default async function OpengraphImage({ params }: Props) {
  const { locale } = (await params) as { locale: Locale };

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: 24,
        padding: 80,
        backgroundColor: '#0a0a0f',
        color: '#f5f5f7',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ fontSize: 64, fontWeight: 700, display: 'flex' }}>{profile.name}</div>
      <div style={{ fontSize: 32, color: '#a1a1aa', display: 'flex' }}>
        {profile.headline[locale]}
      </div>
    </div>,
    { ...size },
  );
}
