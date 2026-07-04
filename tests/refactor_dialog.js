const fs = require('fs');
const path = require('path');

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else if (filePath.endsWith('.jsx')) {
      results.push(filePath);
    }
  });
  return results;
};

const files = walk('./frontend/src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('ConfirmActionDialog') || content.includes('ConfirmDialog')) {
    content = content.replace(/ConfirmActionDialog/g, 'ConfirmDialog');
    content = content.replace(/variant="destructive"/g, 'variant="danger"');
    
    // In UsersPage, we have a role modal and password modal. Let's make sure they use ConfirmDialog too?
    // Wait, UsersPage.jsx role modal already uses ConfirmActionDialog? 
    // Yes, earlier I used ConfirmActionDialog for role. Let's check UsersPage.jsx later.
    
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Refactored ${file}`);
  }
});
