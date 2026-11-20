import { ImageResponse } from 'next/og';

export const alt = 'Strix QR — Production-Grade Vector QR Code & 2D Matrix Engine';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#09090b',
          fontFamily: 'sans-serif',
          backgroundImage:
            'radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.05) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(56, 189, 248, 0.08) 2%, transparent 0%)',
          backgroundSize: '100px 100px',
        }}
      >
        {/* Glow orb */}
        <div
          style={{
            position: 'absolute',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />

        {/* Brand Card */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px 64px',
            borderRadius: '32px',
            backgroundColor: 'rgba(18, 19, 26, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          }}
        >
          {/* Logo Lockup */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
            <span
              style={{
                fontSize: '64px',
                fontWeight: 900,
                color: '#ffffff',
                letterSpacing: '-1px',
              }}
            >
              STRIX
            </span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px 20px',
                borderRadius: '12px',
                border: '2px solid #38bdf8',
                backgroundColor: 'rgba(56, 189, 248, 0.12)',
              }}
            >
              <span
                style={{
                  fontSize: '44px',
                  fontWeight: 900,
                  color: '#38bdf8',
                  letterSpacing: '2px',
                }}
              >
                QR
              </span>
            </div>
          </div>

          <h2
            style={{
              fontSize: '28px',
              fontWeight: 700,
              color: '#ffffff',
              margin: '0 0 12px 0',
              textAlign: 'center',
            }}
          >
            Production-Grade Vector QR Code & 2D Matrix Engine
          </h2>

          <p
            style={{
              fontSize: '18px',
              color: '#a1a1aa',
              margin: '0 0 32px 0',
              textAlign: 'center',
              maxWidth: '750px',
            }}
          >
            Zero Tracking • 100% In-Browser Optical Verification • Permanent Direct Static & Dynamic Links
          </p>

          {/* Badges */}
          <div style={{ display: 'flex', gap: '16px' }}>
            <div
              style={{
                padding: '8px 18px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                color: '#38bdf8',
                fontSize: '15px',
                fontWeight: 600,
              }}
            >
              SVG & PDF Vector Exports
            </div>
            <div
              style={{
                padding: '8px 18px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#34d399',
                fontSize: '15px',
                fontWeight: 600,
              }}
            >
              Level H Error Correction
            </div>
            <div
              style={{
                padding: '8px 18px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#e4e4e7',
                fontSize: '15px',
                fontWeight: 600,
              }}
            >
              Hardware-Accelerated Scanner
            </div>
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: '24px',
            color: '#71717a',
            fontSize: '14px',
          }}
        >
          qr.strixdevs.com • Open Platform by StrixDevs
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
