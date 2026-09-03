"""
Central configuration for SkyCity Auckland Order Channel Performance & Market Share Analytics.
Stores styling constants per the Admin Dashboard UI Design System.
"""
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
PRIMARY_CSV_PATH = DATA_DIR / "SkyCity_Auckland_Restaurants___Bars.csv"
FALLBACK_CSV_PATH = BASE_DIR / "SkyCity Auckland Restaurants & Bars.csv"

# KPI & Risk Thresholds
DEPENDENCE_RISK_THRESHOLD = 0.70  # 70% threshold for single aggregator or aggregator dominance

# Admin Dashboard UI Design System Color Palette
COLOR_PAGE_BG = "#F6F7FB"
COLOR_SIDEBAR_BG = "#FFFFFF"
COLOR_CARD_BG = "#FFFFFF"
COLOR_BORDER = "#E7E9F3"
COLOR_TEXT_PRIMARY = "#14152B"
COLOR_TEXT_SECONDARY = "#565A78"
COLOR_TEXT_MUTED = "#8C8FA8"

COLOR_BRAND_INDIGO = "#5A6ACF"
COLOR_BRAND_VIOLET = "#8B5CF6"
COLOR_SUCCESS_GREEN = "#12B76A"
COLOR_SUCCESS_BG = "#E7FAF0"
COLOR_SUCCESS_TEXT = "#027A48"

COLOR_WARNING_AMBER = "#F79009"
COLOR_WARNING_BG = "#FFFAEB"
COLOR_WARNING_TEXT = "#B54708"

COLOR_ERROR_RED = "#F04438"
COLOR_ERROR_BG = "#FEF3F2"
COLOR_ERROR_TEXT = "#B42318"

COLOR_NEUTRAL_GRAY_BG = "#F2F4F7"
COLOR_NEUTRAL_GRAY_TEXT = "#475467"

# Fixed Channel Color Mapping
CHANNEL_COLORS = {
    "In-Store": "#5A6ACF",       # Brand Indigo
    "Uber Eats": "#12B76A",      # Success Green
    "DoorDash": "#F04438",       # Error / Alert Red
    "Self-Delivery": "#8B5CF6",  # Brand Violet
}

CHANNELS = ["In-Store", "Uber Eats", "DoorDash", "Self-Delivery"]

# Column Mappings
ORDER_COLS = {
    "In-Store": "InStoreOrders",
    "Uber Eats": "UberEatsOrders",
    "DoorDash": "DoorDashOrders",
    "Self-Delivery": "SelfDeliveryOrders",
}

REVENUE_COLS = {
    "In-Store": "InStoreRevenue",
    "Uber Eats": "UberEatsRevenue",
    "DoorDash": "DoorDashRevenue",
    "Self-Delivery": "SelfDeliveryRevenue",
}

SHARE_COLS = {
    "In-Store": "InStoreShare",
    "Uber Eats": "UE_share",
    "DoorDash": "DD_share",
    "Self-Delivery": "SD_share",
}

PROFIT_COLS = {
    "In-Store": "InStoreNetProfit",
    "Uber Eats": "UberEatsNetProfit",
    "DoorDash": "DoorDashNetProfit",
    "Self-Delivery": "SelfDeliveryNetProfit",
}

# Dimension Values
SUBREGIONS = ["CBD", "North Shore", "South Auckland", "West Auckland"]
SEGMENTS = ["Cafe", "Full-service", "Ghost Kitchen", "QSR"]
CUISINES = [
    "Burgers",
    "Chicken Dishes",
    "Chinese",
    "Indian",
    "Japanese",
    "Kebabs/Mediterranean",
    "Pizza",
    "Thai",
]

# Validation Range Bounds
AOV_MIN, AOV_MAX = 29.79, 47.23
GROWTH_FACTOR_MIN, GROWTH_FACTOR_MAX = 0.99, 1.05
COMMISSION_RATE_MIN, COMMISSION_RATE_MAX = 0.0, 0.40
COGS_RATE_MIN, COGS_RATE_MAX = 0.0, 1.0
OPEX_RATE_MIN, OPEX_RATE_MAX = 0.0, 1.0
