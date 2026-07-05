import fs from 'fs';
import path from 'path';

const svgFallback = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect fill='%23f3f4f6' width='800' height='600'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='30' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3ESAMOU MEDIA%3C/text%3E%3C/svg%3E";

const onErrorStr = ` onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "${svgFallback}"; }}`;

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // We only want to add onError if it doesn't already have one
      if (content.includes('<img') && !content.includes('onError={')) {
        // Regex to match `<img ` and replace with `<img onError={...} `
        content = content.replace(/<img /g, `<img${onErrorStr} `);
        fs.writeFileSync(fullPath, content);
        console.log(`Updated images in ${fullPath}`);
      }
    }
  }
}

processDirectory(path.join(process.cwd(), 'src'));
console.log('Done!');
