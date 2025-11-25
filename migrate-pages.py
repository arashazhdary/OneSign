#!/usr/bin/env python3
"""
Automated Page Migration Script
Migrates Next.js pages to React pages with proper conversions
"""

import os
import re
from pathlib import Path
from typing import List, Tuple

# Base paths
NEXTJS_BASE = r"D:/Projects/DevForge/OneSign/onesign-admin-portal/app/[locale]"
REACT_BASE = r"D:/Projects/DevForge/OneSign/onesign-admin-portal-react/src/pages"

# Conversion patterns
CONVERSIONS = [
    # Remove 'use client' directive
    (r"'use client';\s*\n*", ""),

    # Convert Next.js imports to React Router
    (r"import\s+{\s*useRouter\s*}\s+from\s+['\"]next/navigation['\"];?", "import { useNavigate } from 'react-router-dom';"),
    (r"import\s+{\s*useSearchParams\s*}\s+from\s+['\"]next/navigation['\"];?", "import { useSearchParams } from 'react-router-dom';"),
    (r"import\s+{\s*usePathname\s*}\s+from\s+['\"]next/navigation['\"];?", "import { useLocation } from 'react-router-dom';"),
    (r"import\s+{\s*useParams\s*}\s+from\s+['\"]next/navigation['\"];?", "import { useParams } from 'react-router-dom';"),

    # Convert next-intl to react-i18next
    (r"import\s+{\s*useTranslations\s*}\s+from\s+['\"]next-intl['\"];?", "import { useTranslation } from 'react-i18next';"),
    (r"const\s+t\s*=\s*useTranslations\(\);?", "const { t } = useTranslation();"),

    # Convert router usage
    (r"const\s+router\s*=\s*useRouter\(\);?", "const navigate = useNavigate();"),
    (r"router\.push\(", "navigate("),
    (r"router\.replace\(", "navigate(", "replace: true"),
    (r"router\.back\(\)", "navigate(-1)"),

    # Add Helmet for SEO
    (r"export default function", "import { Helmet } from 'react-helmet-async';\n\nexport default function"),
]

def convert_page_content(content: str, page_name: str) -> str:
    """Convert Next.js page content to React page content"""

    # Apply all conversion patterns
    for pattern, replacement, *opts in CONVERSIONS:
        content = re.sub(pattern, replacement, content)

    # Add Helmet if not present
    if "Helmet" not in content and "export default" in content:
        # Find the return statement and add Helmet
        content = content.replace(
            "return (",
            "return (\n    <>\n      <Helmet>\n        <title>{page_name} - OneSign Admin Portal</title>\n      </Helmet>\n      "
        )
        # Close the fragment
        if content.count("return (") == content.count("return <"):
            content = content.replace(
                "\n  );\n}",
                "\n    </>\n  );\n}"
            )

    return content

def get_component_name(file_path: str) -> str:
    """Generate component name from file path"""
    # Extract meaningful part from path
    parts = Path(file_path).parts

    # Find index after [locale]
    try:
        locale_idx = parts.index("[locale]")
        relevant_parts = parts[locale_idx + 1:]
    except ValueError:
        relevant_parts = parts[-3:]  # fallback to last 3 parts

    # Remove 'page.tsx' and create name
    relevant_parts = [p for p in relevant_parts if p != "page.tsx"]

    # Convert to PascalCase
    name_parts = []
    for part in relevant_parts:
        # Handle [id] patterns
        if part.startswith("[") and part.endswith("]"):
            name_parts.append("Detail")
        else:
            # Split on hyphens and underscores
            words = re.split(r'[-_]', part)
            name_parts.extend([w.capitalize() for w in words if w])

    return ''.join(name_parts) + "Page"

def get_output_path(input_path: str) -> str:
    """Determine output path for migrated page"""
    rel_path = os.path.relpath(input_path, NEXTJS_BASE)

    # Determine section
    if rel_path.startswith("admin"):
        section = "admin"
    elif rel_path.startswith("tenant"):
        section = "tenant"
    elif rel_path.startswith("global"):
        section = "global"
    elif rel_path.startswith("docs"):
        section = "docs"
    elif rel_path.startswith("login") or rel_path.startswith("complete-first-login"):
        section = "auth"
    else:
        section = "other"

    # Convert path
    path_parts = Path(rel_path).parts

    # Remove first part if it's the section
    if path_parts[0] == section:
        path_parts = path_parts[1:]

    # Build filename
    component_name = get_component_name(input_path)

    # Handle dynamic routes
    path_str = "/".join(path_parts[:-1])  # Remove page.tsx
    path_str = path_str.replace("[id]", "Detail")
    path_str = path_str.replace("[", "").replace("]", "")

    if path_str:
        # Create subdirectory if needed
        output_dir = os.path.join(REACT_BASE, section, path_str)
    else:
        output_dir = os.path.join(REACT_BASE, section)

    return os.path.join(output_dir, f"{component_name}.tsx")

def migrate_page(input_path: str, dry_run: bool = True) -> Tuple[bool, str]:
    """Migrate a single page"""
    try:
        # Read source file
        with open(input_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Get component name and output path
        component_name = get_component_name(input_path)
        output_path = get_output_path(input_path)

        # Convert content
        converted = convert_page_content(content, component_name.replace("Page", ""))

        # Ensure export default matches component name
        converted = re.sub(
            r"export default function \w+",
            f"export default function {component_name}",
            converted
        )

        if dry_run:
            return True, f"Would create: {output_path}"

        # Create output directory
        os.makedirs(os.path.dirname(output_path), exist_ok=True)

        # Write output file
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(converted)

        return True, f"Created: {output_path}"

    except Exception as e:
        return False, f"Error migrating {input_path}: {str(e)}"

def find_all_pages() -> List[str]:
    """Find all Next.js page files"""
    pages = []
    for root, dirs, files in os.walk(NEXTJS_BASE):
        if "page.tsx" in files:
            pages.append(os.path.join(root, "page.tsx"))
    return sorted(pages)

def main():
    import argparse

    parser = argparse.ArgumentParser(description="Migrate Next.js pages to React")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be done without doing it")
    parser.add_argument("--section", choices=["admin", "tenant", "global", "docs", "auth", "all"],
                       default="all", help="Section to migrate")

    args = parser.parse_args()

    # Find all pages
    all_pages = find_all_pages()

    # Filter by section if specified
    if args.section != "all":
        all_pages = [p for p in all_pages if f"/{args.section}/" in p or f"\\{args.section}\\" in p]

    print(f"Found {len(all_pages)} pages to migrate")
    print("=" * 80)

    success_count = 0
    error_count = 0

    for page in all_pages:
        success, message = migrate_page(page, dry_run=args.dry_run)

        if success:
            print(f"✓ {message}")
            success_count += 1
        else:
            print(f"✗ {message}")
            error_count += 1

    print("=" * 80)
    print(f"\nMigration Summary:")
    print(f"  Successful: {success_count}")
    print(f"  Errors: {error_count}")
    print(f"  Total: {len(all_pages)}")

    if args.dry_run:
        print("\nThis was a dry run. Use --dry-run=false to actually migrate files.")

if __name__ == "__main__":
    main()
