"""
Metrics calculation engine for SkyCity Auckland Order Channel Analytics.
Computes core KPIs, dependence indices, diversification scores, and aggregations.
"""
import sys
from pathlib import Path
from typing import Dict, Any
import numpy as np
import pandas as pd

# Add project root to sys.path if not present
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

try:
    import streamlit as st
    cache_decorator = st.cache_data
except Exception:
    def cache_decorator(func):
        return func

import config

def compute_diversification_score(shares: np.ndarray) -> np.ndarray:
    """
    Formula: DiversificationScore = (1 - sum(share_i^2)) / (1 - 0.25), bounded in [0, 1].
    Calculates normalized Herfindahl-Hirschman Index (HHI) diversity across 4 channels.
    """
    # shares shape: (N, 4)
    hhi = np.sum(np.square(shares), axis=1)
    # Min possible HHI with 4 channels is 0.25 (equal split 0.25 each), max is 1.0 (monopoly)
    score = (1.0 - hhi) / (1.0 - 0.25)
    return np.clip(score, 0.0, 1.0)


@cache_decorator
def compute_kpis(df: pd.DataFrame) -> pd.DataFrame:
    """
    Formula: Enriches raw restaurant DataFrame with derived KPIs, shares, and risk classifications.
    Original columns are preserved without in-place mutation.
    """
    res = df.copy()
    
    # Safe order denominator
    safe_orders = np.where(res["MonthlyOrders"] > 0, res["MonthlyOrders"], 1.0)
    
    # Precise per-restaurant channel order shares (sum to 1.0)
    res["InStoreOrderShare"] = res[config.ORDER_COLS["In-Store"]] / safe_orders
    res["UberEatsOrderShare"] = res[config.ORDER_COLS["Uber Eats"]] / safe_orders
    res["DoorDashOrderShare"] = res[config.ORDER_COLS["DoorDash"]] / safe_orders
    res["SelfDeliveryOrderShare"] = res[config.ORDER_COLS["Self-Delivery"]] / safe_orders
    
    # Aggregator Dependence Index = (UberEatsOrders + DoorDashOrders) / MonthlyOrders
    res["AggregatorDependence"] = res["UberEatsOrderShare"] + res["DoorDashOrderShare"]
    
    # In-Store Reliance Ratio = InStoreOrders / MonthlyOrders
    res["InStoreReliance"] = res["InStoreOrderShare"]
    
    # Channel Diversification Score across the 4 channel shares
    shares_matrix = res[[
        "InStoreOrderShare",
        "UberEatsOrderShare",
        "DoorDashOrderShare",
        "SelfDeliveryOrderShare"
    ]].to_numpy()
    res["DiversificationScore"] = compute_diversification_score(shares_matrix)
    
    # High Risk Flag: True if Aggregator Dependence >= 70% or any single channel >= 70%
    max_single_share = shares_matrix.max(axis=1)
    res["RiskFlag"] = (
        (res["AggregatorDependence"] >= config.DEPENDENCE_RISK_THRESHOLD)
        | (max_single_share >= config.DEPENDENCE_RISK_THRESHOLD)
    )
    
    # Financial Aggregations
    res["TotalRevenue"] = (
        res[config.REVENUE_COLS["In-Store"]]
        + res[config.REVENUE_COLS["Uber Eats"]]
        + res[config.REVENUE_COLS["DoorDash"]]
        + res[config.REVENUE_COLS["Self-Delivery"]]
    )
    res["TotalNetProfit"] = (
        res[config.PROFIT_COLS["In-Store"]]
        + res[config.PROFIT_COLS["Uber Eats"]]
        + res[config.PROFIT_COLS["DoorDash"]]
        + res[config.PROFIT_COLS["Self-Delivery"]]
    )
    
    safe_rev = np.where(res["TotalRevenue"] > 0, res["TotalRevenue"], 1.0)
    res["OverallProfitMargin"] = np.where(res["TotalRevenue"] > 0, res["TotalNetProfit"] / safe_rev, 0.0)
    
    # Channel Profit Per Order
    for ch in config.CHANNELS:
        ch_orders = res[config.ORDER_COLS[ch]]
        ch_profit = res[config.PROFIT_COLS[ch]]
        res[f"{ch}_ProfitPerOrder"] = np.where(ch_orders > 0, ch_profit / np.maximum(ch_orders, 1), 0.0)
        
    return res


