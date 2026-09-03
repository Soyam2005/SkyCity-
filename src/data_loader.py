"""
Data loader and validation module for SkyCity Auckland Order Channel Analytics.
Loads data cleanly, applies integrity checks, and surfaces validation summaries.
"""
from typing import Dict, Any, Tuple
import pandas as pd
import sys
from pathlib import Path

# Add project root to sys.path if not present
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import config

_CACHED_RAW_DF = None
_CACHED_REPORT = None
_CACHED_MTIME = None

def validate_data(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Runs integrity and consistency checks against the dataset.
    
    Checks performed:
    1. Order volume conservation: InStore + UberEats + DoorDash + SelfDelivery == MonthlyOrders
    2. Delivery share sum: UE_share + DD_share + SD_share == 1.0
    3. Null value checks
    4. Outlier & range checks on AOV, GrowthFactor, CommissionRate, COGS, OPEX
    """
    total_rows = len(df)
    
    # 1. Order conservation check
    computed_orders = (
        df[config.ORDER_COLS["In-Store"]]
        + df[config.ORDER_COLS["Uber Eats"]]
        + df[config.ORDER_COLS["DoorDash"]]
        + df[config.ORDER_COLS["Self-Delivery"]]
    )
    order_diff = (computed_orders - df["MonthlyOrders"]).abs()
    order_mismatches = int((order_diff > 1).sum())
    
    # 2. Delivery share check
    delivery_share_sum = (
        df[config.SHARE_COLS["Uber Eats"]]
        + df[config.SHARE_COLS["DoorDash"]]
        + df[config.SHARE_COLS["Self-Delivery"]]
    )
    share_mismatches = int(((delivery_share_sum - 1.0).abs() > 0.01).sum())
    
    # 3. Missing values check
    null_counts = int(df.isnull().sum().sum())
    
    # 4. Outlier & range checks
    aov_outliers = int(((df["AOV"] < config.AOV_MIN) | (df["AOV"] > config.AOV_MAX)).sum())
    gf_outliers = int(((df["GrowthFactor"] < config.GROWTH_FACTOR_MIN) | (df["GrowthFactor"] > config.GROWTH_FACTOR_MAX)).sum())
    comm_outliers = int(((df["CommissionRate"] < config.COMMISSION_RATE_MIN) | (df["CommissionRate"] > config.COMMISSION_RATE_MAX)).sum())
    cogs_outliers = int(((df["COGSRate"] < config.COGS_RATE_MIN) | (df["COGSRate"] > config.COGS_RATE_MAX)).sum())
    opex_outliers = int(((df["OPEXRate"] < config.OPEX_RATE_MIN) | (df["OPEXRate"] > config.OPEX_RATE_MAX)).sum())
    
    is_valid = (
        order_mismatches == 0
        and share_mismatches == 0
        and null_counts == 0
        and aov_outliers == 0
        and gf_outliers == 0
        and comm_outliers == 0
        and cogs_outliers == 0
        and opex_outliers == 0
    )
    
    report = {
        "is_valid": is_valid,
        "total_rows": total_rows,
        "order_mismatches": order_mismatches,
        "share_mismatches": share_mismatches,
        "null_counts": null_counts,
        "aov_outliers": aov_outliers,
        "growth_factor_outliers": gf_outliers,
        "commission_rate_outliers": comm_outliers,
        "cogs_outliers": cogs_outliers,
        "opex_outliers": opex_outliers,
        "total_orders_verified": int(df["MonthlyOrders"].sum()),
        "total_gross_revenue_verified": float(
            (
                df[config.REVENUE_COLS["In-Store"]]
                + df[config.REVENUE_COLS["Uber Eats"]]
                + df[config.REVENUE_COLS["DoorDash"]]
                + df[config.REVENUE_COLS["Self-Delivery"]]
            ).sum()
        ),
    }
    
    return report

def load_data(filepath: Path = None) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Loads raw CSV data with automatic cache invalidation on file modification.
    """
    global _CACHED_RAW_DF, _CACHED_REPORT, _CACHED_MTIME
    
    target_path = Path(filepath) if filepath else (config.PRIMARY_CSV_PATH if config.PRIMARY_CSV_PATH.exists() else config.FALLBACK_CSV_PATH)
    
    if not target_path.exists():
        raise FileNotFoundError(f"Data file not found at: {target_path}")
    
    current_mtime = target_path.stat().st_mtime
    
    if _CACHED_RAW_DF is not None and _CACHED_MTIME == current_mtime:
        return _CACHED_RAW_DF.copy(), _CACHED_REPORT
    
    df = pd.read_csv(target_path)
    report = validate_data(df)
    
    _CACHED_RAW_DF = df
    _CACHED_REPORT = report
    _CACHED_MTIME = current_mtime
    
    return df.copy(), report
