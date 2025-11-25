const fs = require('fs');
const path = require('path');

// Base paths
const NEXTJS_BASE = path.join(__dirname, 'onesign-admin-portal', 'app', '[locale]');
const REACT_BASE = path.join(__dirname, 'onesign-admin-portal-react', 'src', 'pages');

// Conversion function
function convertPage(content, componentName, pagePath) {
  let converted = content;

  // Remove 'use client' directive
  converted = converted.replace(/'use client';\s*\n*/g, '');

  // Convert Next.js imports to React Router
  converted = converted.replace(
    /import\s+{\s*useRouter\s*}\s+from\s+['"]next\/navigation['"]/g,
    "import { useNavigate } from 'react-router-dom'"
  );
  converted = converted.replace(
    /import\s+{\s*useSearchParams\s*}\s+from\s+['"]next\/navigation['"]/g,
    "import { useSearchParams } from 'react-router-dom'"
  );
  converted = converted.replace(
    /import\s+{\s*usePathname\s*}\s+from\s+['"]next\/navigation['"]/g,
    "import { useLocation } from 'react-router-dom'"
  );
  converted = converted.replace(
    /import\s+{\s*useParams\s*}\s+from\s+['"]next\/navigation['"]/g,
    "import { useParams } from 'react-router-dom'"
  );

  // Convert next-intl to react-i18next
  converted = converted.replace(
    /import\s+{\s*useTranslations\s*}\s+from\s+['"]next-intl['"]/g,
    "import { useTranslation } from 'react-i18next'"
  );
  converted = converted.replace(
    /const\s+t\s*=\s*useTranslations\(\)/g,
    "const { t } = useTranslation()"
  );

  // Convert router usage
  converted = converted.replace(
    /const\s+router\s*=\s*useRouter\(\)/g,
    "const navigate = useNavigate()"
  );
  converted = converted.replace(/router\.push\(/g, 'navigate(');
  converted = converted.replace(/router\.replace\(/g, 'navigate(');
  converted = converted.replace(/router\.back\(\)/g, 'navigate(-1)');

  // Add Helmet import if not present
  if (!converted.includes('Helmet') && !converted.includes('helmet')) {
    // Find the first import and add Helmet after it
    const firstImportIndex = converted.indexOf('import');
    if (firstImportIndex !== -1) {
      const endOfImports = converted.indexOf('\n\n', firstImportIndex);
      if (endOfImports !== -1) {
        const helmet = "import { Helmet } from 'react-helmet-async';";
        if (!converted.substring(firstImportIndex, endOfImports).includes('Helmet')) {
          converted = converted.slice(0, endOfImports) + '\n' + helmet + converted.slice(endOfImports);
        }
      }
    }
  }

  // Update component name
  const exportDefaultRegex = /export default function \w+/g;
  converted = converted.replace(exportDefaultRegex, `export default function ${componentName}`);

  // Add Helmet component if not present
  if (converted.includes('Helmet') && !converted.includes('<Helmet>')) {
    // Find return statement
    const returnIndex = converted.indexOf('return (');
    if (returnIndex !== -1) {
      // Get the page title from component name
      const pageTitle = componentName.replace('Page', '').replace(/([A-Z])/g, ' $1').trim();

      const helmetCode = `
      <Helmet>
        <title>${pageTitle} - OneSign Admin Portal</title>
      </Helmet>
      `;

      // Insert Helmet after return (
      const insertIndex = returnIndex + 'return ('.length;
      converted = converted.slice(0, insertIndex) + '\n    <>' + helmetCode + '\n      ' + converted.slice(insertIndex);

      // Close fragment before final closing
      const lastClosingIndex = converted.lastIndexOf('  );');
      if (lastClosingIndex !== -1) {
        converted = converted.slice(0, lastClosingIndex) + '    </>\n' + converted.slice(lastClosingIndex);
      }
    }
  }

  return converted;
}

// Get component name from path
function getComponentName(filePath) {
  const relativePath = path.relative(NEXTJS_BASE, filePath);
  const parts = relativePath.split(path.sep).filter(p => p !== 'page.tsx');

  const nameParts = [];
  for (const part of parts) {
    if (part.startsWith('[') && part.endsWith(']')) {
      nameParts.push('Detail');
    } else {
      const words = part.split(/[-_]/);
      nameParts.push(...words.map(w => w.charAt(0).toUpperCase() + w.slice(1)));
    }
  }

  return nameParts.join('') + 'Page';
}

// Get output path
function getOutputPath(inputPath) {
  const relativePath = path.relative(NEXTJS_BASE, inputPath);
  const parts = relativePath.split(path.sep);

  let section = 'other';
  if (parts[0] === 'admin') section = 'admin';
  else if (parts[0] === 'tenant') section = 'tenant';
  else if (parts[0] === 'global') section = 'global';
  else if (parts[0] === 'docs') section = 'docs';
  else if (parts[0] === 'login' || relativePath.includes('complete-first-login')) section = 'auth';

  const componentName = getComponentName(inputPath);
  const pathParts = parts.slice(1, -1); // Remove section and page.tsx

  const outputDir = path.join(REACT_BASE, section, ...pathParts);

  return { outputPath: path.join(outputDir, `${componentName}.tsx`), componentName };
}

// Find all pages
function findAllPages(dir, pages = []) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      findAllPages(fullPath, pages);
    } else if (file === 'page.tsx') {
      pages.push(fullPath);
    }
  }

  return pages;
}

// Migrate single page
function migratePage(inputPath, dryRun = true) {
  try {
    const content = fs.readFileSync(inputPath, 'utf8');
    const { outputPath, componentName } = getOutputPath(inputPath);

    const converted = convertPage(content, componentName, inputPath);

    if (dryRun) {
      console.log(`✓ Would create: ${outputPath}`);
      return { success: true, outputPath };
    }

    // Create directory
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    // Write file
    fs.writeFileSync(outputPath, converted, 'utf8');
    console.log(`✓ Created: ${outputPath}`);

    return { success: true, outputPath };
  } catch (error) {
    console.error(`✗ Error migrating ${inputPath}:`, error.message);
    return { success: false, error: error.message };
  }
}

// Main function
function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const section = args.find(arg => arg.startsWith('--section='))?.split('=')[1] || 'all';

  console.log('Finding all Next.js pages...');
  let allPages = findAllPages(NEXTJS_BASE);

  // Filter by section
  if (section !== 'all') {
    allPages = allPages.filter(p => p.includes(path.sep + section + path.sep));
  }

  console.log(`Found ${allPages.length} pages to migrate`);
  console.log('='.repeat(80));

  let successCount = 0;
  let errorCount = 0;

  for (const page of allPages) {
    const result = migratePage(page, dryRun);
    if (result.success) {
      successCount++;
    } else {
      errorCount++;
    }
  }

  console.log('='.repeat(80));
  console.log('\nMigration Summary:');
  console.log(`  Successful: ${successCount}`);
  console.log(`  Errors: ${errorCount}`);
  console.log(`  Total: ${allPages.length}`);

  if (dryRun) {
    console.log('\nThis was a dry run. Run without --dry-run to actually migrate files.');
  }
}

if (require.main === module) {
  main();
}

module.exports = { convertPage, getComponentName, getOutputPath, migratePage };
