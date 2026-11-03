import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import remarkGfm from 'remark-gfm';

const markdown = unified().use(remarkParse).use(remarkGfm);
const mdx = unified().use(remarkParse).use(remarkGfm).use(remarkMdx);
const blocks = new Set(['paragraph', 'heading', 'tableCell', 'break']);
const excluded = new Set([
  'code',
  'html',
  'definition',
  'image',
  'imageReference',
  'mdxjsEsm',
  'mdxFlowExpression',
  'mdxTextExpression',
]);

function prose(node) {
  if (excluded.has(node.type)) return '';
  if (node.type === 'text' || node.type === 'inlineCode') return node.value;
  // Count JSX prose and the caption of the existing Figure component, never
  // component props, imports, comments or executable source expressions.
  if (node.type.startsWith('mdxJsx')) {
    if (['script', 'style', 'head', 'template'].includes(node.name)) return '';
    if (node.attributes.some((attribute) => attribute.name === 'hidden'))
      return '';
    const caption =
      node.name === 'Figure'
        ? node.attributes.find((attribute) => attribute.name === 'caption')
            ?.value
        : undefined;
    const text =
      (node.children || []).map(prose).join('') +
      (typeof caption === 'string' ? ` ${caption} ` : '');
    return node.type === 'mdxJsxFlowElement' ? ` ${text} ` : text;
  }
  const text = (node.children || []).map(prose).join('');
  return blocks.has(node.type) ? ` ${text} ` : text;
}

// Front matter has already been removed by the content loader. Parse the same
// Markdown/MDX syntax as ContentBody so formatting and link targets add no words.
// Fenced code is omitted from this prose estimate; inline code remains readable.
export function readingMinutes(body, extension = '.mdx') {
  const tree = (extension === '.mdx' ? mdx : markdown).parse(body);
  const words =
    prose(tree).match(/[\p{L}\p{N}]+(?:['’\u2011-][\p{L}\p{N}]+)*/gu) || [];
  return Math.max(1, Math.ceil(words.length / 225));
}
