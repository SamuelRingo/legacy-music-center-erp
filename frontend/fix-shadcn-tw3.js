import fs from 'fs';
import path from 'path';

const dir = 'src/components/ui';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Global replacements
  content = content.replace(/data-open:/g, 'data-[state=open]:');
  content = content.replace(/data-closed:/g, 'data-[state=closed]:');
  content = content.replace(/max-h-\(--available-height\)/g, 'max-h-96');
  content = content.replace(/w-\(--anchor-width\)/g, 'w-full min-w-[var(--radix-select-trigger-width)]');
  content = content.replace(/origin-\(--transform-origin\)/g, 'origin-top');
  content = content.replace(/data-inset:/g, 'data-[inset]:');
  content = content.replace(/data-popup-open:/g, 'data-[state=open]:');
  
  // Specific variable replacements
  content = content.replace(/rounded-\[min\(var\(--radius-[^)]+\),[0-9]+px\)\]/g, 'rounded-md');
  content = content.replace(/color-mix\(in_oklch,var\(--secondary\),var\(--foreground\)_5%\)/g, 'var(--secondary)');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${file}`);
  }
}
