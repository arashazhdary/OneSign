#!/usr/bin/env python3
"""
Gap Analysis Script
Compares backend endpoints with frontend API calls to find unmapped endpoints.
"""

import json
import re
from collections import defaultdict
from datetime import datetime

def normalize_endpoint(method, route, tenantId=None):
    """Normalize endpoint for comparison"""
    # Remove query parameters
    route = route.split('?')[0]

    # Replace path parameters with placeholder
    route = re.sub(r'\{[^}]+\}', '{id}', route)

    return f"{method.upper()} {route}"

def extract_backend_endpoints(backend_data):
    """Extract all endpoints from backend"""
    endpoints = []

    for controller in backend_data['controllers']:
        for endpoint in controller['endpoints']:
            endpoints.append({
                'controller': controller['name'],
                'category': controller['category'],
                'method': endpoint['method'],
                'route': endpoint['route'],
                'action': endpoint['action'],
                'description': endpoint['description'],
                'normalized': normalize_endpoint(endpoint['method'], endpoint['route'])
            })

    return endpoints

def extract_frontend_endpoints(frontend_data):
    """Extract all API calls from frontend pages"""
    api_calls = []

    for page in frontend_data['pages']:
        for api_call in page.get('apiCalls', []):
            # Extract method and endpoint
            method = api_call['method']
            endpoint = api_call['endpoint']

            # Remove query parameters for comparison
            endpoint_clean = endpoint.split('?')[0]

            api_calls.append({
                'method': method,
                'endpoint': endpoint_clean,
                'page': page['route'],
                'portal': page['portal'],
                'normalized': normalize_endpoint(method, endpoint_clean)
            })

    return api_calls

def categorize_priority(category, controller_name, endpoint):
    """Determine priority of unmapped endpoint"""

    # Critical priorities
    critical_categories = ['Security Management', 'Authentication & Discovery']
    critical_keywords = ['security', 'auth', 'login', 'password', 'mfa', 'policy']

    # High priorities
    high_categories = ['Identity Management', 'Access Management', 'Security Monitoring']
    high_keywords = ['user', 'incident', 'risk', 'access']

    # Check category
    if category in critical_categories:
        return 'Critical'
    if category in high_categories:
        return 'High'

    # Check keywords
    route_lower = endpoint['route'].lower()
    desc_lower = endpoint['description'].lower()
    combined = route_lower + ' ' + desc_lower

    if any(kw in combined for kw in critical_keywords):
        return 'Critical'
    if any(kw in combined for kw in high_keywords):
        return 'High'

    # Medium by default for tenant endpoints
    if '/api/tenant/' in endpoint['route']:
        return 'Medium'

    return 'Low'

def suggest_page_type(endpoint):
    """Suggest page type based on endpoint"""
    method = endpoint['method']
    route = endpoint['route'].lower()
    description = endpoint['description'].lower()

    if 'dashboard' in route or 'overview' in route or 'summary' in route:
        return 'Dashboard'
    elif method == 'GET' and ('{id}' in route or 'details' in description):
        return 'Detail View'
    elif method == 'GET' and ('list' in description or 'دریافت' in description):
        return 'List View'
    elif method in ['POST', 'PUT'] and ('create' in description or 'update' in description or 'ایجاد' in description):
        return 'Form'
    elif 'settings' in route or 'config' in route or 'policy' in route:
        return 'Settings Form'
    elif 'search' in route or 'query' in route:
        return 'Search/Query Interface'
    else:
        return 'Feature Page'

def suggest_portal_and_section(endpoint):
    """Suggest portal and section for endpoint"""
    route = endpoint['route']

    if '/api/global/' in route:
        return 'admin-portal', 'global'
    elif '/api/admin/' in route:
        return 'admin-portal', 'admin'
    elif '/api/tenant/' in route:
        return 'admin-portal', 'tenant'
    elif '/api/auth/' in route or '/connect/' in route:
        return 'login-portal', 'auth'
    elif '/api/user/' in route:
        return 'admin-portal', 'tenant'
    else:
        return 'admin-portal', 'global'

def suggest_route(endpoint, category):
    """Suggest frontend route for endpoint"""
    route = endpoint['route']
    portal, section = suggest_portal_and_section(endpoint)

    # Extract resource name from route
    parts = route.split('/')
    resource = None

    for i, part in enumerate(parts):
        if part in ['api', 'tenant', 'global', 'admin', 'auth', 'user']:
            continue
        if not part.startswith('{'):
            resource = part
            break

    if not resource:
        resource = 'feature'

    if section == 'global':
        return f'/global/{resource}'
    elif section == 'admin':
        return f'/admin/{resource}'
    elif section == 'tenant':
        return f'/tenant/{resource}'
    else:
        return f'/{resource}'

def can_add_to_existing(endpoint, frontend_calls):
    """Check if endpoint can be added to existing page"""
    # Extract base resource
    route = endpoint['route']
    parts = route.split('/')

    # Find similar routes in frontend
    for call in frontend_calls:
        call_parts = call['endpoint'].split('/')

        # Check if they share the same resource
        common_parts = []
        for i in range(min(len(parts), len(call_parts))):
            if parts[i] == call_parts[i] or ('{' in parts[i] and '{' in call_parts[i]):
                common_parts.append(parts[i])
            else:
                break

        # If they share at least 3 parts, they're related
        if len(common_parts) >= 3:
            return True, call['page']

    return False, None

