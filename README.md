# 🍽️ SkyCity DineMetrics
### *Order Channel Performance Benchmark for Auckland Restaurants*

A high-performance standalone web analytics dashboard and intelligence suite analyzing order channel performance, market share distribution, and aggregator dependence across **1,696 restaurant and bar branches** in Auckland.

---

## 🚀 Quick Start

### Launch the Web Application
Simply run the Python entrypoint:

```powershell
python app.py
```

It will automatically start the server on port 8000 and open **`http://localhost:8000`** in your default browser!

*(Alternatively, you can also run `python -m http.server 8000 --directory web` or double-click `web/index.html`)*

### Deploy to Vercel

This dashboard is a static site. The included `vercel.json` publishes the `web/`
folder, so no build command or environment variables are needed.

1. Push this repository to GitHub.
2. In Vercel, select **Add New → Project** and import the repository.
3. Leave the framework preset as **Other** and deploy. Vercel will use
   `web/` as the output directory automatically.

Or, after logging in to the Vercel CLI, deploy from the repository root:

```powershell
npx vercel --prod
```

---

## 📁 Repository Structure

```
├── web/                       # Standalone Web Application
│   ├── index.html             # Semantic 3-zone shell with modern navigation
│   ├── css/
│   │   └── style.css          # Admin Dashboard UI Design System stylesheet
│   ├── js/
│   │   ├── data.js            # Pre-compiled benchmark dataset (1,696 branches)
│   │   ├── charts.js          # Chart.js visualization engine
│   │   ├── simulator.js       # Client-side What-If Profit Simulation engine
│   │   └── app.js             # Main reactive controller & filter coordinator
│   └── assets/
│       ├── logo.svg           # Official vector logo
│       └── logo.png           # High-resolution branding image
├── data/
│   └── SkyCity_Auckland_Restaurants___Bars.csv  # 1,696 validated restaurant records
├── src/
│   ├── data_loader.py         # Ingestion & mathematical validation checks
│   └── metrics.py             # KPI engine, Herfindahl diversification & aggregations
├── reports/
│   ├── research_paper.md      # Full academic/industry research paper with deep-dive EDA
│   └── executive_summary.md   # 1-2 page executive summary for business leadership
├── assets/                    # Project branding assets
├── docs/                      # Project planning documentation
└── README.md                  # Project overview & running instructions
```

---

## 📊 Core Features

1. **Market Overview:** Headline KPIs (Monthly Volume, Revenue, Net Profit, Average Margin) and Channel Market Share Donut & Economics comparison.
2. **Distance & Radius Analysis:** Interactive scatter plot correlating delivery radius ($0\text{--}20\text{ km}$) and profit-per-order.
3. **Cuisine Mix & Segment Reliance:** Stacked and grouped channel distribution across 8 cuisines and 4 operational segments.
4. **Risk Assessment:** Filterable register of branches exceeding the 70% delivery aggregator dependency threshold.
5. **🧮 What-If Profit Simulator:** Real-time sliders to calculate ROI and commission savings from migrating third-party delivery volume to direct channels.
# SkyCity-
