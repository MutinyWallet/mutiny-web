import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const insertHeadTag = async () => {
  const filePath = join(process.cwd(), 'dist', 'public', 'index.html');
  try {
    let data = await readFile(filePath, 'utf8');
    const lines = data.split('\n');
    lines.splice(2, 0, '<head></head>');
    data = lines.join('\n');
    await writeFile(filePath, data);
  } catch (err) {
    console.error(`Error: ${err}`);
  }
};

insertHeadTag();
