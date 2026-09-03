# Order Channel Performance and Market Share Analytics for SkyCity Auckland Restaurants & Bars

**Author:** Antigravity Analytics Team  
**Date:** September 2026  
**Scope:** 1,696 Auckland Restaurant & Bar Branches  
**Dataset:** SkyCity Auckland Restaurants & Bars Operating Benchmark

---

## Executive Abstract
This research study provides a descriptive and diagnostic evaluation of ordering channel performance, market share distribution, and profit economics across **1,696 restaurant and bar branches** operating in the Greater Auckland metropolitan area (CBD, North Shore, South Auckland, and West Auckland). Across a total monthly volume of **2,019,134 orders** generating **$77,739,306.80 in gross monthly revenue**, we examine the interplay between four distinct fulfillment channels: **In-Store**, **Uber Eats**, **DoorDash**, and **Self-Delivery**.

The findings uncover an acute structural dynamic termed the **"Aggregator Paradox"**: while third-party delivery platforms (Uber Eats and DoorDash) capture **61.24% of total order volume** and **61.26% of gross revenue** ($47.62M), they generate only **5.21% ($409,610.33) of total industry net profit** due to high commission take-rates (averaging 28%–33%). Conversely, **In-Store and Self-Delivery channels contribute 94.79% ($7,456,695.80) of total net profit** despite representing under 39% of order volume. Furthermore, **35.55% of restaurants (603 branches)** exhibit high dependency risk (≥70% order concentration on delivery aggregators). Strategic recommendations for operators, franchise owners, and commercial stakeholders focus on channel rebalancing, menu margin defense, and direct customer acquisition.

---

## 1. Data Integrity & Validation Methodology
To establish an empirical foundation, the dataset underwent rigorous algorithmic validation across all 1,696 records:
- **Order Volume Conservation:** $\sum (\text{InStoreOrders} + \text{UberEatsOrders} + \text{DoorDashOrders} + \text{SelfDeliveryOrders}) = \text{MonthlyOrders}$. All 1,696 records achieved an exact mathematical match ($0$ mismatches).
- **Delivery Share Distribution:** Delivery channel proportions ($\text{UE\_share} + \text{DD\_share} + \text{SD\_share}$) totaled exactly $1.00$ ($100\%$) across all records.
- **Operational Range Boundaries:**
  - Average Order Value (AOV): Ranging from $\$29.79$ to $\$47.23$ (Mean: $\$38.52$).
  - Monthly Growth Factor: Bounded strictly between $0.99$ and $1.05$.
  - Commission Rates: Bounded between $27.0\%$ and $33.0\%$.
  - Cost of Goods Sold (COGS) & OPEX: Operating within standard industry benchmarks ($20.0\%$ to $55.0\%$).
- **Data Completeness:** $0$ missing or null attributes across all 30 dataset fields.

---

## 2. Market-Wide Channel Performance & The Aggregator Paradox

### 2.1 Macro Financial & Channel Breakdown
Across the 1,696 analyzed branches, total monthly industry figures stand as follows:
- **Total Monthly Orders:** $2,019,134$
- **Total Gross Revenue:** $\$77,739,306.80$
- **Total Net Profit:** $\$7,866,306.13$
- **Weighted Average Net Profit Margin:** $10.12\%$

### Table 1: Channel-Level Order, Revenue, and Profit Distribution
| Ordering Channel | Monthly Orders | Order Share (%) | Monthly Revenue ($) | Revenue Share (%) | Total Net Profit ($) | Profit Share (%) | Net Profit Margin (%) | Avg Profit / Order ($) |
|---|---|---|---|---|---|---|---|---|
| **In-Store** | 371,391 | 18.39% | $14,284,557.48 | 18.37% | $3,828,417.36 | 48.67% | **26.80%** | **$10.31** |
| **Self-Delivery** | 411,255 | 20.37% | $15,836,373.23 | 20.37% | $3,628,278.44 | 46.12% | **22.89%** | **$8.82** |
| **Uber Eats** | 800,353 | 39.64% | $30,830,154.52 | 39.66% | $258,488.08 | 3.29% | **0.84%** | **$0.32** |
| **DoorDash** | 436,135 | 21.60% | $16,788,221.57 | 21.60% | $151,122.25 | 1.92% | **0.90%** | **$0.35** |
| **Total / Overall** | **2,019,134** | **100.00%** | **$77,739,306.80** | **100.00%** | **$7,866,306.13** | **100.00%** | **10.12%** | **$3.90** |

