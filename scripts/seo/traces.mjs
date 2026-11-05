import fs from 'node:fs/promises';
import path from 'node:path';

export function missingTraceFiles(traceFile, files, required) {
  const included = new Set(
    files.map((file) => path.resolve(path.dirname(traceFile), file)),
  );
  return required.filter((file) => !included.has(path.resolve(file)));
}

export async function checkSocialImageTraces(root) {
  async function filesUnder(directory) {
    const entries = await fs
      .readdir(directory, { withFileTypes: true })
      .catch((error) => {
        if (error.code === 'ENOENT') return [];
        throw error;
      });
    return (
      await Promise.all(
        entries.map((entry) => {
          const file = path.join(directory, entry.name);
          return entry.isDirectory() ? filesUnder(file) : [file];
        }),
      )
    ).flat();
  }
  const required = [
    ...(await filesUnder(path.join(root, 'content'))),
    ...(await filesUnder(path.join(root, 'public/images/blog'))),
    ...(await filesUnder(path.join(root, 'public/images/speaking'))),
  ];
  for (const collection of ['blog', 'speaking']) {
    const traceFile = path.join(
      root,
      '.next/server/app',
      collection,
      '[slug]/opengraph-image/route.js.nft.json',
    );
    const trace = JSON.parse(await fs.readFile(traceFile, 'utf8'));
    const missing = missingTraceFiles(traceFile, trace.files, required);
    if (missing.length)
      throw Error(
        `Social image deployment bundle (${collection}) is missing runtime files: ${missing.map((file) => path.relative(root, file)).join(', ')}`,
      );
  }
}
