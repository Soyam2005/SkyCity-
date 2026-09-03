# PRD.md — Project Requirements Document
## Order Channel Performance & Market Share Analytics — SkyCity Auckland Restaurants & Bars

## 1. Purpose
Restaurant operators and analysts in Auckland currently have raw channel-level order/revenue data but no consolidated way to see:
- How dependent each restaurant is on a single channel (especially Uber Eats / DoorDash)
- Which channels dominate in which subregions
- How cuisine type and business segment shape channel mix

This project turns that raw data into (a) a research-style analysis, (b) a live Streamlit dashboard, and (c) an executive summary — so decisions about channel strategy stop being intuition-based.

## 2. Target Users
| User | What they need |
|---|---|
| Restaurant operators / franchise owners | See their own branch's channel dependency risk and profit-per-channel |
| Market analysts / consultants | Aggregate market share, geographic and cuisine-level trends |
| Government / hospitality stakeholders | High-level executive summary of market health and risk |

## 3. Data Source
Single CSV: `SkyCity_Auckland_Restaurants___Bars.csv`
- 1,696 restaurant-branch rows
- 30 columns spanning identity (RestaurantID, Name, CuisineType, Segment, Subregion), volumes and revenue per channel (In-Store, Uber Eats, DoorDash, Self-Delivery), cost structure (COGSRate, OPEXRate, CommissionRate, DeliveryCostPerOrder), net profit per channel, and pre-computed share columns (InStoreShare, UE_share, DD_share, SD_share)
- CuisineType: Burgers, Chicken Dishes, Chinese, Indian, Japanese, Kebabs/Mediterranean, Pizza, Thai
- Segment: Cafe, QSR, Ghost Kitchen, Full-service
- Subregion: North Shore, South Auckland, West Auckland, CBD

## 4. Primary Objectives
- Quantify total order volume by channel (market-wide and per restaurant)
- Measure channel share distribution across restaurants
- Identify dominant ordering channels by subregion

## 5. Secondary Objectives
- Compare channel mix across cuisine types
- Assess channel diversity vs. dependency per restaurant
- Support strategic channel planning recommendations

## 6. Core Features (Streamlit App)
1. **Overview dashboard** — total orders/revenue/profit by channel, market-wide split
2. **Subregion heatmap** — channel dominance across North Shore / South Auckland / West Auckland / CBD
3. **Cuisine vs. channel distribution** — stacked/grouped charts by CuisineType
4. **Segment view** — channel reliance by Cafe / QSR / Ghost Kitchen / Full-service
5. **Dependency risk panel** — flags restaurants with ≥70% reliance on a single aggregator (Uber Eats or DoorDash), plus a diversification score
6. **Filters** — subregion selector, cuisine multiselect, segment selector, channel toggle (In-Store vs. Delivery aggregate)
7. **Restaurant drill-down** — select one RestaurantID/Name to see its individual channel mix and profit breakdown

## 7. KPIs to Surface
| KPI | Definition |
|---|---|
| Channel Order Share (%) | Each channel's % of MonthlyOrders, market-wide or filtered |
| Aggregator Dependence Index | UE_share + DD_share per restaurant |
| In-Store Reliance Ratio | InStoreShare per restaurant |
| Channel Diversification Score | e.g. 1 − Herfindahl index across the 4 channel shares (higher = more balanced) |
| Subregion Channel Dominance | Leading channel per subregion by aggregated share |

## 8. Deliverables
1. Research paper (EDA, insights, recommendations) — Markdown/PDF
2. Streamlit dashboard (live analytics)
3. Executive summary (1–2 pages, non-technical)

## 9. Out of Scope (v1)
- Forecasting/predictive modeling (despite the brief's "Forecasting Methodology" heading, the actual steps described are descriptive/diagnostic analytics, not a trained forecast model — flagged for clarification, not built by default)
- Real-time data ingestion (dataset is a static CSV snapshot)
- User authentication / multi-tenant restaurant logins

## 10. Success Criteria
- All data validation checks pass or discrepancies are explicitly documented
- Dashboard loads the full dataset and responds to filters without errors
- Every KPI in Section 7 is visible and correctly computed against the raw columns
- Executive summary is readable by a non-technical stakeholder in under 5 minutes
