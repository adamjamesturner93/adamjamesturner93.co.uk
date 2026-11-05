# Adam Turner

A personal engineering leadership publication built with Next.js App Router, TypeScript and Tailwind. Local SVG illustrations, automatically self-hosted Space Grotesk and Geist fonts, repository-managed Markdown/MDX, and no CMS or runtime image/font services.

## Develop and check

Use Node.js 22.13+ or 24+ and npm:

```sh
npm ci
npm run dev
npm run check
npm run build
```

Open http://localhost:3000. `npm run check` includes lint, Prettier, TypeScript, content/MDX validation and tests. Builds also validate **all** content, including drafts. `npm run format` and `npm run lint:fix` apply fixes. Husky installs on `npm ci`; pre-commit formats/lints staged files, then runs TypeScript and tests. A Git checkout is required for hooks. Production build validation remains separate. With a server running, `npm run test:http -- http://localhost:3000` checks real routes; set `SMOKE_MODE=production` or `SMOKE_MODE=preview` to match the server configuration.

Development accepts ngrok hostnames under `ngrok-free.app`, `ngrok.app` and `ngrok.io`.

## Create content

```sh
npm run codegen:blog -- an-interesting-question
npm run codegen:blog -- an-interesting-question --category technology-strategy
npm run codegen:speaker -- a-future-talk
```

The canonical syntax uses `--`; npm also forwards plain positional arguments. Each command creates a draft MDX file in `content/blog/` or `content/speaking/`, plus an original 16:9 SVG in `public/images/<collection>/`. The command prints the preview URL. Invalid slugs, duplicate content or existing artwork fail without overwriting files; partial writes are rolled back.

Blog categories: `engineering-leadership`, `technology-strategy`, `responsible-change`, `people-and-organisations`, `general` (the generator default). Labels live centrally in `lib/content/core.mjs`.

Edit the front matter and body directly. Both `.md` and `.mdx` are discovered automatically, including legacy blog Markdown at the top of `content/`. Keep filenames equal to the front matter slug. Quote ISO calendar dates (`"2026-10-31"`). `date` is creation/draft history, not the public publication date. Cover paths must point to existing local files under `/images/`. Replace artwork in place or update `coverImage`; use `coverImageAlt: ""` for purely decorative illustrations.

MDX is **trusted repository-controlled code**, never a public upload format. It supports Markdown, tables and JSX. For captioned images use:

```mdx
<Figure
  src="/images/blog/example.svg"
  alt="A meaningful description"
  caption="An optional caption"
/>
```

## Preview and publish

- **Local development:** drafts appear by default with clear badges. Pages are non-indexable.
- **Vercel Preview:** drafts appear only with `ENABLE_DRAFTS=true` in the Preview environment. First enable **Vercel Authentication** and **Standard Protection**, then verify an unauthenticated visitor cannot access the preview. The application cannot verify the dashboard setting, and an environment variable does not authenticate anyone. All preview pages are non-indexable.
- **Production:** drafts always return 404, including their Open Graph routes. They are excluded from navigation, related articles, RSS and sitemap regardless of preview flags.

To publish a blog entry, finish the text and metadata, remove TODO/scaffold prompts, set `draft: false` and supply `publishedAt: "YYYY-MM-DD"`. `publishedAt` controls public dates and ordering. Future-dated entries are visible in author previews with a scheduled date, but stay hidden publicly until that UTC date; **rebuild on or after the date** to update static pages and feeds. This is not an automatic scheduling service. `updatedAt` is optional. `illustrative: true` keeps a visible sample-article label independently of publication status.

Speaking adds `eventName`, `format` and `status`. Formats: `conference`, `meetup`, `webinar`, `panel`, `workshop`, `other`. Statuses: `proposed`, `submitted`, `confirmed`, `delivered`. A public entry must have `draft: false`, a valid `publishedAt` and `eventDate`, completed required metadata, and status `confirmed` or `delivered`. Optional location, event, slides and recording URLs render only when supplied. Proposed/submitted drafts preview locally but never represent accepted engagements publicly. Speaking navigation appears automatically when visible content exists; an empty public speaking index returns 404. No sample engagements are invented.