def get_market_summary(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Formula: Market summary metrics aggregating orders, revenue, profit, margin, and risk counts.
    """
    total_restaurants = len(df)
    if total_restaurants == 0:
        return {
            "total_restaurants": 0,
            "total_monthly_orders": 0,
            "total_revenue": 0.0,
            "total_net_profit": 0.0,
            "avg_profit_margin": 0.0,
            "avg_aov": 0.0,
            "avg_diversification_score": 0.0,
            "high_risk_count": 0,
            "high_risk_pct": 0.0,
        }
        
    total_orders = int(df["MonthlyOrders"].sum())
    total_rev = float(df["TotalRevenue"].sum())
    total_profit = float(df["TotalNetProfit"].sum())
    avg_margin = float(total_profit / total_rev) if total_rev > 0 else 0.0
    avg_aov = float(df["AOV"].mean())
    avg_div = float(df["DiversificationScore"].mean())
    high_risk_count = int(df["RiskFlag"].sum())
    high_risk_pct = float(high_risk_count / total_restaurants * 100.0)
    
    return {
        "total_restaurants": total_restaurants,
        "total_monthly_orders": total_orders,
        "total_revenue": total_rev,
        "total_net_profit": total_profit,
        "avg_profit_margin": avg_margin,
        "avg_aov": avg_aov,
        "avg_diversification_score": avg_div,
        "high_risk_count": high_risk_count,
        "high_risk_pct": high_risk_pct,
    }


def get_channel_breakdown(df: pd.DataFrame) -> pd.DataFrame:
    """
    Formula: Aggregates order volume, revenue, net profit, margin, and average profit per order by channel.
    """
    if len(df) == 0:
        return pd.DataFrame(columns=["Channel", "Orders", "OrderShare", "Revenue", "RevenueShare", "NetProfit", "ProfitMargin", "ProfitPerOrder"])
        
    rows = []
    total_orders = max(df["MonthlyOrders"].sum(), 1)
    total_rev = max(df["TotalRevenue"].sum(), 1.0)
    
    for ch in config.CHANNELS:
        orders = df[config.ORDER_COLS[ch]].sum()
        revenue = df[config.REVENUE_COLS[ch]].sum()
        profit = df[config.PROFIT_COLS[ch]].sum()
        order_share = (orders / total_orders) * 100.0
        revenue_share = (revenue / total_rev) * 100.0
        margin = (profit / revenue * 100.0) if revenue > 0 else 0.0
        profit_per_order = (profit / orders) if orders > 0 else 0.0
        
        rows.append({
            "Channel": ch,
            "Orders": int(orders),
            "OrderShare": round(order_share, 2),
            "Revenue": round(revenue, 2),
            "RevenueShare": round(revenue_share, 2),
            "NetProfit": round(profit, 2),
            "ProfitMargin": round(margin, 2),
            "ProfitPerOrder": round(profit_per_order, 2),
        })
        
    return pd.DataFrame(rows)


def get_dimension_channel_matrix(df: pd.DataFrame, dimension: str, value_type: str = "share") -> pd.DataFrame:
    """
    Formula: Cross-tabulates a dimension (Subregion, CuisineType, Segment) against channels by order count or share.
    """
    if len(df) == 0:
        return pd.DataFrame()
        
    grouped = df.groupby(dimension)[[
        config.ORDER_COLS["In-Store"],
        config.ORDER_COLS["Uber Eats"],
        config.ORDER_COLS["DoorDash"],
        config.ORDER_COLS["Self-Delivery"],
    ]].sum()
    
    grouped.columns = config.CHANNELS
    
    if value_type == "share":
        row_sums = grouped.sum(axis=1).replace(0, 1)
        matrix = grouped.div(row_sums, axis=0) * 100.0
    else:
        matrix = grouped
        
    return matrix.round(2)


def simulate_channel_shift(
    df: pd.DataFrame,
    ue_shift_pct: float = 0.15,
    dd_shift_pct: float = 0.15,
    target_channel: str = "Self-Delivery",
) -> Dict[str, Any]:
    """
    Formula: Simulates economic impact of shifting a percentage of third-party aggregator orders to a direct channel.
    Computes commission savings, new net profit, and percentage profit increase.
    """
    if df.empty:
        return {
            "baseline_profit": 0.0,
            "simulated_profit": 0.0,
            "profit_gain": 0.0,
            "profit_gain_pct": 0.0,
            "commission_saved": 0.0,
            "shifted_orders": 0,
            "baseline_margin_pct": 0.0,
            "simulated_margin_pct": 0.0,
        }
        
    baseline_revenue = float(df["TotalRevenue"].sum())
    baseline_profit = float(df["TotalNetProfit"].sum())
    
    # Orders to shift
    ue_orders = df[config.ORDER_COLS["Uber Eats"]]
    dd_orders = df[config.ORDER_COLS["DoorDash"]]
    
    shifted_ue_orders = ue_orders * ue_shift_pct
    shifted_dd_orders = dd_orders * dd_shift_pct
    total_shifted_orders = shifted_ue_orders + shifted_dd_orders
    
    # Financial baseline per order
    aov = df["AOV"]
    ue_comm = df["CommissionRate"]  # typically ~0.28 to 0.33
    cogs_rate = df["COGSRate"]
    opex_rate = df["OPEXRate"]
    
    # Commission saved
    ue_rev_shifted = shifted_ue_orders * aov
    dd_rev_shifted = shifted_dd_orders * aov
    total_rev_shifted = ue_rev_shifted + dd_rev_shifted
    
    # Third party commissions eliminated on shifted volume
    ue_commission_saved = ue_rev_shifted * ue_comm
    dd_commission_saved = dd_rev_shifted * ue_comm  # same commission structure
    total_commission_saved = float((ue_commission_saved + dd_commission_saved).sum())
    
    # Profit gain based on destination channel
    if target_channel == "Self-Delivery":
        # Additional delivery costs incurred per order
        delivery_cost_per_order = df["DeliveryCostPerOrder"]
        additional_delivery_cost = float((total_shifted_orders * delivery_cost_per_order).sum())
        # Net profit gained = commissions saved - additional direct delivery costs
        net_gain = total_commission_saved - additional_delivery_cost
    else:  # In-Store
        # In-store incurs zero delivery costs
        net_gain = total_commission_saved
        
    simulated_profit = baseline_profit + net_gain
    profit_gain_pct = (net_gain / baseline_profit * 100.0) if baseline_profit > 0 else 0.0
    
    baseline_margin = (baseline_profit / baseline_revenue * 100.0) if baseline_revenue > 0 else 0.0
    simulated_margin = (simulated_profit / baseline_revenue * 100.0) if baseline_revenue > 0 else 0.0
    
    return {
        "baseline_profit": baseline_profit,
        "simulated_profit": simulated_profit,
        "profit_gain": net_gain,
        "profit_gain_pct": profit_gain_pct,
        "commission_saved": total_commission_saved,
        "shifted_orders": int(total_shifted_orders.sum()),
        "baseline_margin_pct": baseline_margin,
        "simulated_margin_pct": simulated_margin,
    }


if __name__ == "__main__":
    from src.data_loader import load_data
    raw_df, _ = load_data()
    kpi_df = compute_kpis(raw_df)
    print("KPIs Computed Shape:", kpi_df.shape)
    print("Market Summary:")
    print(get_market_summary(kpi_df))
    print("\nSimulation (15% shift to Self-Delivery):")
    print(simulate_channel_shift(kpi_df, 0.15, 0.15, "Self-Delivery"))
