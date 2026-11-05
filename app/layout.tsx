import './globals.css';
import { Space_Grotesk, Geist } from 'next/font/google';
import Link from 'next/link';
import type { Metadata } from 'next';
import { site, policy } from '../lib/site.mjs';
import { speaking } from '../lib/content';
import Navigation from '../components/navigation';
import { analyticsId, analyticsDemo } from '../lib/analytics.mjs';
import ContentLink from '../components/content-link';
import { themeBootstrap } from '../lib/theme.mjs';
import AnalyticsConsent from '../components/analytics-consent';
const display = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});
const body = Geist({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});
export const metadata: Metadata = {
  metadataBase: new URL(site.origin),
  title: {
    default: 'Adam Turner — Engineering, leadership & ideas',
    template: '%s | Adam Turner',
  },
  description: site.description,
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
    : {}),
  openGraph: {
    type: 'website',
    siteName: site.name,
    locale: 'en_GB',
    images: ['/opengraph-image'],
  },
  twitter: { card: 'summary_large_image' },
  robots: policy().index
    ? { index: true, follow: true }
    : { index: false, follow: false },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  const hasSpeaking = speaking().length > 0;
  const measurementId = analyticsId();
  const demo = analyticsDemo();
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className={`${display.variable} ${body.variable}`}>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <header className="site-header shell">
          <Link className="wordmark" href="/" aria-label="Adam Turner — home">
            Adam Turner<span aria-hidden="true">✳</span>
          </Link>
          <Navigation hasSpeaking={hasSpeaking} />
        </header>
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <footer className="site-footer">
          <div className="shell">
            <div className="footer-top">
              <Link className="wordmark" href="/">
                Adam Turner<span aria-hidden="true">✳</span>
              </Link>
              <p>
                Technology is interesting.
                <br />
                People make it matter.
              </p>
              <nav aria-label="Footer navigation">
                <Link href="/blog">Blog</Link>
                <Link href="/about">About</Link>
                {hasSpeaking && <Link href="/speaking">Speaking</Link>}
                <ContentLink
                  href={site.linkedin}
                  data-analytics-event="linkedin_connect_click"
                  data-placement="footer"
                >
                  LinkedIn ↗
                </ContentLink>
                <a
                  href="/rss.xml"
                  data-analytics-event="rss_click"
                  data-placement="footer"
                >
                  RSS
                </a>
                <Link href="/privacy">Privacy</Link>
              </nav>
            </div>
            {(measurementId || demo) && (
              <AnalyticsConsent measurementId={measurementId} demo={demo} />
            )}
            <div className="footer-bottom">
              <span>© {new Date().getFullYear()} Adam Turner</span>
              <span>Personal views. No employer endorsement.</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