Drafts never enter RSS or sitemap, even locally. Artwork in `public/` is always directly accessible, including draft covers. Draft files in a public Git repository are also public. Neither is suitable for confidential information; private media would need separately protected storage.

The three initial articles retain their original text, expanded with hypothetical analysis and verified further reading. They are marked as illustrative samples for substantial author personalisation. Their explicit publication flags and dates remain author-controlled.

## Configuration and eventual Vercel setup

Copy `.env.example` to `.env.local` if needed. Production is indexable automatically: Vercel Production, or NODE_ENV=production outside Vercel. Development and Vercel Preview remain noindex. Use Deployment Protection for private previews; noindex is not access protection.

Site identity, LinkedIn and canonical origin live in `lib/site.mjs`. Generated absolute URLs always use **https://adamjamesturner93.co.uk**, never the request host or preview URL. `/writing` and nested legacy routes permanently redirect to `/blog`.

For eventual hosting, import this directory as a standard Vercel Next.js project and retain the npm build script. Configure `ENABLE_DRAFTS` in the correct environment scopes; changes require a new build. Add `adamjamesturner93.co.uk` as primary and configure `www.adamjamesturner93.co.uk` to redirect to the apex in Vercel domain settings. Use DNS records supplied by Vercel. No deployment, DNS or live Vercel changes are part of this implementation.

## Architecture

- `lib/content/core.mjs` and its TypeScript declarations provide shared validation, automatic discovery, visibility and related-content selection for pages, feeds, generators and tests.
- `content/blog/` and `content/speaking/` hold author-managed content; `public/images/` holds replaceable artwork.
- `components/` contains navigation, covers, prose rendering and social image generation. Pages use Server Components, with a small client navigation component for active links and mobile menu closing.
- `scripts/codegen/` contains deterministic SVG compositions and the transactional CLI. `scripts/validate-content.mjs` validates metadata and compiles MDX before builds.

