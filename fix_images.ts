import fs from 'fs';
import path from 'path';

const files = [
  'server.ts',
  'src/pages/Home.tsx',
  'src/pages/Podcasts.tsx',
  'src/pages/Reportages.tsx'
];

let counter = 0;

for (const file of files) {
  const filePath = path.join(process.cwd(), file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  content = content.replace(/https:\/\/images\.unsplash\.com\/photo-[^?"']+(?:\?[^"']*)?/g, () => {
    counter++;
    return `https://picsum.photos/seed/samou${counter}/800/600`;
  });
  
  fs.writeFileSync(filePath, content);
}

console.log('Images fixed');