### 2.2 The Unit Economics Dilemma
The data illustrates an extreme divergence in profitability per order across channels:
- An **In-Store order** yields **$10.31 in net profit** (26.80% net margin) because it incurs zero platform commission fees and zero delivery logistical overhead.
- A **Self-Delivery order** yields **$8.82 in net profit** (22.89% net margin), as internal delivery costs per order ($\$0.89 - \$5.31$) remain far below aggregator commissions.
- An **Uber Eats order** yields only **$0.32 in net profit** (0.84% net margin), eroded by commission fees averaging $28\% - 33\%$.
- A **DoorDash order** yields only **$0.35 in net profit** (0.90% net margin).

In aggregate, restaurant operators are processing **1.236 million delivery aggregator orders per month** to generate merely **$409,610 in combined profit**, while just **371,391 in-store orders** generate **$3.83 million in profit**.

---

## 3. Geographic Channel Dynamics across Auckland Subregions

Auckland's channel adoption is remarkably consistent geographically, reflecting uniform digital platform saturation across both urban core and suburban rings.

### Table 2: Channel Order Share Matrix by Subregion
| Subregion | Total Branches | Monthly Orders | In-Store Share (%) | Uber Eats Share (%) | DoorDash Share (%) | Self-Delivery Share (%) | Aggregator Dep. (%) |
|---|---|---|---|---|---|---|---|
| **CBD** | 424 | 506,712 | 18.34% | 39.61% | 21.81% | 20.24% | 61.42% |
| **North Shore** | 424 | 503,981 | 18.74% | 39.70% | 21.44% | 20.12% | 61.14% |
| **South Auckland** | 424 | 504,118 | 17.99% | 39.66% | 21.53% | 20.82% | 61.19% |
| **West Auckland** | 424 | 504,323 | 18.53% | 39.59% | 21.62% | 20.26% | 61.21% |

**Key Geographic Findings:**
1. **Balanced Distribution:** Auckland's restaurant network is evenly distributed across all four quadrants (424 branches each).
2. **Channel Parity:** Uber Eats maintains a near-constant ~39.6% order share in every quadrant, while DoorDash captures ~21.5% to 21.8%.
3. **Suburban Self-Delivery:** South Auckland displays a slightly higher Self-Delivery share (20.82%) compared to North Shore (20.12%), driven by localized cluster delivery routes.

---

## 4. Cuisine Profile & Operational Segment Analysis

### 4.1 Cuisine Type Channel Dynamics
The dataset covers 8 major cuisine categories: Burgers, Chicken Dishes, Chinese, Indian, Japanese, Kebabs/Mediterranean, Pizza, and Thai.

### Table 3: Performance by Cuisine Category
| Cuisine Type | Branches | Monthly Orders | Total Revenue ($) | Total Net Profit ($) | Profit Margin (%) | High Risk Count | High Risk % |
|---|---|---|---|---|---|---|---|
| **Burgers** | 212 | 253,889 | $9,754,231.14 | $985,412.30 | 10.10% | 76 | 35.8% |
| **Chicken Dishes** | 212 | 252,640 | $9,712,408.92 | $978,142.11 | 10.07% | 74 | 34.9% |
| **Chinese** | 212 | 251,902 | $9,698,124.50 | $981,209.84 | 10.12% | 75 | 35.4% |
| **Indian** | 212 | 252,419 | $9,720,119.45 | $984,551.90 | 10.13% | 77 | 36.3% |
| **Japanese** | 212 | 252,108 | $9,709,332.18 | $986,720.15 | 10.16% | 73 | 34.4% |
| **Kebabs/Med.** | 212 | 251,894 | $9,692,840.12 | $979,880.40 | 10.11% | 76 | 35.8% |
| **Pizza** | 212 | 251,980 | $9,715,448.20 | $983,110.22 | 10.12% | 76 | 35.8% |
| **Thai** | 212 | 252,302 | $9,736,802.29 | $987,279.21 | 10.14% | 76 | 35.8% |

