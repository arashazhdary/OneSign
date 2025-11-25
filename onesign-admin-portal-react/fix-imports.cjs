const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix Next.js Link import
  if (content.includes("import Link from 'next/link'")) {
    content = content.replace(
      "import Link from 'next/link'",
      "import { Link } from 'react-router-dom'"
    );
    modified = true;
  }

  // Fix <Link href={}> to <Link to={}>
  if (content.includes('<Link href=')) {
    content = content.replace(/<Link href=/g, '<Link to=');
    modified = true;
  }

  // Remove LoadingOverlay import and usage if it exists
  if (content.includes("import LoadingOverlay from")) {
    content = content.replace(/import LoadingOverlay from [^;]+;?\n/g, '');
    content = content.replace(/<LoadingOverlay[^>]*\/>/g, '');
    content = content.replace(/<LoadingOverlay[^>]*>[\s\S]*?<\/LoadingOverlay>/g, '');
    modified = true;
  }

  // Fix useRouter if still exists
  if (content.includes("import { useRouter } from 'next/navigation'")) {
    content = content.replace(
      "import { useRouter } from 'next/navigation'",
      "import { useNavigate } from 'react-router-dom'"
    );
    modified = true;
  }

  // Fix router.push to navigate
  if (content.includes('router.push')) {
    content = content.replace(/const router = useRouter\(\);?/g, 'const navigate = useNavigate();');
    content = content.replace(/router\.push\(/g, 'navigate(');
    content = content.replace(/router\.replace\(/g, 'navigate(');
    modified = true;
  }

  // Fix useSearchParams from next/navigation
  if (content.includes("from 'next/navigation'")) {
    content = content.replace(
      "import { useSearchParams } from 'next/navigation'",
      "import { useSearchParams } from 'react-router-dom'"
    );
    modified = true;
  }

  // Add Helmet import if page has title but no Helmet
  if (/<h1/.test(content) && !content.includes('import { Helmet }')) {
    const lastImportIndex = content.lastIndexOf('import ');
    const endOfLastImport = content.indexOf(';', lastImportIndex) + 1;
    content =
      content.slice(0, endOfLastImport) +
      "\nimport { Helmet } from 'react-helmet-async';" +
      content.slice(endOfLastImport);
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  let fixedCount = 0;

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      fixedCount += walkDir(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      if (processFile(filePath)) {
        fixedCount++;
        console.log(`Fixed: ${filePath}`);
      }
    }
  });

  return fixedCount;
}

console.log('Starting to fix imports...');
const totalFixed = walkDir(pagesDir);
console.log(`\nDone! Fixed ${totalFixed} files.`);
