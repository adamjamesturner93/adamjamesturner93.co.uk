function text(node) {
  return node.type === 'text' || node.type === 'inlineCode'
    ? node.value
    : (node.children || []).map(text).join('');
}

export function remarkArticleNavigation() {
  return (tree) => {
    const used = new Set();
    const sections = [];
    function visit(node) {
      if (node.type === 'heading') {
        const label = text(node);
        const base =
          label
            .toLowerCase()
            .normalize('NFKD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^\p{L}\p{N}\s-]/gu, '')
            .trim()
            .replace(/\s+/g, '-') || 'section';
        let id = 'section-' + base;
        let count = 2;
        while (used.has(id)) id = 'section-' + base + '-' + count++;
        used.add(id);
        node.data = {
          ...node.data,
          hProperties: { ...node.data?.hProperties, id, tabIndex: -1 },
        };
        if (node.depth === 2 && tree.children.includes(node))
          sections.push({ label, id, node });
      }
      for (const child of node.children || []) visit(child);
    }
    visit(tree);
    if (sections.length < 4) return;
    const nav = {
      type: 'blockquote',
      data: {
        hName: 'nav',
        hProperties: { className: 'article-toc', 'aria-label': 'On this page' },
      },
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'strong',
              children: [{ type: 'text', value: 'In this article' }],
            },
          ],
        },
        {
          type: 'list',
          ordered: false,
          spread: false,
          children: sections.map(({ label, id }) => ({
            type: 'listItem',
            spread: false,
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'link',
                    url: '#' + id,
                    children: [{ type: 'text', value: label }],
                  },
                ],
              },
            ],
          })),
        },
      ],
    };
    tree.children.splice(tree.children.indexOf(sections[0].node), 0, nav);
  };
}
