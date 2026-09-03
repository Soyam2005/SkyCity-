# Rules.md — Boundaries for the AI (and any contributor)

## 1. Libraries — Allowed
- `pandas`, `numpy` — data handling
- `streamlit` — app framework
- `plotly` (express + graph_objects) — all charts and the heatmap
- `python` standard library (`os`, `pathlib`, `json`) for config/paths

## 2. Libraries — Avoid unless explicitly requested
- `matplotlib` / `seaborn` — skip in favor of Plotly for consistency and interactivity in Streamlit
- Any ML/forecasting library (`scikit-learn`, `prophet`, `statsmodels`) — this is descriptive analytics, not predictive modeling (see PRD §9). Do not add a forecasting model without an explicit ask.
- Database engines (SQLite/Postgres) — the CSV is the only data source; don't introduce a DB layer for 1.7k rows.
- Any authentication library — out of scope per PRD.

## 3. Data Handling Rules
- Never edit the source CSV in place. All transformations happen in memory or write to a new file under `reports/` or `data/processed/`.
- Every derived metric (dependence index, diversification score, risk flag) must be computed from raw columns already in the CSV — never hardcode a restaurant's risk status.
- If a validation check fails (e.g. channel counts don't sum to `MonthlyOrders`, or shares don't sum to ~100%), surface it visibly in the dashboard (a warning banner) rather than silently correcting or hiding the discrepancy.
- Treat `GrowthFactor`, rate columns, and share columns as given — don't re-derive them differently from what's already in the CSV unless a validation check shows they're wrong.

## 4. Error Handling
- Wrap the CSV load in a try/except with a clear Streamlit error message (`st.error`) if the file is missing or malformed — never let the app crash with a raw traceback visible to a user.
- Guard every filter combination against an empty result (e.g. a cuisine/subregion combo with zero rows) — show a "no data for this filter" message instead of letting a chart function fail.
- Any division (e.g. share calculations) must guard against divide-by-zero.

## 5. Code Style / Structure Rules
- One function = one chart or one metric. No 200-line `app.py` — logic lives in `src/`, `app.py` only orchestrates layout and calls functions.
- All magic numbers (70% risk threshold, color codes) live in `config.py`, not scattered inline.
- Every function that computes a KPI gets a one-line docstring stating the formula.

## 6. Scope Boundaries — What the AI Should NOT Do
- Do not invent data. If a metric requested in the PRD can't be computed from existing columns, flag it instead of fabricating a plausible-looking number.
- Do not silently expand scope (e.g. adding login, adding a database, adding forecasting) without flagging the addition first.
- Do not skip the data validation step (Phase 1) to jump straight to charts — a wrong denominator early on propagates through every downstream chart.
- Do not treat the "Forecasting Methodology" section title in the source brief as a literal instruction to build a forecast model — its actual steps are validation, aggregation, and comparison, not projection. Confirm before building any predictive component.

## 7. Change Management
- Any structural change (new folder, new dependency, changed KPI formula) gets logged in `Memory.md` (see that file) with the phase it happened in.
