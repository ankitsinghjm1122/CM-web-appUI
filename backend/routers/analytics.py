from fastapi import APIRouter
from typing import Dict, Any
try:
    from backend.database import get_all_customers, calculate_stats
except ImportError:
    from database import get_all_customers, calculate_stats
from datetime import datetime

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

@router.get("/metrics")
def get_analytics_metrics() -> Dict[str, Any]:
    customers = get_all_customers()
    stats = calculate_stats()
    total = stats["total"]

    # Company distribution
    company_counts = {}
    for c in customers:
        comp = c["company"]
        company_counts[comp] = company_counts.get(comp, 0) + 1

    sorted_companies = sorted(company_counts.items(), key=lambda x: x[1], reverse=True)
    unique_companies = len(company_counts)
    avg_per_company = round(total / (unique_companies or 1), 2)

    # Monthly breakdown
    monthly_counts = {}
    for c in customers:
        try:
            dt = datetime.fromisoformat(c["createdAt"].replace("Z", "+00:00"))
            m_key = dt.strftime("%B %Y")
            monthly_counts[m_key] = monthly_counts.get(m_key, 0) + 1
        except Exception:
            pass

    return {
        "stats": stats,
        "uniqueCompanies": unique_companies,
        "avgAccountsPerCompany": avg_per_company,
        "topCompany": sorted_companies[0] if sorted_companies else ("None", 0),
        "companyDistribution": [{"company": k, "count": v} for k, v in sorted_companies],
        "monthlyDistribution": [{"month": k, "count": v} for k, v in monthly_counts.items()]
    }
