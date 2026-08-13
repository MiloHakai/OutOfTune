import { readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const imageDir = path.join(root, 'assets', 'images');
const output = path.join(root, 'gallery', 'images.json');
const extensions = /\.(png|jpe?g|webp|gif|avif)$/i;

const files = (await readdir(imageDir, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && extensions.test(entry.name))
  .map((entry) => entry.name)
  .sort((a, b) => a.localeCompare(b));

await writeFile(output, JSON.stringify(files, null, 2) + '\n', 'utf8');
console.log(`Gallery manifest: ${files.length} image(s)`);
