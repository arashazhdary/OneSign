#!/usr/bin/env python3
"""
Script to analyze C# controllers and find unmapped endpoints in frontend
"""
import os
import re
import json
import glob
from pathlib import Path

# Paths
CONTROLLERS_PATH = "/home/user/OneSign/src/Onesign.Api/Controllers/Tenant/"
FRONTEND_PATH = "/home/user/OneSign/onesign-admin-portal/"
OUTPUT_FILE = "/home/user/OneSign/TENANT_UNMAPPED_ENDPOINTS.json"

def extract_route_from_controller(controller_path):
    """Extract the base route from controller file"""
    with open(controller_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find [Route("...")] attribute
    route_match = re.search(r'\[Route\("([^"]+)"\)\]', content)
    if route_match:
        return route_match.group(1)
    return None

def extract_endpoints_from_controller(controller_path):
    """Extract all HTTP endpoints from a controller"""
    with open(controller_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    base_route = extract_route_from_controller(controller_path)
    if not base_route:
        return []

    endpoints = []
    i = 0
    while i < len(lines):
        line = lines[i].strip()

        # Look for HTTP method attributes
        http_methods = ['HttpGet', 'HttpPost', 'HttpPut', 'HttpDelete', 'HttpPatch']
        method_found = None
        route_suffix = ""

        for method in http_methods:
            if f'[{method}' in line:
                method_found = method.replace('Http', '').upper()

                # Extract route if specified
                route_match = re.search(r'\[' + method + r'\("([^"]+)"\)\]', line)
                if route_match:
                    route_suffix = "/" + route_match.group(1)
                elif f'[{method}]' in line:
                    route_suffix = ""

                # Look ahead to find the method name
                j = i + 1
                while j < len(lines):
                    next_line = lines[j].strip()
                    # Look for method declaration
                    method_match = re.search(r'public\s+async\s+Task<[^>]+>\s+(\w+)\s*\(', next_line)
                    if not method_match:
                        method_match = re.search(r'public\s+Task<[^>]+>\s+(\w+)\s*\(', next_line)
                    if not method_match:
                        method_match = re.search(r'public\s+async\s+(\w+)\s*\(', next_line)
                    if not method_match:
                        method_match = re.search(r'public\s+ActionResult<[^>]+>\s+(\w+)\s*\(', next_line)

                    if method_match:
                        action_name = method_match.group(1)
                        full_route = base_route + route_suffix
                        endpoints.append({
                            'method': method_found,
                            'route': full_route,
                            'action': action_name,
                            'inController': controller_path
                        })
                        break
                    j += 1
                    if j - i > 10:  # Don't look too far ahead
                        break
                break

        i += 1

    return endpoints

def search_endpoint_in_frontend(route, method):
    """Search if an endpoint is used in frontend files"""
    # Extract the path part after /api/tenant/
    if '/api/tenant/' in route:
        search_term = route.replace('/api/tenant/', '')
        # Remove parameters like {id}, {tenantUserId}, etc.
        search_term = re.sub(r'\{[^}]+\}', '', search_term)
        # Remove trailing slashes
        search_term = search_term.strip('/')

        # Search in all frontend files
        frontend_files = []
        for ext in ['*.ts', '*.tsx', '*.js', '*.jsx']:
            frontend_files.extend(glob.glob(f"{FRONTEND_PATH}**/{ext}", recursive=True))

        for file_path in frontend_files:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()

                    # Look for the route in various formats
                    patterns = [
                        f'"{search_term}"',
                        f"'{search_term}'",
                        f'`{search_term}`',
                        f'/{search_term}',
                        search_term.replace('/', r'\/'),
                    ]

                    for pattern in patterns:
                        if pattern in content:
                            return True
            except:
                continue

    return False

def analyze_controllers():
    """Main function to analyze all controllers"""
    results = []

    # Get all controller files
    controller_files = glob.glob(os.path.join(CONTROLLERS_PATH, "*.cs"))

    print(f"Found {len(controller_files)} controllers")

    for controller_file in sorted(controller_files):
        controller_name = os.path.basename(controller_file).replace('.cs', '')
        print(f"\nAnalyzing {controller_name}...")

        endpoints = extract_endpoints_from_controller(controller_file)
        print(f"  Found {len(endpoints)} endpoints")

        unmapped_endpoints = []
        for endpoint in endpoints:
            is_used = search_endpoint_in_frontend(endpoint['route'], endpoint['method'])
            if not is_used:
                unmapped_endpoints.append(endpoint)
                print(f"    ❌ UNMAPPED: {endpoint['method']} {endpoint['route']}")
            else:
                print(f"    ✓ Mapped: {endpoint['method']} {endpoint['route']}")

        if unmapped_endpoints:
            results.append({
                'controllerName': controller_name,
                'unmappedEndpoints': unmapped_endpoints
            })

    return results

def main():
    print("Starting endpoint analysis...")
    results = analyze_controllers()

    # Save results to JSON
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    print(f"\n✅ Analysis complete! Results saved to {OUTPUT_FILE}")
    print(f"Total controllers with unmapped endpoints: {len(results)}")

    total_unmapped = sum(len(r['unmappedEndpoints']) for r in results)
    print(f"Total unmapped endpoints: {total_unmapped}")

if __name__ == '__main__':
    main()
