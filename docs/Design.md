# Design.md — Visual Design System

## 1. Design Intent
A data-heavy operational dashboard for restaurant/hospitality stakeholders — should read as clean, trustworthy, and analytical rather than playful. Priority is legibility of numbers and charts over decoration.

## 2. Color Palette
| Role | Color | Hex |
|---|---|---|
| Primary (brand/header) | Deep navy | `#12233D` |
| Secondary accent | Teal | `#0FA3A3` |
| Background | Off-white | `#F7F8FA` |
| Card/panel background | White | `#FFFFFF` |
| Text — primary | Charcoal | `#1F2933` |
| Text — muted | Slate gray | `#6B7280` |
| Risk / alert | Amber-red | `#E4572E` |
| Success / healthy | Green | `#2E8B57` |
| Border/divider | Light gray | `#E2E5EA` |

### Channel Color Mapping (used consistently in every chart)
| Channel | Color |
|---|---|
| In-Store | `#12233D` (navy) |
| Uber Eats | `#06C167` (Uber Eats' own green, muted if needed for accessibility) |
| DoorDash | `#E4572E` (amber-red, distinct from Uber Eats) |
| Self-Delivery | `#0FA3A3` (teal) |

Using the same channel→color mapping on every chart (bar, heatmap, pie) is a hard rule — a user should recognize "DoorDash" by color alone across tabs.

## 3. Typography
- Headings: `Inter` or Streamlit's default sans-serif, semi-bold, navy (`#12233D`)
- Body/labels: `Inter` regular, charcoal (`#1F2933`)
- Numbers/KPIs (big metric callouts): bold, larger size, teal or navy depending on context
- Avoid more than 2 font weights on a single screen

## 4. Layout Principles
- Sidebar: filters only, no charts
- Main area: tabs (Overview / Subregion / Cuisine / Segment / Risk / Drill-down) — matches Architecture.md's flow
- Top of each tab: 3–5 KPI "metric cards" (`st.metric`) before any chart, so headline numbers are visible without scrolling
- Charts: one primary chart per screen section, not cramped side-by-side unless directly comparing two related views (e.g. order share vs. revenue share)
- Risk panel: table with conditional row highlighting (amber-red background) for flagged restaurants, not just a color in one column

## 5. Chart-Specific Guidance
- Heatmap (subregion × channel): sequential teal colorscale (`px.colors.sequential.Teal`), not a rainbow scale
- Stacked bar (cuisine × channel mix): use the fixed channel color mapping above, ordered consistently (In-Store, Uber Eats, DoorDash, Self-Delivery) in every stack
- Risk distribution: histogram or strip plot of diversification scores, with a vertical reference line at the 70% dependency threshold

## 6. Streamlit Theme (`.streamlit/config.toml`)
```toml
[theme]
primaryColor = "#0FA3A3"
backgroundColor = "#F7F8FA"
secondaryBackgroundColor = "#FFFFFF"
textColor = "#1F2933"
font = "sans serif"
```

## 7. Accessibility
- Don't rely on color alone for the risk flag — pair it with an icon or text label ("⚠ High Dependency")
- Ensure text/background contrast meets at least WCAG AA for body text
