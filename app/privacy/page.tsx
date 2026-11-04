import ContentLink from '../../components/content-link';
import Link from 'next/link';
import { site } from '../../lib/site.mjs';
export const metadata = {
  title: 'Privacy & cookies',
  description:
    'How optional analytics and article sharing work on Adam Turner’s personal website.',
  alternates: { canonical: '/privacy' },
};
export default function Privacy() {
  return (
    <article className="reading-shell privacy-page">
      <p className="eyebrow">Privacy &amp; cookies</p>
      <h1>
        Your reading.
        <br />
        <span className="text-blue">Your choice.</span>
      </h1>
      <div className="prose">
        <h2>About this website</h2>
        <p>
          I’m Adam Turner, and I’m responsible for this personal website. You
          don’t need an account to read it. There are no contact forms or
          advertising tools.
        </p>
        <h2>Optional Google Analytics</h2>
        <p>
          Where analytics is enabled, this website asks before loading Google
          Analytics 4. If you decline, its scripts do not load. Reading articles
          and sharing links work either way.
        </p>
        <p>
          After you accept, Google Analytics can measure visits, pages read,
          referral sources and general device information. It may store
          first-party analytics cookies in your browser to distinguish visits.
          These browser identifiers are not the same as anonymous data.
          Advertising features are not enabled by this website.
        </p>
        <p>
          Your analytics choice is saved in this browser’s local storage. You
          can change it through “Cookie preferences” in the footer when
          analytics is available. Withdrawing permission removes this site’s
          Google Analytics cookies and reloads the page to stop the analytics
          script.
        </p>
        <p>
          Google processes analytics data under its own terms. Read{' '}
          <ContentLink href="https://policies.google.com/privacy">
            Google’s privacy policy
          </ContentLink>{' '}
          and{' '}
          <ContentLink href="https://policies.google.com/technologies/partner-sites">
            how Google uses information from partner sites
          </ContentLink>
          .
        </p>
        <h2>What is stored, and for how long?</h2>
        <p>
          The Google Analytics property uses a 14-month retention setting for
          user and event data. This setting does not limit aggregated reports.
          Google’s reset-on-activity setting can extend how long a returning
          visitor’s identifier is retained.{' '}
          <ContentLink href="https://support.google.com/analytics/answer/7667196">
            Read Google’s explanation of data retention
          </ContentLink>
          .
        </p>
        <p>
          Analytics cookies, including _ga and _ga_* cookies, use a two-year
          expiry in this site’s configuration, refreshed by subsequent activity.
          You can remove them sooner through Cookie preferences or your browser
          settings. The consent choice itself stays in local storage until you
          change it or clear site data.
        </p>
        <p>
          Your theme preference is also stored locally when you choose Light or
          Dark. Choosing System removes that override. Neither preference is
          sent to Google as part of these controls.
        </p>
        <h2>Article and connection activity</h2>
        <p>
          With analytics consent, I also measure clicks on LinkedIn connection
          links, article-sharing links and RSS links, successful article-link
          copies and completed native sharing actions. These events include the
          article identifier, sharing service or location of the link where
          relevant. They do not tell me whether you connected on LinkedIn,
          published a post or subscribed to a feed. No clipboard contents or
          messages are collected by these events.
        </p>
        <h2>Sharing articles</h2>
        <p>
          Sharing buttons link to LinkedIn, WhatsApp, X or your email app. No
          social tracking widgets are embedded. If you follow a sharing link,
          the selected service receives the article URL and, where supported,
          its title. Its own privacy terms apply.
        </p>
        <h2>Delivering the website</h2>
        <p>
          Vercel provides hosting for the production website. Serving pages
          involves processing technical information such as your IP address and
          requested URL. This helps deliver the website and protect it from
          abuse; it is separate from optional audience analytics.
        </p>
        <p>
          I rely on legitimate interests in operating a reliable, secure website
          for this essential processing, and on your consent for optional
          analytics. Provider logs are subject to the hosting service’s
          retention and security arrangements. See{' '}
          <ContentLink href="https://vercel.com/legal/privacy-notice">
            Vercel’s privacy notice
          </ContentLink>{' '}
          and{' '}
          <ContentLink href="https://vercel.com/legal/dpa">
            data processing terms
          </ContentLink>
          .
        </p>
        <p>
          Google and Vercel may process information outside the UK. Their
          applicable data processing terms describe the safeguards for
          international transfers, including contractual safeguards where
          required. See{' '}
          <ContentLink href="https://business.safety.google/adsprocessorterms/">
            Google’s data processing terms
          </ContentLink>
          .
        </p>
        <h2>Your choices and rights</h2>
        <p>
          You can refuse or withdraw analytics consent without losing access to
          the website. Withdrawal stops future collection; it does not
          automatically erase information already collected. Depending on the
          circumstances, you can ask to access, correct or delete personal
          information, restrict its use, object to processing based on
          legitimate interests, or request portability. Browser identifiers may
          be needed to locate information associated with a visit.
        </p>
        <p>
          For a privacy question or request, contact me through LinkedIn below.
          You can also{' '}
          <ContentLink href="https://ico.org.uk/make-a-complaint/">
            raise a concern with the Information Commissioner’s Office
          </ContentLink>
          .
        </p>
        <p>
          This is Adam Turner’s personal website. For questions,{' '}
          <ContentLink href={site.linkedin}>
            contact me through LinkedIn
          </ContentLink>
          .
        </p>
        <Link href="/blog">Back to the blog →</Link>
      </div>
    </article>
  );
}
