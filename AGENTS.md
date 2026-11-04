# Repository Guidelines

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project Structure

`app/` contains Next.js routes and global styles; `components/` holds shared UI. Content discovery, validation and publication controls live in `lib/content/`. Articles are Markdown/MDX in `content/blog/`, with artwork in `public/images/blog/`. Generators live in `scripts/codegen/`; automated tests live in `tests/` and `tests/browser/`.

## Development and Validation

- `npm run dev`: start local development with draft previews.
- `npm run check`: run lint, formatting, TypeScript, content validation and unit tests.
- `npm test`: run Node's test runner against `tests/*.test.mjs`.
- `npm run build`: validate content and produce the production build.
- `npm run test:browser`: run Playwright against a running server; set `TEST_BASE_URL` for another port.

## Standing Agent Permissions

The agent is authorised to run tests, lint, type checks, content validation, builds, Playwright browser checks and the local test server without requesting conversational approval for each invocation. Reusable execution approvals are configured in `~/.codex/rules/validation.rules`; runtime restrictions still apply. Prefer direct commands and the approved `env` presets for local browser tests over inline shell assignments.

## Coding Style

Use TypeScript for React components and `.mjs` with `.d.mts` declarations for shared Node modules. Follow existing kebab-case filenames, two-space indentation and single quotes. Prettier and ESLint enforce formatting and style. Reuse shared components and theme variables; keep content processing server-side.

## Testing

Name unit tests `*.test.mjs` and Playwright tests `*.spec.ts`. Cover changed behaviour with focused regressions. Check mobile layouts and both themes for UI changes; intercept analytics requests in browser tests. Preserve draft exclusion, canonical URLs, RSS and sitemap behaviour.

## Commits and Pull Requests

Use concise, imperative commit subjects, following existing history such as “Add blog topics, reading time, and updated articles”. Describe the problem, resulting behaviour and validation in pull requests. Include screenshots for visual changes and link relevant issues when available. Never commit `.env` files, credentials or generated test results.