### 4.2 Segment Reliance & Structural Exposure
Operational models demonstrate varying degrees of vulnerability:
- **Ghost Kitchens:** Heavily weighted towards aggregator platforms due to the absence of a physical customer storefront. While OPEX rates are slightly lower, aggregator commissions absorb up to 33% of gross revenues, severely compressing bottom-line resilience.
- **QSR (Quick Service Restaurants):** High order volume throughput, with delivery platforms acting as significant demand generators but yielding thin per-ticket margins ($0.32–$0.35).
- **Cafes & Full-service Establishments:** Benefit from higher In-Store dining and beverage attachments, providing strong cash flow and healthy profit margins (22%–27%).

---

## 5. Channel Dependency Risk & Diversification Modeling

### 5.1 Measuring Channel Risk
Channel risk is evaluated using two primary metrics:
1. **Aggregator Dependence Index (ADI):**
   $$\text{ADI} = \frac{\text{UberEatsOrders} + \text{DoorDashOrders}}{\text{MonthlyOrders}}$$
2. **Normalized Channel Diversification Score (CDS):**
   $$\text{HHI} = \sum_{c=1}^{4} s_c^2 \quad \implies \quad \text{CDS} = \frac{1 - \text{HHI}}{1 - 0.25} = \frac{1 - \text{HHI}}{0.75} \in [0, 1]$$
   *(where $1.0$ indicates perfect balance across all 4 channels, and $0.0$ indicates complete single-channel monopoly).*

### 5.2 Key Risk Findings
- **High Risk Prevalence:** **603 out of 1,696 restaurants (35.55%)** exhibit an Aggregator Dependence Index $\ge 70\%$.
- **Vulnerability Profile:** Restaurants with $\text{ADI} \ge 70\%$ operate with average net margins below **4.5%**, leaving them critically exposed to fee increases, algorithmic ranking shifts, or platform policy changes.
- **Average Industry Diversification:** The mean Diversification Score across Auckland restaurants is **0.93**, indicating that while many operators maintain diversified channel presence on paper, order volume remains heavily concentrated on third-party aggregators.

---

## 6. Strategic Recommendations

Based on empirical channel economics, operators and franchise executives should implement four strategic initiatives:

### 1. Accelerate First-Party Digital Ordering (Self-Delivery)
- **Economic Impact:** Shifting $15\%$ of volume from Uber Eats/DoorDash to first-party online ordering (Self-Delivery) increases net profit per converted order by **+2,656%** (from $\$0.32$ to $\$8.82$).
- **Action:** Deploy direct online ordering widgets, SMS re-order campaigns, and exclusive loyalty rewards on direct digital orders.

### 2. Aggregator Price Differentiation & Margin Defense
- **Economic Impact:** Offset 28%–33% aggregator commission rates by applying a calibrated **15%–20% markup** on third-party platform menus relative to in-store menus.
- **Action:** Align pricing to reflect the actual cost-to-serve per channel without violating platform terms.

### 3. In-Store Customer Retention & Dining Experience
- **Economic Impact:** In-Store dining generates the highest net margin in the industry (**26.80%**, $\$10.31$/order).
- **Action:** Utilize packaging bag inserts in delivery orders offering in-store dining discounts (e.g. "$10 off your next in-restaurant dining experience") to systematically convert third-party delivery consumers into direct in-store guests.

### 4. Segment-Specific Operating Adjustments
- **For Ghost Kitchens:** Integrate dedicated localized delivery drivers to scale Self-Delivery volume above 40%, insulating operations from aggregator commission erosion.
- **For QSRs & Cafes:** Protect peak kitchen throughput by setting order throttling on aggregators during peak in-store dining hours.

---

## 7. Conclusion
The Auckland restaurant and bar industry processes over $77.7M in monthly revenue with robust top-line consumer demand. However, the concentration of order flow onto third-party delivery platforms has created severe margin dilution. By actively cultivating direct delivery capabilities and incentivizing in-store dining, operators can reclaim operational independence and substantially expand net profitability.
