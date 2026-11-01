import { ImageResponse } from 'next/og';
export function socialImage(
  title: string,
  label = 'ENGINEERING / LEADERSHIP / IDEAS',
) {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#4255F4',
        color: '#FAFAF7',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '64px 72px',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', fontSize: 22, letterSpacing: 3 }}>
        {label}
      </div>
      <div
        style={{
          display: 'flex',
          fontSize: title.length > 90 ? 48 : 60,
          lineHeight: 1.12,
          maxWidth: 980,
          fontWeight: 700,
        }}
      >
        {title}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 28,
        }}
      >
        <span>Adam Turner</span>
        <span style={{ color: '#FF735C' }}>↗</span>
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
