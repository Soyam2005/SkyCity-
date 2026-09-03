/**
 * Chart & Matrix Heatmap rendering library for SkyCity DineMetrics
 * Built per Admin Dashboard UI Design System standards with Dark Mode & Dynamic Filters.
 */

window.DineCharts = {
  instances: {},

  destroy(id) {
    if (this.instances[id]) {
      this.instances[id].destroy();
      delete this.instances[id];
    }
  },

  resetZoom(id) {
    if (this.instances[id] && typeof this.instances[id].resetZoom === 'function') {
      this.instances[id].resetZoom();
    }
  },

  // Helper to get theme-aware colors
  getThemeColors() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
      textPrimary: isDark ? '#F4F5FA' : '#14152B',
      textSecondary: isDark ? '#A5A8C7' : '#565A78',
      textMuted: isDark ? '#727699' : '#8C8FA8',
      gridColor: isDark ? '#262842' : '#F0F1F7',
      tooltipBg: isDark ? '#121324' : '#14152B'
    };
  },

  // 1. Channel Market Share Donut
  renderDonut(canvasId, channelsData, metric = 'Orders') {
    this.destroy(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const theme = this.getThemeColors();
    const labels = channelsData.map(c => c.Channel);
    const data = channelsData.map(c => metric === 'Orders' ? c.Orders : c.Revenue);
    const colors = ['#5A6ACF', '#12B76A', '#F04438', '#8B5CF6'];

    this.instances[canvasId] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: document.documentElement.getAttribute('data-theme') === 'dark' ? '#17182B' : '#FFFFFF',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: { family: 'Inter', size: 12, weight: 500 },
              color: theme.textSecondary,
              usePointStyle: true,
              padding: 16
            }
          },
          tooltip: {
            backgroundColor: theme.tooltipBg,
            titleFont: { family: 'Inter', size: 12, weight: 700 },
            bodyFont: { family: 'Inter', size: 12 },
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: (item) => {
                const total = data.reduce((a, b) => a + b, 0);
                const pct = total > 0 ? ((item.raw / total) * 100).toFixed(1) : 0;
                return ` ${item.label}: ${item.raw.toLocaleString()} (${pct}%)`;
              }
            }
          }
        }
      }
    });
  },

  // 2. Channel Economics Comparison Bar
  renderEconomicsBar(canvasId, channelsData) {
    this.destroy(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const theme = this.getThemeColors();
    const labels = channelsData.map(c => c.Channel);

    this.instances[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Order Share (%)',
            data: channelsData.map(c => c.OrderShare),
            backgroundColor: '#5A6ACF',
            borderRadius: { topLeft: 4, topRight: 4 },
            barPercentage: 0.7
          },
          {
            label: 'Revenue Share (%)',
            data: channelsData.map(c => c.RevenueShare),
            backgroundColor: '#8B5CF6',
            borderRadius: { topLeft: 4, topRight: 4 },
            barPercentage: 0.7
          },
          {
            label: 'Net Margin (%)',
            data: channelsData.map(c => c.ProfitMargin),
            backgroundColor: '#F79009',
            borderRadius: { topLeft: 4, topRight: 4 },
            barPercentage: 0.7
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { family: 'Inter', size: 11 }, color: theme.textMuted }
          },
          y: {
            grid: { color: theme.gridColor },
            ticks: { font: { family: 'Inter', size: 11 }, color: theme.textMuted }
          }
        },
        plugins: {
          legend: {
            position: 'top',
            align: 'end',
            labels: { font: { family: 'Inter', size: 11 }, color: theme.textSecondary, usePointStyle: true }
          },
          tooltip: { backgroundColor: theme.tooltipBg, padding: 10, cornerRadius: 8 }
        }
      }
    });
  },

  // 3. Dynamic Cuisine Mix Stacked Bar
  renderCuisineMix(canvasId, cuisineMatrix) {
    this.destroy(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const theme = this.getThemeColors();
    const cuisines = Object.keys(cuisineMatrix);
    const channels = ['In-Store', 'Uber Eats', 'DoorDash', 'Self-Delivery'];
    const colors = ['#5A6ACF', '#12B76A', '#F04438', '#8B5CF6'];

    const datasets = channels.map((ch, idx) => ({
      label: ch,
      data: cuisines.map(c => cuisineMatrix[c][ch] || 0),
      backgroundColor: colors[idx],
      borderRadius: 2
    }));

    this.instances[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: cuisines,
        datasets: datasets
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            stacked: true,
            max: 100,
            grid: { color: theme.gridColor },
            ticks: { font: { family: 'Inter', size: 11 }, color: theme.textMuted }
          },
          y: {
            stacked: true,
            grid: { display: false },
            ticks: { font: { family: 'Inter', size: 11, weight: 600 }, color: theme.textPrimary }
          }
        },
        plugins: {
          legend: {
            position: 'top',
            align: 'end',
            labels: { font: { family: 'Inter', size: 11 }, color: theme.textSecondary, usePointStyle: true }
          },
          tooltip: {
            backgroundColor: theme.tooltipBg,
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (item) => ` ${item.dataset.label}: ${item.raw.toFixed(1)}%`
            }
          }
        }
      }
    });
  },

  // 4. Delivery Radius Scatter Chart with Zoom
  renderRadiusScatter(canvasId, restaurants) {
    this.destroy(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const theme = this.getThemeColors();
    const subregions = ['CBD', 'North Shore', 'South Auckland', 'West Auckland'];
    const colors = {
      'CBD': '#5A6ACF',
      'North Shore': '#8B5CF6',
      'South Auckland': '#F79009',
      'West Auckland': '#12B76A'
    };

    const datasets = subregions.map(sub => {
      const filtered = restaurants.filter(r => r.Subregion === sub);
      return {
        label: sub,
        data: filtered.map(r => ({
          x: r.DeliveryRadiusKM,
          y: r.SelfDeliveryNetProfit / Math.max(r.SelfDeliveryOrders, 1),
          name: r.RestaurantName,
          cost: r.DeliveryCostPerOrder
        })),
        backgroundColor: colors[sub],
        borderColor: '#FFFFFF',
        borderWidth: 1,
        pointRadius: 4.5,
        pointHoverRadius: 7
      };
    });

    this.instances[canvasId] = new Chart(ctx, {
      type: 'scatter',
      data: { datasets: datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: { display: true, text: 'Delivery Radius (Kilometers)', font: { family: 'Inter', size: 11 }, color: theme.textMuted },
            grid: { color: theme.gridColor },
            ticks: { font: { family: 'Inter', size: 11 }, color: theme.textMuted }
          },
          y: {
            title: { display: true, text: 'Profit / Order ($)', font: { family: 'Inter', size: 11 }, color: theme.textMuted },
            grid: { color: theme.gridColor },
            ticks: { font: { family: 'Inter', size: 11 }, color: theme.textMuted }
          }
        },
        plugins: {
          legend: {
            position: 'top',
            align: 'end',
            labels: { font: { family: 'Inter', size: 11 }, color: theme.textSecondary, usePointStyle: true }
          },
          tooltip: {
            backgroundColor: theme.tooltipBg,
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (ctx) => {
                const p = ctx.raw;
                return ` ${p.name}: ${p.x}km radius | $${p.y.toFixed(2)} profit/order (Cost: $${p.cost.toFixed(2)})`;
              }
            }
          },
          zoom: {
            pan: { enabled: true, mode: 'xy' },
            zoom: {
              wheel: { enabled: true, speed: 0.08 },
              pinch: { enabled: true },
              mode: 'xy'
            }
          }
        }
      }
    });
  },

  // 5. Dynamic Segment Mix Grouped Bar
  renderSegmentBar(canvasId, segmentMatrix) {
    this.destroy(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const theme = this.getThemeColors();
    const segments = Object.keys(segmentMatrix);
    const channels = ['In-Store', 'Uber Eats', 'DoorDash', 'Self-Delivery'];
    const colors = ['#5A6ACF', '#12B76A', '#F04438', '#8B5CF6'];

    const datasets = channels.map((ch, idx) => ({
      label: ch,
      data: segments.map(s => segmentMatrix[s][ch] || 0),
      backgroundColor: colors[idx],
      borderRadius: 4
    }));

    this.instances[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: segments,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { family: 'Inter', size: 11, weight: 600 }, color: theme.textPrimary }
          },
          y: {
            title: { display: true, text: 'Order Share (%)', font: { family: 'Inter', size: 11 }, color: theme.textMuted },
            grid: { color: theme.gridColor },
            ticks: { font: { family: 'Inter', size: 11 }, color: theme.textMuted }
          }
        },
        plugins: {
          legend: {
            position: 'top',
            align: 'end',
            labels: { font: { family: 'Inter', size: 11 }, color: theme.textSecondary, usePointStyle: true }
          },
          tooltip: {
            backgroundColor: theme.tooltipBg,
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (item) => ` ${item.dataset.label}: ${item.raw.toFixed(1)}%`
            }
          }
        }
      }
    });
  },

  // 6. Subregion vs Channel Matrix Heatmap
  renderSubregionHeatmapTable(containerId, subregionMatrix, rawCountsMatrix) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const subregions = ['CBD', 'North Shore', 'South Auckland', 'West Auckland'];
    const channels = ['In-Store', 'Uber Eats', 'DoorDash', 'Self-Delivery'];
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    let html = `
      <div class="heatmap-table-container">
        <table class="heatmap-table">
          <thead>
            <tr>
              <th style="text-align:left;">Subregion</th>
              <th>In-Store</th>
              <th>Uber Eats</th>
              <th>DoorDash</th>
              <th>Self-Delivery</th>
              <th>Total Volume</th>
            </tr>
          </thead>
          <tbody>
    `;

    subregions.forEach(sub => {
      if (!subregionMatrix[sub]) return;
      const rowShares = subregionMatrix[sub];
      const rowCounts = rawCountsMatrix[sub] || {};
      const rowTotal = (rowCounts['In-Store'] || 0) + (rowCounts['Uber Eats'] || 0) + (rowCounts['DoorDash'] || 0) + (rowCounts['Self-Delivery'] || 0);

      html += `<tr><td class="heatmap-row-header">${sub}</td>`;

      channels.forEach(ch => {
        const share = rowShares[ch] || 0;
        const count = rowCounts[ch] || 0;
        // Dynamic indigo-violet intensity
        const alpha = Math.min(Math.max((share / 55), 0.12), 0.85);
        const bg = isDark
          ? `rgba(109, 125, 227, ${alpha})`
          : `rgba(90, 106, 207, ${alpha})`;
        const textCol = share > 35 ? (isDark ? '#FFFFFF' : '#FFFFFF') : (isDark ? '#F4F5FA' : '#14152B');

        html += `
          <td style="background:${bg}; color:${textCol};">
            <span class="heatmap-cell-val">${share.toFixed(1)}%</span>
            <span class="heatmap-cell-sub">${count.toLocaleString()} orders</span>
          </td>
        `;
      });

      html += `<td style="font-weight:700; color:var(--text-primary); background:var(--bg-page);">${rowTotal.toLocaleString()}</td></tr>`;
    });

    html += `</tbody></table></div>`;
    container.innerHTML = html;
  },

  // 7. Side-by-Side Subregion Comparison Chart
  renderComparisonChart(canvasId, subA_name, subA_shares, subB_name, subB_shares) {
    this.destroy(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const theme = this.getThemeColors();
    const channels = ['In-Store', 'Uber Eats', 'DoorDash', 'Self-Delivery'];

    this.instances[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: channels,
        datasets: [
          {
            label: subA_name,
            data: channels.map(ch => subA_shares[ch] || 0),
            backgroundColor: '#5A6ACF',
            borderRadius: { topLeft: 4, topRight: 4 },
            barPercentage: 0.7
          },
          {
            label: subB_name,
            data: channels.map(ch => subB_shares[ch] || 0),
            backgroundColor: '#8B5CF6',
            borderRadius: { topLeft: 4, topRight: 4 },
            barPercentage: 0.7
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { family: 'Inter', size: 11, weight: 600 }, color: theme.textPrimary }
          },
          y: {
            title: { display: true, text: 'Order Share (%)', font: { family: 'Inter', size: 11 }, color: theme.textMuted },
            grid: { color: theme.gridColor },
            ticks: { font: { family: 'Inter', size: 11 }, color: theme.textMuted }
          }
        },
        plugins: {
          legend: {
            position: 'top',
            align: 'end',
            labels: { font: { family: 'Inter', size: 12, weight: 600 }, color: theme.textPrimary, usePointStyle: true }
          },
          tooltip: {
            backgroundColor: theme.tooltipBg,
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (item) => ` ${item.dataset.label}: ${item.raw.toFixed(1)}%`
            }
          }
        }
      }
    });
  },

  // 8. Simulator Profit Comparison Bar
  renderSimulatorComparison(canvasId, currentProfit, simulatedProfit, commSaved) {
    this.destroy(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const theme = this.getThemeColors();

    this.instances[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Current Net Profit', 'Commission Saved', 'Simulated Net Profit'],
        datasets: [{
          data: [currentProfit, commSaved, simulatedProfit],
          backgroundColor: ['#5A6ACF', '#12B76A', '#8B5CF6'],
          borderRadius: 6,
          barThickness: 44
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { family: 'Inter', size: 11, weight: 600 }, color: theme.textPrimary }
          },
          y: {
            grid: { color: theme.gridColor },
            ticks: {
              font: { family: 'Inter', size: 11 },
              color: theme.textMuted,
              callback: (v) => '$' + (v / 1000).toFixed(0) + 'k'
            }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: theme.tooltipBg,
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (item) => ` $${item.raw.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
            }
          }
        }
      }
    });
  }
};
