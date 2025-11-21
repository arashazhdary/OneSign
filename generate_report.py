#!/usr/bin/env python3
"""
Generate Markdown Report for Gap Analysis
"""

import json
from collections import defaultdict
from datetime import datetime

def load_gap_analysis():
    """Load gap analysis results"""
    with open('/home/user/OneSign/GAP_ANALYSIS.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def generate_markdown_report(data):
    """Generate comprehensive markdown report"""

    summary = data['summary']
    unmapped = data['unmappedEndpoints']
    category_summary = data['categorySummary']

    md = []

    # Header
    md.append("# 📊 Gap Analysis Report - OneSign Platform")
    md.append("")
    md.append(f"**تاریخ تحلیل:** {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    md.append("")
    md.append("---")
    md.append("")

    # Executive Summary
    md.append("## 🎯 خلاصه اجرایی")
    md.append("")
    md.append(f"- **تعداد کل Endpoint های Backend:** {summary['totalBackendEndpoints']}")
    md.append(f"- **تعداد API Call های Frontend:** {summary['totalFrontendApiCalls']}")
    md.append(f"- **Endpoint های Connected:** {summary['mappedEndpoints']}")
    md.append(f"- **Endpoint های بدون صفحه:** {summary['unmappedEndpoints']}")
    md.append(f"- **درصد Coverage:** {summary['percentageConnected']}%")
    md.append("")

    # Coverage visualization
    connected = summary['mappedEndpoints']
    unmapped_count = summary['unmappedEndpoints']
    coverage_bar = "█" * int(summary['percentageConnected'] / 5)
    empty_bar = "░" * (20 - int(summary['percentageConnected'] / 5))
    md.append(f"**Coverage Bar:** `{coverage_bar}{empty_bar}` {summary['percentageConnected']}%")
    md.append("")

    # Status
    if summary['percentageConnected'] < 30:
        md.append("⚠️ **وضعیت:** نیاز به توسعه گسترده Frontend")
    elif summary['percentageConnected'] < 60:
        md.append("⚠️ **وضعیت:** نیاز به تکمیل صفحات")
    else:
        md.append("✅ **وضعیت:** Coverage خوب")
    md.append("")
    md.append("---")
    md.append("")

    # Priority Summary
    md.append("## 🔥 خلاصه بر اساس اولویت")
    md.append("")

    priority_count = defaultdict(int)
    priority_by_category = defaultdict(lambda: defaultdict(int))

    for item in unmapped:
        priority = item['recommendation']['priority']
        category = item['category']
        priority_count[priority] += 1
        priority_by_category[priority][category] += 1

    priorities_order = ['Critical', 'High', 'Medium', 'Low']
    for priority in priorities_order:
        count = priority_count.get(priority, 0)
        if count > 0:
            icon = "🔴" if priority == "Critical" else "🟠" if priority == "High" else "🟡" if priority == "Medium" else "🟢"
            md.append(f"### {icon} {priority} Priority")
            md.append("")
            md.append(f"**تعداد:** {count} endpoint")
            md.append("")

            if priority in priority_by_category:
                md.append("**توزیع بر اساس دسته:**")
                for cat, cnt in sorted(priority_by_category[priority].items(), key=lambda x: -x[1]):
                    md.append(f"- {cat}: {cnt} endpoint")
                md.append("")

    md.append("---")
    md.append("")

    # Category Summary
    md.append("## 📂 خلاصه بر اساس دسته‌بندی")
    md.append("")
    md.append("| دسته | تعداد بدون صفحه | اولویت |")
    md.append("|------|-----------------|--------|")

    for category, info in sorted(category_summary.items(), key=lambda x: -x[1]['unmapped']):
        priority_icon = "🔴" if info['priority'] == "Critical" else "🟠" if info['priority'] == "High" else "🟡" if info['priority'] == "Medium" else "🟢"
        md.append(f"| {category} | {info['unmapped']} | {priority_icon} {info['priority']} |")

    md.append("")
    md.append("---")
    md.append("")

    # Portal & Section Summary
    md.append("## 🏢 توزیع بر اساس Portal و Section")
    md.append("")

    portal_section_count = defaultdict(lambda: defaultdict(int))
    for item in unmapped:
        portal = item['recommendation']['portal']
        section = item['recommendation']['section']
        portal_section_count[portal][section] += 1

    for portal, sections in portal_section_count.items():
        md.append(f"### {portal}")
        md.append("")
        for section, count in sorted(sections.items(), key=lambda x: -x[1]):
            md.append(f"- **{section}:** {count} endpoint")
        md.append("")

    md.append("---")
    md.append("")

    # Page Type Summary
    md.append("## 📄 توزیع بر اساس نوع صفحه")
    md.append("")

    page_type_count = defaultdict(int)
    for item in unmapped:
        page_type = item['recommendation']['pageType']
        page_type_count[page_type] += 1

    md.append("| نوع صفحه | تعداد |")
    md.append("|----------|-------|")
    for page_type, count in sorted(page_type_count.items(), key=lambda x: -x[1]):
        md.append(f"| {page_type} | {count} |")

    md.append("")
    md.append("---")
    md.append("")

    # Detailed List by Category
    md.append("## 📋 لیست جامع Endpoint های بدون صفحه")
    md.append("")

    # Group by category
    by_category = defaultdict(list)
    for item in unmapped:
        by_category[item['category']].append(item)

    # Sort categories by priority
    priority_order = {'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3}

    def category_sort_key(cat_name):
        cat_info = category_summary.get(cat_name, {})
        priority = cat_info.get('priority', 'Low')
        return (priority_order.get(priority, 4), -cat_info.get('unmapped', 0))

    sorted_categories = sorted(by_category.keys(), key=category_sort_key)

    for category in sorted_categories:
        items = by_category[category]
        cat_info = category_summary[category]
        priority_icon = "🔴" if cat_info['priority'] == "Critical" else "🟠" if cat_info['priority'] == "High" else "🟡" if cat_info['priority'] == "Medium" else "🟢"

        md.append(f"### {priority_icon} {category}")
        md.append("")
        md.append(f"**تعداد:** {len(items)} endpoint | **اولویت:** {cat_info['priority']}")
        md.append("")

        # Group by controller
        by_controller = defaultdict(list)
        for item in items:
            by_controller[item['controller']].append(item)

        for controller, controller_items in sorted(by_controller.items()):
            md.append(f"#### {controller}")
            md.append("")

            for item in sorted(controller_items, key=lambda x: (priority_order.get(x['recommendation']['priority'], 4), x['endpoint']['route'])):
                endpoint = item['endpoint']
                rec = item['recommendation']

                method_badge = {
                    'GET': '🔵 GET',
                    'POST': '🟢 POST',
                    'PUT': '🟡 PUT',
                    'PATCH': '🟠 PATCH',
                    'DELETE': '🔴 DELETE'
                }.get(endpoint['method'], endpoint['method'])

                md.append(f"##### {method_badge} `{endpoint['route']}`")
                md.append("")
                md.append(f"**توضیحات:** {endpoint['description']}")
                md.append("")
                md.append("**پیشنهاد پیاده‌سازی:**")
                md.append("")
                md.append(f"- **Portal:** `{rec['portal']}`")
                md.append(f"- **Section:** `{rec['section']}`")
                md.append(f"- **Route پیشنهادی:** `{rec['suggestedRoute']}`")
                md.append(f"- **نوع صفحه:** `{rec['pageType']}`")
                md.append(f"- **اولویت:** `{rec['priority']}`")

                if rec['canBeAddedToExistingPage']:
                    md.append(f"- **افزودن به صفحه موجود:** ✅ بله - `{rec['existingPage']}`")
                else:
                    md.append(f"- **افزودن به صفحه موجود:** ❌ نیاز به صفحه جدید")

                md.append(f"- **یادداشت:** {rec['notes']}")
                md.append("")

        md.append("---")
        md.append("")

    # Implementation Roadmap
    md.append("## 🗺️ Roadmap پیاده‌سازی")
    md.append("")
    md.append("### Phase 1: Critical & High Priority (0-3 ماه)")
    md.append("")

    phase1_items = [item for item in unmapped if item['recommendation']['priority'] in ['Critical', 'High']]
    phase1_by_category = defaultdict(list)
    for item in phase1_items:
        phase1_by_category[item['category']].append(item)

    for category, items in sorted(phase1_by_category.items(), key=lambda x: -len(x[1])):
        md.append(f"#### {category} ({len(items)} endpoints)")
        md.append("")

        # Group by suggested page
        by_route = defaultdict(list)
        for item in items:
            route = item['recommendation']['suggestedRoute']
            by_route[route].append(item)

        for route, route_items in sorted(by_route.items()):
            page_type = route_items[0]['recommendation']['pageType']
            methods = [item['endpoint']['method'] for item in route_items]
            md.append(f"- **صفحه:** `{route}` ({page_type})")
            md.append(f"  - **Endpoints:** {', '.join(set(methods))}")
            md.append(f"  - **تعداد:** {len(route_items)} endpoint")
        md.append("")

    md.append("**تخمین زمان:** 2-3 ماه")
    md.append("")
    md.append("---")
    md.append("")

    md.append("### Phase 2: Medium Priority (3-6 ماه)")
    md.append("")

    phase2_items = [item for item in unmapped if item['recommendation']['priority'] == 'Medium']
    md.append(f"**تعداد کل:** {len(phase2_items)} endpoints")
    md.append("")

    phase2_by_category = defaultdict(int)
    for item in phase2_items:
        phase2_by_category[item['category']] += 1

    for category, count in sorted(phase2_by_category.items(), key=lambda x: -x[1]):
        md.append(f"- {category}: {count} endpoints")

    md.append("")
    md.append("**تخمین زمان:** 3-4 ماه")
    md.append("")
    md.append("---")
    md.append("")

    md.append("### Phase 3: Low Priority (6-12 ماه)")
    md.append("")

    phase3_items = [item for item in unmapped if item['recommendation']['priority'] == 'Low']
    md.append(f"**تعداد کل:** {len(phase3_items)} endpoints")
    md.append("")

    phase3_by_category = defaultdict(int)
    for item in phase3_items:
        phase3_by_category[item['category']] += 1

    for category, count in sorted(phase3_by_category.items(), key=lambda x: -x[1]):
        md.append(f"- {category}: {count} endpoints")

    md.append("")
    md.append("**تخمین زمان:** 4-6 ماه")
    md.append("")
    md.append("---")
    md.append("")

    # Time Estimation
    md.append("## ⏱️ تخمین زمان کلی")
    md.append("")

    # Calculate based on page types
    time_per_type = {
        'List View': 3,
        'Detail View': 2,
        'Form': 4,
        'Dashboard': 5,
        'Settings Form': 4,
        'Search/Query Interface': 5,
        'Feature Page': 3
    }

    total_days = 0
    for item in unmapped:
        page_type = item['recommendation']['pageType']
        total_days += time_per_type.get(page_type, 3)

    # Account for reuse (40% reduction due to similar pages)
    total_days = int(total_days * 0.6)

    weeks = total_days / 5
    months = weeks / 4

    md.append(f"- **تخمین کل:** {total_days} روز کاری (~{int(weeks)} هفته یا ~{int(months)} ماه)")
    md.append(f"- **با تیم 2 نفره:** ~{int(months/2)} ماه")
    md.append(f"- **با تیم 3 نفره:** ~{int(months/3)} ماه")
    md.append("")
    md.append("*توجه: این تخمین‌ها شامل طراحی UI/UX، توسعه، تست و integration هستند.*")
    md.append("")
    md.append("---")
    md.append("")

    # Recommendations
    md.append("## 💡 توصیه‌ها")
    md.append("")
    md.append("### اولویت‌های فوری")
    md.append("")
    md.append("1. **Security Management Features**")
    md.append("   - MFA Settings & Management")
    md.append("   - Security Policy Configuration")
    md.append("   - Trusted Devices Management")
    md.append("")
    md.append("2. **Identity & Access Management**")
    md.append("   - User Profile Management")
    md.append("   - Privileged Access Management")
    md.append("   - Access Request Workflow")
    md.append("")
    md.append("3. **Monitoring & Analytics**")
    md.append("   - Security Incidents Details")
    md.append("   - Risk Events Management")
    md.append("   - Audit Log Advanced Search")
    md.append("")
    md.append("### صفحات پیشنهادی برای Phase 1")
    md.append("")

    # Find top critical pages
    critical_routes = defaultdict(list)
    for item in unmapped:
        if item['recommendation']['priority'] == 'Critical':
            route = item['recommendation']['suggestedRoute']
            critical_routes[route].append(item)

    for i, (route, items) in enumerate(sorted(critical_routes.items(), key=lambda x: -len(x[1]))[:10], 1):
        page_type = items[0]['recommendation']['pageType']
        portal = items[0]['recommendation']['portal']
        md.append(f"{i}. **`{route}`** ({page_type}) - {portal}")
        md.append(f"   - {len(items)} endpoints")

    md.append("")
    md.append("---")
    md.append("")

    # Quick Stats
    md.append("## 📈 آمار سریع")
    md.append("")
    md.append("```")
    md.append(f"Total Backend Endpoints:     {summary['totalBackendEndpoints']}")
    md.append(f"Frontend API Calls:          {summary['totalFrontendApiCalls']}")
    md.append(f"Connected:                   {summary['mappedEndpoints']} ({summary['percentageConnected']}%)")
    md.append(f"Unmapped:                    {summary['unmappedEndpoints']}")
    md.append("")
    md.append("By Priority:")
    for priority in priorities_order:
        count = priority_count.get(priority, 0)
        md.append(f"  {priority:12} {count:4} endpoints")
    md.append("")
    md.append("By Portal:")
    for portal, sections in portal_section_count.items():
        total = sum(sections.values())
        md.append(f"  {portal:20} {total:4} endpoints")
    md.append("```")
    md.append("")

    # Footer
    md.append("---")
    md.append("")
    md.append("**تاریخ تولید گزارش:** " + datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    md.append("")
    md.append("*این گزارش به صورت خودکار تولید شده است.*")

    return '\n'.join(md)

def main():
    """Main function"""
    data = load_gap_analysis()
    report = generate_markdown_report(data)

    with open('/home/user/OneSign/GAP_ANALYSIS_REPORT.md', 'w', encoding='utf-8') as f:
        f.write(report)

    print("✓ Markdown report generated: GAP_ANALYSIS_REPORT.md")

if __name__ == '__main__':
    main()
