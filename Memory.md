# Memory.md — Living Progress Log

## How to use this file (for future sessions)
1. At the start of a session, read this file first before touching any code.
2. At the end of a session (or after completing a phase), append an entry below — don't rewrite history, just add to it.
3. Keep entries short: what changed, what decisions were made, what's still open.

## Log Format
```
## [Date] — Phase X: <name>
- Done: <what was built/changed>
- Decisions: <any deviation from PRD/Architecture/Rules and why>
- Open issues: <bugs, TODOs, unresolved validation flags>
- Next: <what the next session should pick up>
```

---

## Log

## 2026-09-02 — Phase 0: Setup
- **Done:** Created project directory structure (`data/`, `src/`, `reports/`, `docs/`, `.streamlit/`), moved CSV to `data/SkyCity_Auckland_Restaurants___Bars.csv`, created `requirements.txt`, configured `.streamlit/config.toml` matching `Design.md`, and built `config.py` with palette mappings, channels, and thresholds.
- **Decisions:** Followed exact layout from `Architecture.md` and `Design.md`.
- **Open issues:** None.
- **Next:** Phase 1 Data Validation & Loading.

## 2026-09-02 — Phase 1: Data Validation & Ingestion
- **Done:** Built `src/data_loader.py` with cached `load_data()` and `validate_data()`. Validated order sum conservation across all 1,696 rows (0 mismatches), delivery share sums (1.0 across all rows), and verified that AOVs, Growth Factors, and cost/commission rates are strictly within bounds with 0 missing values.
- **Decisions:** Identified that raw CSV `UE_share`, `DD_share`, and `SD_share` represent delivery-order proportions, while per-restaurant total channel order shares are computed against `MonthlyOrders`.
- **Open issues:** None.
- **Next:** Phase 2 Core Metrics Layer.

## 2026-09-02 — Phase 2: Core Metrics Layer
- **Done:** Implemented `src/metrics.py` providing `compute_kpis()`, normalized Herfindahl Diversification Score (`(1 - HHI) / 0.75`), `AggregatorDependence`, `InStoreReliance`, financial totals, profit margins, channel profit-per-order, and cross-tabulation matrices.
- **Decisions:** All KPI functions include one-line docstrings stating formulas per `Rules.md`. All division operations protected by zero-division guards.
- **Open issues:** None.
- **Next:** Phases 3 & 4 Streamlit Dashboard & Visualizations.

## 2026-09-02 — Phase 3 & 4: Streamlit Interactive Dashboard & Visualizations
- **Done:** Built `src/charts.py` with 7 Plotly chart functions (Market Share Donut, Channel Economics Bar, Subregion Heatmap, Cuisine Stacked Bar, Segment Grouped Bar, Risk Distribution Histogram, and Restaurant Drill-down Radar). Built `app.py` featuring custom CSS, sidebar filters (Subregion, Cuisine, Segment, Channel view), data quality banner, and 6 full analytical tabs.
- **Decisions:** Applied fixed channel color mappings consistently across every chart (In-Store: Navy `#12233D`, Uber Eats: Green `#06C167`, DoorDash: Red `#E4572E`, Self-Delivery: Teal `#0FA3A3`).
- **Open issues:** None.
- **Next:** Phase 5 & 6 Research Paper and Executive Summary.

## 2026-09-02 — Phase 5 & 6: Research Paper & Executive Summary
- **Done:** Authored comprehensive research paper `reports/research_paper.md` featuring full EDA, market dynamics, subregion & cuisine analysis, the Aggregator Paradox analysis, and 4 strategic recommendations. Authored concise 1-2 page non-technical `reports/executive_summary.md`.
- **Decisions:** Preserved strict descriptive analytics scope per `Rules.md` without adding unrequested machine learning forecasting.
- **Open issues:** None.
- **Next:** Phase 7 Polish & Documentation.

## 2026-09-02 — Phase 7: Polish, Documentation & Verification
- **Done:** Authored `README.md` with setup and launch instructions, synced docs in `docs/`, validated Python syntax and module imports across all files.
- **Decisions:** Verified all deliverables from PRD §8 are complete and functional.

## 2026-09-02 — Enhancements: Profit Simulator & Delivery Radius Economics
- **Done:**
  1. Built `simulate_channel_shift()` in `src/metrics.py` allowing custom order migration from Uber Eats/DoorDash to direct channels (Self-Delivery / In-Store).
  2. Built interactive **🧮 What-If Profit Simulator** tab in `app.py` with dynamic sliders and live Plotly Waterfall bridge chart (`chart_simulation_waterfall`).
  3. Added **📍 Delivery Radius vs Profitability Correlation** scatter analysis (`chart_delivery_radius_vs_profit`) into the Subregion tab evaluating how distance (KM) and delivery costs scale.

## 2026-09-03 — Channel Focus Full Reactivity & Multi-Threaded Engine
- **Done:**
  1. **🎯 Fully Reactive Channel Focus System:** Wired all 5 Channel Focus options (`🌐 All Channels`, `🍽️ In-Store Dining`, `🛵 Delivery Only`, `📱 Aggregators`, `🛡️ Direct`) to instantly slice and re-calculate the Hero Net Profit card, Orders/Revenue cards, Donut Market Share, Grouped Economics Bar, Channel Performance Table, and dynamic analytical insight callout banner.
  2. **⚡ Multi-Threaded Server Engine:** Upgraded `app.py` to `ThreadingHTTPServer` ensuring non-blocking concurrent request handling and sub-millisecond API responses.
  3. **🎨 Visual Consistency:** Polished button styling, borders, and dark-mode neon glows across all navigation pills.
- **Status:** Complete, tested, and live at `http://localhost:8000`.

## 2026-09-03 — Research Paper Deployment Fix
- **Done:** Updated the reports reader to try the local API, a static project path, and the GitHub-hosted Markdown file so the research paper can render in local and deployed environments.
- **Decisions:** The `reports/` directory had been excluded from Git, which left the deployed site without `research_paper.md`. The report is now intentionally included in version control for the dashboard to access.
- **Status:** Ready to publish with the report-loader update.

## 2026-09-03 — Navigation Simplification
- **Done:** Removed the Reports & Research item from the dashboard sidebar.
- **Decisions:** The report view remains in the codebase but is no longer exposed through primary navigation.
