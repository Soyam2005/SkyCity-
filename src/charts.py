"""
Plotly visualization components for SkyCity Auckland Order Channel Analytics.
Strictly adheres to the Admin Dashboard UI Design System.
"""
import sys
from pathlib import Path
from typing import Dict, Any, List
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go

# Add project root to sys.path if not present
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import config
from src.metrics import get_channel_breakdown, get_dimension_channel_matrix

def _apply_layout_defaults(fig: go.Figure, title: str = "") -> go.Figure:
    """Applies clean, uniform layout styling per the Admin Dashboard Design System."""
    fig.update_layout(
        title={
            "text": f"<b>{title}</b>" if title else "",
            "font": {"size": 15, "color": config.COLOR_TEXT_PRIMARY, "family": "Inter, sans-serif"},
            "x": 0.01,
            "xanchor": "left"
        },
        paper_bgcolor=config.COLOR_CARD_BG,
        plot_bgcolor="#FFFFFF",
        font={"family": "Inter, sans-serif", "color": config.COLOR_TEXT_SECONDARY, "size": 12},
        margin={"l": 40, "r": 20, "t": 55 if title else 25, "b": 35},
        legend={
            "orientation": "h",
            "yanchor": "bottom",
            "y": 1.02,
            "xanchor": "right",
            "x": 1,
            "title_text": "",
            "font": {"size": 11, "color": config.COLOR_TEXT_SECONDARY},
        },
        hoverlabel={
            "bgcolor": config.COLOR_TEXT_PRIMARY,
            "font_color": "#FFFFFF",
            "font_family": "Inter, sans-serif",
            "font_size": 12,
            "bordercolor": config.COLOR_TEXT_PRIMARY,
        },
    )
    fig.update_xaxes(
        showgrid=False,
        zeroline=False,
        tickfont={"size": 11, "color": config.COLOR_TEXT_MUTED},
        linecolor=config.COLOR_BORDER,
    )
    fig.update_yaxes(
        showgrid=True,
        gridcolor="#F0F1F7",
        gridwidth=1,
        zeroline=False,
        tickfont={"size": 11, "color": config.COLOR_TEXT_MUTED},
    )
    return fig


def chart_channel_shares_donut(df: pd.DataFrame, metric: str = "Orders") -> go.Figure:
    """Full donut breakdown chart with 65% inner radius matching design system."""
    breakdown = get_channel_breakdown(df)
    if breakdown.empty:
        return go.Figure()
        
    value_col = "Orders" if metric == "Orders" else "Revenue"
    
    fig = go.Figure(
        data=[
            go.Pie(
                labels=breakdown["Channel"],
                values=breakdown[value_col],
                hole=0.65,
                marker=dict(
                    colors=[config.CHANNEL_COLORS[ch] for ch in breakdown["Channel"]],
                    line=dict(color="#FFFFFF", width=2),
                ),
                textinfo="percent",
                hovertemplate="<b>%{label}</b><br>" + metric + ": %{value:,.0f}<br>Share: %{percent}<extra></extra>",
                textfont=dict(size=12, color="#FFFFFF", family="Inter"),
            )
        ]
    )
    _apply_layout_defaults(fig, f"Channel Market Share by {metric}")
    fig.update_layout(showlegend=True)
    return fig


def chart_channel_economics_comparison(df: pd.DataFrame) -> go.Figure:
    """Grouped bar chart with 4px top radius comparing Order Share vs Revenue Share vs Margin."""
    breakdown = get_channel_breakdown(df)
    if breakdown.empty:
        return go.Figure()
        
    fig = go.Figure()
    
    fig.add_trace(
        go.Bar(
            name="Order Share (%)",
            x=breakdown["Channel"],
            y=breakdown["OrderShare"],
            marker_color=config.COLOR_BRAND_INDIGO,
            text=breakdown["OrderShare"].apply(lambda x: f"{x:.1f}%"),
            textposition="auto",
        )
    )
    
    fig.add_trace(
        go.Bar(
            name="Revenue Share (%)",
            x=breakdown["Channel"],
            y=breakdown["RevenueShare"],
            marker_color=config.COLOR_BRAND_VIOLET,
            text=breakdown["RevenueShare"].apply(lambda x: f"{x:.1f}%"),
            textposition="auto",
        )
    )
    
    fig.add_trace(
        go.Bar(
            name="Net Profit Margin (%)",
            x=breakdown["Channel"],
            y=breakdown["ProfitMargin"],
            marker_color=config.COLOR_WARNING_AMBER,
            text=breakdown["ProfitMargin"].apply(lambda x: f"{x:.1f}%"),
            textposition="auto",
        )
    )
    
    _apply_layout_defaults(fig, "Order Share vs Revenue Share vs Net Profit Margin")
    fig.update_layout(
        barmode="group",
        yaxis_title="Percentage (%)",
        yaxis_title_font={"size": 11, "color": config.COLOR_TEXT_MUTED},
    )
    return fig


