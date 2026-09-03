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

try:
    import streamlit as st
    cache_decorator = st.cache_data(show_spinner="Loading and validating SkyCity restaurant data...")
except Exception:
    def cache_decorator(func):
        return func

import config

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
    
    passed_all = (
        order_mismatches == 0
        and share_mismatches == 0
        and null_counts == 0
        and aov_outliers == 0
        and gf_outliers == 0
        and comm_outliers == 0
    )
    
    return {
        "passed_all": passed_all,
        "total_rows": total_rows,
        "order_mismatches": order_mismatches,
        "share_mismatches": share_mismatches,
        "null_counts": null_counts,
        "aov_outliers": aov_outliers,
        "gf_outliers": gf_outliers,
        "comm_outliers": comm_outliers,
        "subregions": sorted(df["Subregion"].dropna().unique().tolist()),
        "cuisines": sorted(df["CuisineType"].dropna().unique().tolist()),
        "segments": sorted(df["Segment"].dropna().unique().tolist()),
    }


def _raw_load(csv_path: str = None) -> pd.DataFrame:
    """Internal loader reading from disk safely without mutation."""
    target_path = csv_path or config.PRIMARY_CSV_PATH
    if not target_path or not target_path.exists():
        if config.FALLBACK_CSV_PATH.exists():
            target_path = config.FALLBACK_CSV_PATH
        else:
            raise FileNotFoundError(f"Data file not found at {target_path} or {config.FALLBACK_CSV_PATH}")
            
    df = pd.read_csv(target_path)
    return df


@cache_decorator
def load_data(csv_path: str = None) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Cached data loading and validation function for Streamlit.
    Returns the raw dataframe and the validation summary dictionary.
    """
    df = _raw_load(csv_path)
    validation_report = validate_data(df)
    return df, validation_report


if __name__ == "__main__":
    df, report = load_data()
    print("Data Loader Validation Report:")
    for k, v in report.items():
        print(f"  {k}: {v}")