Useful references: [Vercel Deployment Protection](https://vercel.com/docs/deployment-protection), [Next.js metadata](https://nextjs.org/docs/app/getting-started/metadata-and-og-images).

## Reach, sharing and analytics

Published articles include LinkedIn, WhatsApp, X and email share links, plus copy-link and native sharing on supported browsers. Every share uses the canonical production URL, never a localhost or ngrok URL. Drafts and future-dated entries do not expose share controls. Social links use no embedded SDKs or tracking scripts. Article-specific Open Graph/Twitter metadata and 1200 × 630 PNGs supply link previews.

SEO includes canonical URLs, published-only RSS/sitemap, actual article publication/update dates, author-linked BlogPosting structured data, descriptions and responsive pages. Verify the site in Google Search Console and submit `https://adamjamesturner93.co.uk/sitemap.xml`; this is a separate account task, not performed by the app. For HTML-tag verification, set `GOOGLE_SITE_VERIFICATION` to the verification token (not the complete meta tag), or use Search Console’s domain/DNS method.

Optional GA4 setup: set `GA_MEASUREMENT_ID=G-…` in Production. No tracking or consent banner is enabled without a valid ID in production. Local development and Vercel Preview never load Google Analytics. Visitors must explicitly allow analytics before any Google tag is loaded; rejection loads no Google tag, including cookieless tracking. The choice is saved in local storage. The footer’s cookie preferences can change it; revocation removes this site’s `_ga` cookies and reloads the page. Advertising signals are disabled. The `/privacy` page explains these choices.

In the GA4 web data stream, enable Enhanced measurement → Page views → Page loads and Page changes based on browser history events. This lets GA4 measure Next.js client navigation without a second manual page-view implementation. After connecting the real Measurement ID, verify page views in GA4 Realtime/DebugView. Analytics reports usage; Search Console reports search visibility. Neither integration guarantees rankings. The GA4 property, Search Console ownership, real collection and Vercel environment settings require account access and have not been configured by these source changes.

## Article topics and recommendations

Blog front matter accepts an optional `tags` array of up to five unique, lowercase kebab-case identifiers. Missing tags default to `[]`. The shared registry in `lib/content/tags.mjs` defines the allowed identifiers, display labels and consistent colour for each topic. Unknown or malformed identifiers fail content validation.

```yaml
tags:
  - performance-management
  - feedback
```

Article footers show all supplied tags under “Explore more topics”; article previews show the first three. Chips are informational text. Categories remain separate. There are no tag filters or archive routes.

Generate a draft with empty tags by default, or supply registered tags alongside the existing category option:

```bash
npm run codegen:blog -- example-article --category engineering-leadership --tags feedback,leadership
```

Related articles rank visible candidates by shared tag count, matching category, then publication recency, with the slug breaking ties. Up to two appear; a lone published article has no recommendations. Existing `relatedArticles` lists remain accepted and validated for compatibility, but recommendation order follows the tag/category/date ranking. Draft and future-dated articles remain restricted to authorised previews.

Reading time appears beside the article date. The server estimates it from article prose at 225 words per minute, rounded up to at least one minute. Markdown formatting, link destinations, front matter, MDX comments/imports/expressions and fenced code do not add words; inline code and the existing Figure component's caption count as readable text. There is no reading-time front-matter field or additional client JavaScript.

## Themes and cookie testing

The header selector defaults to System and follows operating-system changes. Light/Dark preferences are saved under `adam-theme`; System removes the override. Themes also work without JavaScript using the OS preference.

Run `ANALYTICS_DEMO=true npm run dev` to test the cookie banner locally, including through ngrok. This mode never loads Google scripts and stores choices separately under `adam-analytics-demo-v1`. Use Cookie preferences to reopen it, or clear that localStorage key to reset. Production and Vercel Preview ignore the demonstration flag.

To check real analytics locally, stop the dev server, run `npm run build`, then `npx next start -p 3110` with a valid GA_MEASUREMENT_ID available during the build. Use a separate GA test stream to avoid polluting production reports. Acceptance enables actual Google requests. Verify page views in Realtime/DebugView.

The author confirmed 14-month GA retention. Before launch, confirm the property's reset-on-activity setting and provider log retention/transfer arrangements against the privacy notice. No dashboard settings were changed by this work. LinkedIn remains the privacy contact and requires third-party access; a public email would improve accessibility.

Browser regression tests: install Chromium with `npx playwright install chromium`, start the site, then run `npm run test:browser`. Set `TEST_BASE_URL` for another port. Set `TEST_ANALYTICS=demo` against the local demonstration or `TEST_ANALYTICS=production` against a production build with a GA ID to include consent tests. Google requests are intercepted in these tests. Screenshots are written to ignored `test-results/`. `CHROMIUM_PATH` optionally selects an existing Chromium executable.

## Contextual article links

In MDX use `<ArticleLink slug="feedback-isnt-a-gift-its-a-dance">descriptive text</ArticleLink>`.
The slug must be literal and refer to an existing article; builds reject unknown targets.
The text becomes a link only when the destination is visible under the current publication policy.
Publishing requires completing the draft, setting `draft: false` and `publishedAt`, then rebuilding.
Shared tags independently drive related recommendations. Keep outline placeholders until the article is finished so publication validation catches them.

## Interaction analytics

Production GA events remain opt-in: `linkedin_connect_click`, `article_share_click`,
`article_link_copy`, `article_native_share` and `rss_click`. Parameters are `placement`
(`article_author`, `about`, `footer`), `method` (sharing links only), and `article_slug`
where applicable. Copies count only on clipboard success; cancelled/failed native shares do not count.
These are intent/action measurements, not confirmed connections, posts or subscriptions.
No actions before consent/GA initialisation are replayed. Preview and demo modes send nothing.

In GA Admin, verify enhanced measurement for page views (including browser history changes),
outbound clicks and scrolling. Keep GA as the sole page-view source; do not add a second manual tracker.
In DebugView/Realtime, verify one page view for each Next.js navigation after consent.
Register `placement` and `article_slug` as event-scoped custom dimensions if needed in reports;
`method` is the sharing-method parameter. Optionally mark `linkedin_connect_click` as a key event,
labelled as connection intent. Generic outbound `click` events and these purpose-specific events
can coexist; do not sum them as distinct actions. Compare articles by engagement and actions,
remembering that visitors who decline analytics are absent.

Example link for a LinkedIn post:
`https://adamjamesturner93.co.uk/blog/making-annual-reviews-valuable?utm_source=linkedin&utm_medium=social&utm_campaign=annual_reviews`
Use campaign parameters on distributed links, not internal navigation or canonical URLs.
GA dashboard settings are separate from these code changes and must be verified in the property.

## Article SEO checks

Power SEO `core`, `content-analysis` and `readability` run locally as development
tooling; they add no client JavaScript and do not send article content to a service.

- `npm run seo:staged`: inspect added, changed or renamed Markdown/MDX articles
  from the **Git index**, including partially staged files. Skip `draft: true`
  and deleted files. Scheduled non-drafts are checked before publication too.
- `npm run seo:articles`: review all tracked/untracked working-tree non-draft articles.
- Append `-- --json` for machine-readable output, or `-- --strict` to opt into
  failing on poor editorial checks and metadata recommendations.

The pre-commit hook runs staged SEO after formatting, type checks and tests.
Missing title/description/slug, empty prose, extra body H1s, malformed metadata
and unsupported dynamic MDX stop the check. Readability, length and keyword
suggestions are advisory by default: these heuristics are not Google ranking
scores, and personal editorial writing does not need to satisfy every suggestion.
No automatic rewrites or invented claims are applied.

Optionally add an author-selected `focusKeyphrase: annual review` to article
front matter to assess keyword placement and density. It is not a required field,
not inferred from tags, and is not emitted as a keywords meta tag. The existing
schema accepts this optional metadata; the SEO checker validates its type.

The checker parses static Markdown/MDX without executing staged code. It supports
our ArticleLink, Figure and QuestionsWorthAsking components, including literal
question arrays and captions. It checks published visibility from the same Git
index in staged mode. Hidden destinations remain plain text. Unknown components,
raw HTML and dynamic expressions require an explicit static adapter rather than
silently producing an inaccurate report. It models the title as the page H1 and
includes the shared About link; navigation/footer text is excluded from readability.
Title width includes the site's title suffix. Pixel and reading-level estimates
are guidance, not promises about search-result display or accessibility.

### Other Power SEO packages

The upstream toolkit is at https://github.com/CyberCraftBD/power-seo.
`audit` and `links` could help with deployed-page auditing and orphan detection
once the collection grows. `search-console` and `analytics` could support a later
report based on actual search queries and click-through rates, with separately
configured credentials. DNS ownership does not itself provide API credentials.
The metadata, sitemap and tracking packages duplicate existing Next.js metadata,
RSS/sitemap and consent-aware GA features, so they are not installed. The AI
package is unnecessary for author-controlled writing. Reflection questions do
not constitute answered FAQs, so no FAQ schema is generated for them.

### Full public-page check

`npm run seo:check` builds production with drafts and analytics disabled, starts a
temporary loopback server on an available port, and checks every URL in its
sitemap. This covers Home, About, Blog, Privacy, published articles and published
speaking pages as they become available. It checks actual rendered titles,
descriptions, canonical URLs, robots directives, H1s, main content and readability.
Drafts, scheduled articles, redirects and hidden speaking pages are excluded by
the existing production sitemap. The temporary server is stopped afterwards.

Use `-- --json` for a report (build logs go to stderr), or `-- --strict` to fail
on editorial suggestions. Normal runs fail only on technical errors. This builds
into `.next`, so stop the development server before running it. The staged hook
remains article-only and fast; use the full check before deployment. No deployed
pages are modified and no requests are made to the live website.