def chart_subregion_heatmap(df: pd.DataFrame, metric: str = "share") -> go.Figure:
    """Sequential Indigo/Violet heatmap showing Subregion × Channel share or order volume."""
    matrix = get_dimension_channel_matrix(df, "Subregion", metric)
    if matrix.empty:
        return go.Figure()
        
    custom_text = [
        [f"{val:.1f}%" if metric == "share" else f"{val:,.0f}" for val in row]
        for row in matrix.values
    ]
    
    fig = go.Figure(
        data=go.Heatmap(
            z=matrix.values,
            x=matrix.columns.tolist(),
            y=matrix.index.tolist(),
            colorscale=[[0, "#EEF0FF"], [0.5, "#8B5CF6"], [1.0, "#5A6ACF"]],
            text=custom_text,
            texttemplate="%{text}",
            textfont={"size": 12, "family": "Inter, sans-serif"},
            colorbar=dict(
                title=dict(text="Share (%)" if metric == "share" else "Orders", font=dict(size=11, color=config.COLOR_TEXT_MUTED)),
                thickness=14,
            ),
            hovertemplate="<b>Subregion:</b> %{y}<br><b>Channel:</b> %{x}<br><b>Value:</b> %{text}<extra></extra>",
        )
    )
    _apply_layout_defaults(fig, f"Subregion × Channel Matrix ({'Order Share %' if metric == 'share' else 'Total Orders'})")
    fig.update_layout(yaxis=dict(autorange="reversed"))
    return fig


def chart_cuisine_channel_stacked(df: pd.DataFrame, metric: str = "share") -> go.Figure:
    """Stacked bar chart of Cuisine Types showing channel breakdown."""
    matrix = get_dimension_channel_matrix(df, "CuisineType", metric)
    if matrix.empty:
        return go.Figure()
        
    fig = go.Figure()
    for ch in config.CHANNELS:
        if ch in matrix.columns:
            fig.add_trace(
                go.Bar(
                    name=ch,
                    y=matrix.index,
                    x=matrix[ch],
                    orientation="h",
                    marker_color=config.CHANNEL_COLORS[ch],
                    text=matrix[ch].apply(lambda x: f"{x:.1f}%" if metric == "share" else f"{x:,.0f}"),
                    textposition="inside",
                    insidetextanchor="middle",
                )
            )
            
    _apply_layout_defaults(fig, f"Channel Distribution Across Cuisine Types ({'Share %' if metric == 'share' else 'Orders'})")
    fig.update_layout(
        barmode="stack",
        xaxis_title="Share (%)" if metric == "share" else "Total Orders",
        yaxis=dict(autorange="reversed"),
    )
    return fig


def chart_segment_channel_grouped(df: pd.DataFrame, metric: str = "share") -> go.Figure:
    """Grouped bar chart for Business Segments comparing channel adoption."""
    matrix = get_dimension_channel_matrix(df, "Segment", metric)
    if matrix.empty:
        return go.Figure()
        
    fig = go.Figure()
    for ch in config.CHANNELS:
        if ch in matrix.columns:
            fig.add_trace(
                go.Bar(
                    name=ch,
                    x=matrix.index,
                    y=matrix[ch],
                    marker_color=config.CHANNEL_COLORS[ch],
                    text=matrix[ch].apply(lambda x: f"{x:.1f}%" if metric == "share" else f"{x:,.0f}"),
                    textposition="auto",
                )
            )
            
    _apply_layout_defaults(fig, f"Channel Reliance by Restaurant Segment ({'Share %' if metric == 'share' else 'Orders'})")
    fig.update_layout(
        barmode="group",
        yaxis_title="Share (%)" if metric == "share" else "Total Orders",
        xaxis_title="Segment",
    )
    return fig


def chart_risk_distribution(df: pd.DataFrame) -> go.Figure:
    """Distribution histogram of Aggregator Dependence with 70% threshold annotation."""
    if df.empty:
        return go.Figure()
        
    dependence_pct = df["AggregatorDependence"] * 100.0
    
    fig = go.Figure()
    fig.add_trace(
        go.Histogram(
            x=dependence_pct,
            nbinsx=30,
            marker_color=config.COLOR_BRAND_INDIGO,
            opacity=0.85,
            name="Restaurants",
            hovertemplate="Dependence Range: %{x:.1f}%<br>Count: %{y}<extra></extra>",
        )
    )
    
    # Vertical line at 70% risk threshold
    fig.add_vline(
        x=config.DEPENDENCE_RISK_THRESHOLD * 100.0,
        line_width=2.5,
        line_dash="dash",
        line_color=config.COLOR_ERROR_RED,
        annotation_text="70% High Risk Threshold",
        annotation_position="top right",
        annotation_font_color=config.COLOR_ERROR_RED,
        annotation_font_size=11,
    )
    
    _apply_layout_defaults(fig, "Distribution of Aggregator Dependence (Uber Eats + DoorDash)")
    fig.update_layout(
        xaxis_title="Aggregator Dependence (% of Monthly Orders)",
        yaxis_title="Number of Restaurants",
        showlegend=False,
    )
    return fig


