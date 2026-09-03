# Architecture.md — App Flow & Technical Stack

## 1. Tech Stack
| Layer | Choice | Why |
|---|---|---|
| Language | Python 3.11+ | Ecosystem fit for data + Streamlit |
| Data handling | pandas | Standard, sufficient for 1.7k rows |
| Dashboard framework | Streamlit | Matches project's stated requirement |
| Charts | Plotly (via `st.plotly_chart`) | Interactive hover/zoom, better than static matplotlib for a dashboard |
| Heatmaps | Plotly `imshow` or `px.density_heatmap` | Native Streamlit support |
| Report/paper output | Markdown → optionally exported to PDF via the `pdf` skill | Keeps authoring simple, exportable later |
| State/caching | `st.cache_data` | Avoid recomputing aggregations on every filter change |
| Config | `config.py` + `.streamlit/config.toml` | Central place for constants (e.g. 70% risk threshold), theme |

No database — the CSV is small enough to load fully into memory per session.

## 2. High-Level App Flow
```
CSV file
  │
  ▼
data_loader.py  → load_data() [cached]
  │                 - reads CSV
  │                 - runs validation checks (Phase 1)
  ▼
metrics.py       → compute_kpis(df)
  │                 - channel shares, dependence index,
  │                   diversification score, risk flags
  ▼
app.py (Streamlit entrypoint)
  │
  ├── sidebar: filters (subregion, cuisine, segment, channel toggle)
  │
  ├── tab: Overview           → charts.py: overview_charts()
  ├── tab: Subregion Heatmap  → charts.py: subregion_heatmap()
  ├── tab: Cuisine Mix        → charts.py: cuisine_charts()
  ├── tab: Segment View       → charts.py: segment_charts()
  ├── tab: Risk Panel         → charts.py: risk_panel()
  └── tab: Restaurant Drill-down → charts.py: restaurant_detail()
```

Filters live in the sidebar and are applied once to a filtered DataFrame that every tab reads from — no tab re-implements its own filtering logic.

## 3. Folder Structure
```
skycity-channel-analytics/
├── app.py                     # Streamlit entrypoint, page config, sidebar, tab routing
├── config.py                  # constants: risk threshold, color map, subregion/cuisine lists
├── data/
│   └── SkyCity_Auckland_Restaurants___Bars.csv
├── src/
│   ├── data_loader.py         # load_data(), validate_data()
│   ├── metrics.py             # compute_kpis(), dependence_index(), diversification_score()
│   └── charts.py              # one function per chart/tab, returns a Plotly figure
├── reports/
│   ├── research_paper.md      # EDA + insights + recommendations
│   └── executive_summary.md   # short stakeholder version
├── docs/                       # this planning set
│   ├── PRD.md
│   ├── Architecture.md
│   ├── Rules.md
│   ├── Phases.md
│   ├── Design.md
│   └── Memory.md
├── requirements.txt
└── README.md
```

## 4. Data Flow Contract
- `load_data()` returns the raw validated DataFrame — never mutates the CSV on disk.
- `compute_kpis()` returns a new DataFrame with added columns (`AggregatorDependence`, `DiversificationScore`, `RiskFlag`) — original columns untouched.
- Chart functions take a (possibly filtered) DataFrame and return a Plotly figure — they never read the CSV directly.

## 5. Caching Strategy
- `load_data()` wrapped in `@st.cache_data` — CSV read happens once per session.
- `compute_kpis()` also cached, keyed on the input DataFrame's hash, so re-filtering doesn't recompute derived metrics from scratch.
