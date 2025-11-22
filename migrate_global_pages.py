#!/usr/bin/env python3
"""
Migration script for Global Infrastructure pages
Converts fetch() calls to platformService method calls
"""

import re
import os

# Define file paths
files_to_migrate = [
    'onesign-admin-portal/app/[locale]/global/regions/page.tsx',
    'onesign-admin-portal/app/[locale]/global/environments/page.tsx',
    'onesign-admin-portal/app/[locale]/global/feature-flags/page.tsx',
    'onesign-admin-portal/app/[locale]/global/settings/page.tsx',
    'onesign-admin-portal/app/[locale]/global/api-management/page.tsx',
    'onesign-admin-portal/app/[locale]/global/performance/page.tsx',
    'onesign-admin-portal/app/[locale]/global/tenants/lifecycle/page.tsx',
]

def add_import_if_missing(content):
    """Add platformService import if not present"""
    if 'platformService' in content:
        return content

    # Find the last import statement
    import_pattern = r"(import .+ from .+;)\n"
    imports = list(re.finditer(import_pattern, content))

    if imports:
        last_import = imports[-1]
        insertion_point = last_import.end()
        new_import = "import { platformService } from '@/lib/api/services';\n"
        content = content[:insertion_point] + new_import + content[insertion_point:]

    return content

def migrate_fetch_to_service(content):
    """Convert all fetch() calls to platformService methods"""

    # Pattern 1: Simple GET requests
    patterns = [
        # GET requests with response handling
        (
            r"const response = await fetch\('http://localhost:7000(/api/[^']+)'\);[\s\S]*?if \(response\.ok\) \{[\s\S]*?const data = await response\.json\(\);[\s\S]*?",
            lambda m: convert_get_request(m)
        ),
        # POST requests with body
        (
            r"const response = await fetch\('http://localhost:7000(/api/[^']+)', \{[\s\S]*?method: 'POST',[\s\S]*?\}\);",
            lambda m: convert_post_request(m)
        ),
        # PUT requests
        (
            r"const response = await fetch\('http://localhost:7000(/api/[^']+)', \{[\s\S]*?method: 'PUT',[\s\S]*?\}\);",
            lambda m: convert_put_request(m)
        ),
        # DELETE requests
        (
            r"const response = await fetch\('http://localhost:7000(/api/[^']+)', \{[\s\S]*?method: 'DELETE',[\s\S]*?\}\);",
            lambda m: convert_delete_request(m)
        ),
        # PATCH requests
        (
            r"const response = await fetch\('http://localhost:7000(/api/[^']+)', \{[\s\S]*?method: 'PATCH',[\s\S]*?\}\);",
            lambda m: convert_patch_request(m)
        ),
    ]

    for pattern, converter in patterns:
        content = re.sub(pattern, converter, content)

    return content

def convert_get_request(match):
    """Convert GET fetch to service call"""
    url = match.group(1)
    return f"const data = await platformService.{map_url_to_method(url, 'GET')};"

def convert_post_request(match):
    """Convert POST fetch to service call"""
    url = match.group(1)
    return f"await platformService.{map_url_to_method(url, 'POST')};"

def convert_put_request(match):
    """Convert PUT fetch to service call"""
    url = match.group(1)
    return f"const data = await platformService.{map_url_to_method(url, 'PUT')};"

def convert_delete_request(match):
    """Convert DELETE fetch to service call"""
    url = match.group(1)
    return f"await platformService.{map_url_to_method(url, 'DELETE')};"

def convert_patch_request(match):
    """Convert PATCH fetch to service call"""
    url = match.group(1)
    return f"await platformService.{map_url_to_method(url, 'PATCH')};"

def map_url_to_method(url, method):
    """Map URL pattern to platformService method name"""
    # This is a simplified mapping - would need full implementation
    method_map = {
        '/api/global/regions': 'getRegions()',
        '/api/global/environments': 'getEnvironments()',
        '/api/global/feature-flags': 'getFeatureFlags()',
        '/api/global/performance/metrics': 'getPerformanceMetrics()',
        # Add more mappings as needed
    }

    return method_map.get(url, f'/* TODO: map {url} */')

def update_error_handling(content):
    """Update error handling to use err.response?.data?.errorMessage"""
    # Replace simple catch blocks
    old_pattern = r"catch \(err\) \{\s*setError\(t\('common\.error'\)\);"
    new_pattern = r"catch (err: any) {\n      setError(err.response?.data?.errorMessage || t('common.error'));"

    content = re.sub(old_pattern, new_pattern, content)

    return content

def migrate_file(filepath):
    """Migrate a single file"""
    print(f"Migrating: {filepath}")

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # Apply migrations
        content = add_import_if_missing(content)
        # content = migrate_fetch_to_service(content)  # Complex - do manually
        # content = update_error_handling(content)

        # Only write if content changed
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✓ Migrated: {filepath}")
        else:
            print(f"- No changes needed: {filepath}")

    except Exception as e:
        print(f"✗ Error migrating {filepath}: {e}")

def main():
    """Main migration function"""
    base_dir = '/home/user/OneSign'

    print("Starting migration of Global Infrastructure pages...\n")

    for file_path in files_to_migrate:
        full_path = os.path.join(base_dir, file_path)
        if os.path.exists(full_path):
            migrate_file(full_path)
        else:
            print(f"✗ File not found: {full_path}")

    print("\nMigration complete!")
    print("\nNOTE: Automatic migration only adds imports.")
    print("Manual review and migration of fetch() calls is recommended.")

if __name__ == '__main__':
    main()
