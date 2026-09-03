# Phases.md — Build Plan

Each phase should be completable, testable, and reviewable on its own before moving to the next. Do not start Phase N+1 until Phase N's output has been checked.

## Phase 0 — Setup
- Create folder structure per Architecture.md
- Place CSV in `data/`
- Initialize `requirements.txt` (pandas, streamlit, plotly)
- **Output:** empty-but-runnable Streamlit app that just loads and displays the raw dataframe

## Phase 1 — Data Validation & Loading
- Build `data_loader.py`: `load_data()` + `validate_data()`
- Validation checks:
  - `InStoreOrders + UberEatsOrders + DoorDashOrders + SelfDeliveryOrders == MonthlyOrders` (flag rows where it doesn't, within rounding tolerance)
  - `InStoreShare + UE_share + DD_share + SD_share ≈ 1.0` (or 100, depending on scale used in file)
  - Flag outliers: AOV outside $29.79–$47.23, GrowthFactor outside 0.99–1.05, CommissionRate/COGSRate/OPEXRate outside stated ranges
- **Output:** a validation report (console + a Streamlit "Data Quality" tab) listing any rows/columns that fail checks

## Phase 2 — Core Metrics Layer
- Build `metrics.py`:
  - `channel_order_share()` — market-wide and grouped
  - `aggregator_dependence_index()` — UE_share + DD_share per restaurant
  - `diversification_score()` — e.g. 1 − Herfindahl index across 4 shares
  - `risk_flag()` — True if any single channel share ≥ 70%
  - Profit-per-order per channel (NetProfit / OrderCount per channel)
- **Output:** unit-testable functions, verified against a handful of manually-checked rows

## Phase 3 — Streamlit Dashboard, Core Views
- Sidebar filters (subregion, cuisine, segment, channel toggle)
- Overview tab: total orders/revenue/profit by channel (market-wide)
- Subregion heatmap tab
- **Output:** working dashboard with 2 tabs, filters functioning

## Phase 4 — Streamlit Dashboard, Remaining Views
- Cuisine vs. channel distribution tab
- Segment reliance tab
- Dependency risk panel (flagged restaurant list + diversification score distribution)
- Restaurant drill-down tab
- **Output:** all 6 core features from PRD §6 present and working

## Phase 5 — Research Paper
- Write `reports/research_paper.md` using outputs from Phases 1–4:
  - Data validation summary
  - Channel volume aggregation (overall, by subregion, cuisine, segment)
  - Market share analysis and ranking
  - Geographic channel preference findings
  - Cuisine & segment channel patterns
  - Dependency risk findings + recommendations
- **Output:** complete research paper, chart images/exports embedded or referenced

## Phase 6 — Executive Summary
- Condense Phase 5 into `reports/executive_summary.md`: headline findings, 3–5 recommendations, no methodology detail
- **Output:** 1–2 page stakeholder-ready summary

## Phase 7 — Polish
- Apply Design.md styling to the Streamlit app
- Add README with run instructions
- Final pass on error handling per Rules.md
- **Output:** presentable, shareable v1

## Suggested Order of Work
Phase 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 (sequential; each phase's output is a prerequisite for the next)