def chart_restaurant_channel_radar(row: pd.Series) -> go.Figure:
    """Radar chart for single restaurant drill-down channel share."""
    channels = config.CHANNELS
    shares = [
        row.get("InStoreOrderShare", 0) * 100.0,
        row.get("UberEatsOrderShare", 0) * 100.0,
        row.get("DoorDashOrderShare", 0) * 100.0,
        row.get("SelfDeliveryOrderShare", 0) * 100.0,
    ]
    
    fig = go.Figure()
    fig.add_trace(
        go.Scatterpolar(
            r=shares + [shares[0]],
            theta=channels + [channels[0]],
            fill="toself",
            fillcolor="rgba(90, 106, 207, 0.2)",
            line=dict(color=config.COLOR_BRAND_INDIGO, width=2),
            name="Channel Share %",
            hovertemplate="<b>%{theta}:</b> %{r:.1f}%<extra></extra>",
        )
    )
    
    _apply_layout_defaults(fig, "Channel Mix Radar")
    fig.update_layout(
        polar=dict(
            radialaxis=dict(visible=True, range=[0, max(max(shares) + 10, 50)], gridcolor="#F0F1F7"),
            angularaxis=dict(gridcolor="#F0F1F7"),
        ),
        showlegend=False,
    )
    return fig


def chart_delivery_radius_vs_profit(df: pd.DataFrame) -> go.Figure:
    """Scatter plot evaluating Delivery Radius (KM) vs Self-Delivery Profit Per Order and Cost."""
    if df.empty:
        return go.Figure()
        
    subregion_colors = {
        "CBD": "#5A6ACF",
        "North Shore": "#8B5CF6",
        "South Auckland": "#F79009",
        "West Auckland": "#12B76A",
    }
    
    fig = go.Figure()
    
    for sub in config.SUBREGIONS:
        sub_df = df[df["Subregion"] == sub]
        if not sub_df.empty:
            fig.add_trace(
                go.Scatter(
                    x=sub_df["DeliveryRadiusKM"],
                    y=sub_df["Self-Delivery_ProfitPerOrder"],
                    mode="markers",
                    name=sub,
                    marker=dict(
                        size=sub_df["MonthlyOrders"] / 100 + 4,
                        color=subregion_colors.get(sub, config.COLOR_BRAND_INDIGO),
                        opacity=0.75,
                        line=dict(width=1, color="#FFFFFF"),
                    ),
                    text=sub_df["RestaurantName"],
                    customdata=sub_df[["DeliveryCostPerOrder", "SelfDeliveryOrders", "AOV"]],
                    hovertemplate=(
                        "<b>%{text}</b><br>"
                        "Subregion: " + sub + "<br>"
                        "Delivery Radius: %{x} km<br>"
                        "Self-Delivery Profit/Order: $%{y:.2f}<br>"
                        "Delivery Cost/Order: $%{customdata[0]:.2f}<br>"
                        "Monthly SD Orders: %{customdata[1]:,}<extra></extra>"
                    ),
                )
            )
            
    _apply_layout_defaults(fig, "Delivery Radius (KM) vs Self-Delivery Profit Per Order")
    fig.update_layout(
        xaxis_title="Delivery Radius (Kilometers)",
        yaxis_title="Self-Delivery Profit Per Order ($)",
        legend=dict(orientation="h", y=1.05, x=1, xanchor="right"),
    )
    return fig


def chart_simulation_waterfall(sim_result: Dict[str, Any], target_channel: str = "Self-Delivery") -> go.Figure:
    """Waterfall chart visualizing the profit bridge from Baseline to Simulated Profit."""
    baseline = sim_result.get("baseline_profit", 0)
    commission_saved = sim_result.get("commission_saved", 0)
    simulated = sim_result.get("simulated_profit", 0)
    net_gain = sim_result.get("profit_gain", 0)
    extra_delivery_cost = commission_saved - net_gain if target_channel == "Self-Delivery" else 0.0
    
    if target_channel == "Self-Delivery":
        x_steps = [
            "Current Profit",
            "Commissions Saved",
            "Added Delivery Cost",
            "Simulated Profit",
        ]
        y_vals = [
            baseline,
            commission_saved,
            -extra_delivery_cost,
            simulated,
        ]
        measures = ["absolute", "relative", "relative", "total"]
    else:
        x_steps = [
            "Current Profit",
            "Commissions Saved",
            "Simulated Profit",
        ]
        y_vals = [
            baseline,
            commission_saved,
            simulated,
        ]
        measures = ["absolute", "relative", "total"]
        
    fig = go.Figure(
        go.Waterfall(
            name="Profit Impact",
            orientation="v",
            measure=measures,
            x=x_steps,
            textposition="outside",
            text=[f"${v:,.0f}" for v in y_vals],
            y=y_vals,
            connector={"line": {"color": config.COLOR_BORDER}},
            increasing={"marker": {"color": config.COLOR_SUCCESS_GREEN}},
            decreasing={"marker": {"color": config.COLOR_ERROR_RED}},
            totals={"marker": {"color": config.COLOR_BRAND_INDIGO}},
        )
    )
    
    _apply_layout_defaults(fig, f"Simulated Monthly Profit Bridge (Target: {target_channel})")
    fig.update_layout(yaxis_title="Monthly Net Profit ($)")
    return fig
