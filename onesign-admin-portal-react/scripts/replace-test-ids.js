const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const OLD_TENANT_ID = '00000000-0000-0000-0000-000000000000';
const NEW_TENANT_ID = '11111111-1111-1111-1111-111111111111';
const DEFAULT_TENANT_ID_IMPORT = "import { DEFAULT_TENANT_ID } from '@/lib/constants/testIds';";

// Get all TypeScript/TSX files in src/pages
const srcDir = path.join(__dirname, '../src');
const pagesDir = path.join(srcDir, 'pages');

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Check if file contains the old tenant ID
  if (content.includes(OLD_TENANT_ID)) {
    // Replace the old tenant ID with DEFAULT_TENANT_ID constant
    content = content.replace(
      new RegExp(OLD_TENANT_ID.replace(/-/g, '\\-'), 'g'),
      'DEFAULT_TENANT_ID'
    );
    
    // Add import if not already present
    if (!content.includes("from '@/lib/constants/testIds'")) {
      // Find the last import statement
      const importRegex = /^import .+ from ['"].+['"];$/gm;
      const imports = content.match(importRegex) || [];
      
      if (imports.length > 0) {
        const lastImport = imports[imports.length - 1];
        const lastImportIndex = content.lastIndexOf(lastImport);
        const insertIndex = lastImportIndex + lastImport.length;
        content = content.slice(0, insertIndex) + '\n' + DEFAULT_TENANT_ID_IMPORT + content.slice(insertIndex);
      } else {
        // No imports, add at the beginning
        content = DEFAULT_TENANT_ID_IMPORT + '\n' + content;
      }
    }
    
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${path.relative(srcDir, filePath)}`);
    return true;
  }
  
  return false;
}

// Main execution
console.log('Replacing test IDs in all files...\n');

const allFiles = getAllFiles(pagesDir);
let updatedCount = 0;

allFiles.forEach(file => {
  if (replaceInFile(file)) {
    updatedCount++;
  }
});

console.log(`\n✅ Updated ${updatedCount} files.`);