def perform_gap_analysis():
    """Main gap analysis function"""

    # Load data
    with open('/home/user/OneSign/BACKEND_ENDPOINTS_ANALYSIS.json', 'r', encoding='utf-8') as f:
        backend_data = json.load(f)

    with open('/home/user/OneSign/FRONTEND_PAGES_ANALYSIS.json', 'r', encoding='utf-8') as f:
        frontend_data = json.load(f)

    # Extract endpoints
    backend_endpoints = extract_backend_endpoints(backend_data)
    frontend_calls = extract_frontend_endpoints(frontend_data)

    # Create set of frontend normalized endpoints
    frontend_normalized = set(call['normalized'] for call in frontend_calls)

    # Find unmapped endpoints
    unmapped = []
    for endpoint in backend_endpoints:
        if endpoint['normalized'] not in frontend_normalized:
            unmapped.append(endpoint)

    # Categorize and add recommendations
    unmapped_with_recommendations = []
    category_summary = defaultdict(lambda: {'unmapped': 0, 'priority': 'Low', 'endpoints': []})

    for endpoint in unmapped:
        priority = categorize_priority(endpoint['category'], endpoint['controller'], endpoint)
        page_type = suggest_page_type(endpoint)
        portal, section = suggest_portal_and_section(endpoint)
        suggested_route = suggest_route(endpoint, endpoint['category'])
        can_add, existing_page = can_add_to_existing(endpoint, frontend_calls)

        # Determine notes
        notes = []
        if endpoint['method'] in ['GET']:
            notes.append('احتمالاً نیاز به نمایش داده دارد')
        if endpoint['method'] in ['POST', 'PUT', 'DELETE']:
            notes.append('نیاز به فرم یا اکشن دارد')
        if 'admin' in endpoint['route']:
            notes.append('فقط برای Global Admin')
        if 'export' in endpoint['route'].lower():
            notes.append('قابلیت Export داده')
        if 'search' in endpoint['route'].lower() or 'query' in endpoint['route'].lower():
            notes.append('نیاز به رابط جستجو')

        recommendation = {
            'portal': portal,
            'section': section,
            'suggestedRoute': suggested_route,
            'pageType': page_type,
            'priority': priority,
            'canBeAddedToExistingPage': can_add,
            'existingPage': existing_page if can_add else None,
            'notes': ' | '.join(notes) if notes else 'صفحه جدید مورد نیاز'
        }

        unmapped_with_recommendations.append({
            'controller': endpoint['controller'],
            'category': endpoint['category'],
            'endpoint': {
                'method': endpoint['method'],
                'route': endpoint['route'],
                'action': endpoint['action'],
                'description': endpoint['description']
            },
            'recommendation': recommendation
        })

        # Update category summary
        category_summary[endpoint['category']]['unmapped'] += 1
        category_summary[endpoint['category']]['endpoints'].append(endpoint['route'])

        # Update priority
        if priority == 'Critical':
            category_summary[endpoint['category']]['priority'] = 'Critical'
        elif priority == 'High' and category_summary[endpoint['category']]['priority'] != 'Critical':
            category_summary[endpoint['category']]['priority'] = 'High'
        elif priority == 'Medium' and category_summary[endpoint['category']]['priority'] not in ['Critical', 'High']:
            category_summary[endpoint['category']]['priority'] = 'Medium'

    # Calculate statistics
    total_backend = len(backend_endpoints)
    total_frontend = len(frontend_calls)
    unmapped_count = len(unmapped)
    mapped_count = total_backend - unmapped_count
    percentage_connected = round((mapped_count / total_backend) * 100, 2)

    # Prepare category summary for output
    category_summary_output = {}
    for category, data in category_summary.items():
        category_summary_output[category] = {
            'unmapped': data['unmapped'],
            'priority': data['priority']
        }

    # Create output
    output = {
        'summary': {
            'totalBackendEndpoints': total_backend,
            'totalFrontendApiCalls': total_frontend,
            'mappedEndpoints': mapped_count,
            'unmappedEndpoints': unmapped_count,
            'percentageConnected': percentage_connected,
            'analysisDate': datetime.now().isoformat()
        },
        'unmappedEndpoints': unmapped_with_recommendations,
        'categorySummary': category_summary_output
    }

    # Save to JSON
    with open('/home/user/OneSign/GAP_ANALYSIS.json', 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"✓ Gap Analysis Complete!")
    print(f"  Total Backend Endpoints: {total_backend}")
    print(f"  Total Frontend API Calls: {total_frontend}")
    print(f"  Mapped Endpoints: {mapped_count}")
    print(f"  Unmapped Endpoints: {unmapped_count}")
    print(f"  Coverage: {percentage_connected}%")
    print(f"\n✓ Results saved to GAP_ANALYSIS.json")

    return output

if __name__ == '__main__':
    perform_gap_analysis()
