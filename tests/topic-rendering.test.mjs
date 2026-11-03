import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { tagRegistry } from '../lib/content/tags.mjs';

// Compile the actual server component without a browser or a client bundle.
const source = fs.readFileSync('components/topic-chips.tsx', 'utf8');
const compiled = ts.transpileModule(
  source.replace(/import .* from .*;\n/, ''),
  {
    compilerOptions: { jsx: ts.JsxEmit.React, module: ts.ModuleKind.CommonJS },
  },
).outputText;
const exports = {};
new Function('exports', 'React', 'tagRegistry', compiled)(
  exports,
  { createElement },
  tagRegistry,
);
const TopicChips = exports.default;
test('topic labels render as semantic noninteractive text and omit empty lists', () => {
  assert.equal(
    renderToStaticMarkup(createElement(TopicChips, { tags: [] })),
    '',
  );
  const html = renderToStaticMarkup(
    createElement(TopicChips, { tags: Object.keys(tagRegistry).slice(0, 5) }),
  );
  assert.equal((html.match(/<li /g) || []).length, 5);
  assert.match(html, /Performance Management/);
  assert.match(html, /Organisational Culture/);
  assert.doesNotMatch(html, /<a |<button|tabindex|onclick/);
});
test('all chip palettes exceed WCAG AA normal text contrast', () => {
  const luminance = (hex) => {
    const channels = hex.match(/\w\w/g).map((value) => {
      const c = parseInt(value, 16) / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  };
  const css = fs.readFileSync('app/globals.css', 'utf8');
  const ink = css.match(/\.topic-chip \{[^}]*color: #([0-9a-f]{6})/s)[1];
  for (const tone of ['cobalt', 'coral', 'turquoise']) {
    const background = css.match(
      new RegExp(`\\.topic-chip-${tone} \\{\\s*background: #([0-9a-f]{6})`),
    )[1];
    assert.ok((luminance(background) + 0.05) / (luminance(ink) + 0.05) >= 4.5);
  }
});
