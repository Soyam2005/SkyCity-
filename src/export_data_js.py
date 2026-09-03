"""
Auto-sync pipeline: Generates web/js/data.js and JSON data payloads from the live CSV dataset.
"""
import json
from pathlib import Path
import pandas as pd
import sys

ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import config
from src.data_loader import load_data
from src.metrics import (
    compute_kpis,
    get_dimension_channel_matrix,
    get_market_summary,
    get_channel_breakdown,
)

def build_data_payload() -> dict:
    """Builds the complete analytical dataset payload from the CSV."""
    raw_df, val_report = load_data()
    df = compute_kpis(raw_df)
    
    # 1. Individual restaurant rows
    restaurants = []
    for _, row in df.iterrows():
        rest_dict = {
            "RestaurantID": int(row["RestaurantID"]),
            "RestaurantName": str(row["RestaurantName"]),
            "CuisineType": str(row["CuisineType"]),
            "Segment": str(row["Segment"]),
            "Subregion": str(row["Subregion"]),
            "MonthlyOrders": int(row["MonthlyOrders"]),
            "InStoreOrders": int(row[config.ORDER_COLS["In-Store"]]),
            "UberEatsOrders": int(row[config.ORDER_COLS["Uber Eats"]]),
            "DoorDashOrders": int(row[config.ORDER_COLS["DoorDash"]]),
            "SelfDeliveryOrders": int(row[config.ORDER_COLS["Self-Delivery"]]),
            "TotalRevenue": float(round(row["TotalRevenue"], 2)),
            "TotalNetProfit": float(round(row["TotalNetProfit"], 2)),
            "OverallProfitMargin": float(round(row["OverallProfitMargin"], 4)),
            "InStoreRevenue": float(round(row[config.REVENUE_COLS["In-Store"]], 2)),
            "UberEatsRevenue": float(round(row[config.REVENUE_COLS["Uber Eats"]], 2)),
            "DoorDashRevenue": float(round(row[config.REVENUE_COLS["DoorDash"]], 2)),
            "SelfDeliveryRevenue": float(round(row[config.REVENUE_COLS["Self-Delivery"]], 2)),
            "InStoreNetProfit": float(round(row[config.PROFIT_COLS["In-Store"]], 2)),
            "UberEatsNetProfit": float(round(row[config.PROFIT_COLS["Uber Eats"]], 2)),
            "DoorDashNetProfit": float(round(row[config.PROFIT_COLS["DoorDash"]], 2)),
            "SelfDeliveryNetProfit": float(round(row[config.PROFIT_COLS["Self-Delivery"]], 2)),
            "InStoreOrderShare": float(round(row["InStoreOrderShare"], 4)),
            "UberEatsOrderShare": float(round(row["UberEatsOrderShare"], 4)),
            "DoorDashOrderShare": float(round(row["DoorDashOrderShare"], 4)),
            "SelfDeliveryOrderShare": float(round(row["SelfDeliveryOrderShare"], 4)),
            "AggregatorDependence": float(round(row["AggregatorDependence"], 4)),
            "InStoreReliance": float(round(row["InStoreReliance"], 4)),
            "DiversificationScore": float(round(row["DiversificationScore"], 4)),
            "RiskFlag": bool(row["RiskFlag"]),
            "DeliveryRadiusKM": float(row["DeliveryRadiusKM"]),
            "DeliveryCostPerOrder": float(round(row["DeliveryCostPerOrder"], 2)),
            "AOV": float(round(row["AOV"], 2)),
            "CommissionRate": float(round(row["CommissionRate"], 4)),
            "COGSRate": float(round(row["COGSRate"], 4)),
            "OPEXRate": float(round(row["OPEXRate"], 4)),
            "In-Store_ProfitPerOrder": float(round(row["In-Store_ProfitPerOrder"], 2)),
            "Uber Eats_ProfitPerOrder": float(round(row["Uber Eats_ProfitPerOrder"], 2)),
            "DoorDash_ProfitPerOrder": float(round(row["DoorDash_ProfitPerOrder"], 2)),
            "Self-Delivery_ProfitPerOrder": float(round(row["Self-Delivery_ProfitPerOrder"], 2)),
        }
        restaurants.append(rest_dict)
    
    # 2. Aggregations & Matrices
    market_summary = get_market_summary(df)
    channel_breakdown = get_channel_breakdown(df).to_dict(orient="records")
    cuisine_matrix = get_dimension_channel_matrix(df, "CuisineType", value_type="share").to_dict(orient="index")
    segment_matrix = get_dimension_channel_matrix(df, "Segment", value_type="share").to_dict(orient="index")
    subregion_matrix = get_dimension_channel_matrix(df, "Subregion", value_type="share").to_dict(orient="index")
    
    payload = {
        "validation_report": val_report,
        "market_summary": market_summary,
        "channel_breakdown": channel_breakdown,
        "cuisines": cuisine_matrix,
        "segments": segment_matrix,
        "subregions": subregion_matrix,
        "restaurants": restaurants,
    }
    return payload

def sync_data_js(output_path: Path = None) -> Path:
    """Exports data to web/js/data.js."""
    target_path = output_path or (ROOT_DIR / "web" / "js" / "data.js")
    payload = build_data_payload()
    
    js_content = f"window.SKY_DATA = {json.dumps(payload, indent=2)};"
    target_path.parent.mkdir(parents=True, exist_ok=True)
    with open(target_path, "w", encoding="utf-8") as f:
        f.write(js_content)
    
    return target_path

if __name__ == "__main__":
    out = sync_data_js()
    print(f"Successfully synced data to: {out}")
