/**
 * SkyCity DineMetrics — Main Web Application Controller
 * Features: Dynamic Multi-Filter Aggregations, Channel Toggle, Subregion Heatmap,
 * Reports Viewer, Live CSV Data Sync, and Dark Mode.
 */

document.addEventListener('DOMContentLoaded', () => {
  let data = window.SKY_DATA;
  if (!data) {
    console.warn('window.SKY_DATA not found, attempting live fetch from /api/data');
    fetchLiveApiData();
    return;
  }

  // State Management
  const state = {
    subregion: 'All',
    cuisine: 'All',
    segment: 'All',
    channelMode: 'all', // 'all', 'in-store', 'delivery', 'aggregators', 'direct'
    activeTab: 'tab-overview',
    theme: localStorage.getItem('sky_theme') || 'light',
    compA: 'CBD',
    compB: 'South Auckland',
    activeReport: 'research-paper'
  };

  // 1. Theme Switcher (Dark / Light Mode)
  function initTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
      themeBtn.textContent = state.theme === 'dark' ? '☀️' : '🌙';
      themeBtn.addEventListener('click', () => {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', state.theme);
        localStorage.setItem('sky_theme', state.theme);
        themeBtn.textContent = state.theme === 'dark' ? '☀️' : '🌙';
        updateApp();
      });
    }
  }

  // 2. Channel Toggle Segmented Bar
  function initChannelToggle() {
    const btns = document.querySelectorAll('.segment-btn[data-mode]');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.channelMode = btn.getAttribute('data-mode');
        updateApp();
      });
    });
  }

  // 3. Populate Select Options
  function initFilters() {
    const subregions = ['All', 'CBD', 'North Shore', 'South Auckland', 'West Auckland'];
    const cuisines = ['All', 'Burgers', 'Chicken Dishes', 'Chinese', 'Indian', 'Japanese', 'Kebabs/Mediterranean', 'Pizza', 'Thai'];
    const segments = ['All', 'Cafe', 'Full-service', 'Ghost Kitchen', 'QSR'];

    const subSelect = document.getElementById('subregionSelect');
    const cuiSelect = document.getElementById('cuisineSelect');
    const segSelect = document.getElementById('segmentSelect');

    if (subSelect) subSelect.innerHTML = subregions.map(s => `<option value="${s}">${s}</option>`).join('');
    if (cuiSelect) cuiSelect.innerHTML = cuisines.map(c => `<option value="${c}">${c}</option>`).join('');
    if (segSelect) segSelect.innerHTML = segments.map(s => `<option value="${s}">${s}</option>`).join('');

    // Comparison Selectors
    const compASelect = document.getElementById('compASelect');
    const compBSelect = document.getElementById('compBSelect');
    const pureSubregions = ['CBD', 'North Shore', 'South Auckland', 'West Auckland'];

    if (compASelect) {
      compASelect.innerHTML = pureSubregions.map(s => `<option value="${s}" ${s === state.compA ? 'selected' : ''}>${s}</option>`).join('');
      compASelect.addEventListener('change', (e) => { state.compA = e.target.value; updateComparisonView(); });
    }
    if (compBSelect) {
      compBSelect.innerHTML = pureSubregions.map(s => `<option value="${s}" ${s === state.compB ? 'selected' : ''}>${s}</option>`).join('');
      compBSelect.addEventListener('change', (e) => { state.compB = e.target.value; updateComparisonView(); });
    }

    // Global Filter listeners
    if (subSelect) subSelect.addEventListener('change', (e) => { state.subregion = e.target.value; updateApp(); });
    if (cuiSelect) cuiSelect.addEventListener('change', (e) => { state.cuisine = e.target.value; updateApp(); });
    if (segSelect) segSelect.addEventListener('change', (e) => { state.segment = e.target.value; updateApp(); });

    // Live Reload button
    const reloadBtn = document.getElementById('reloadBtn');
    if (reloadBtn) {
      reloadBtn.addEventListener('click', async () => {
        reloadBtn.textContent = '🔄 Syncing...';
        await fetchLiveApiData();
        reloadBtn.textContent = '🔄 Sync CSV';
      });
    }
  }

  // 4. Live API Data Fetch
  async function fetchLiveApiData() {
    try {
      const res = await fetch('/api/data');
      if (res.ok) {
        data = await res.json();
        window.SKY_DATA = data;
        updateApp();
        console.log('Successfully fetched live data from /api/data');
      }
    } catch (err) {
      console.warn('API fetch skipped or failed, using local window.SKY_DATA:', err);
    }
  }

  // 5. Filter Data by Global Filters & Channel Mode
  function getFilteredRestaurants() {
    return (data.restaurants || []).filter(r => {
      const matchSub = state.subregion === 'All' || r.Subregion === state.subregion;
      const matchCui = state.cuisine === 'All' || r.CuisineType === state.cuisine;
      const matchSeg = state.segment === 'All' || r.Segment === state.segment;
      return matchSub && matchCui && matchSeg;
    });
  }

  // 6. Dynamic Matrix Calculations from Filtered Subset
  function computeDynamicDimensionMatrix(restaurants, dimKey) {
    const counts = {};
    const channels = ['In-Store', 'Uber Eats', 'DoorDash', 'Self-Delivery'];
    const channelKeys = {
      'In-Store': 'InStoreOrders',
      'Uber Eats': 'UberEatsOrders',
      'DoorDash': 'DoorDashOrders',
      'Self-Delivery': 'SelfDeliveryOrders'
    };

    restaurants.forEach(r => {
      const val = r[dimKey];
      if (!val) return;
      if (!counts[val]) {
        counts[val] = { 'In-Store': 0, 'Uber Eats': 0, 'DoorDash': 0, 'Self-Delivery': 0, total: 0 };
      }
      channels.forEach(ch => {
        const c = r[channelKeys[ch]] || 0;
        counts[val][ch] += c;
        counts[val].total += c;
      });
    });

    const shares = {};
    Object.keys(counts).forEach(k => {
      shares[k] = {};
      const tot = counts[k].total || 1;
      channels.forEach(ch => {
        shares[k][ch] = (counts[k][ch] / tot) * 100.0;
      });
    });

    return { shares, counts };
  }

  // 7. Compute Aggregations (Honoring Channel Mode)
  function computeMetrics(restaurants) {
    let totalOrders = 0;
    let totalRev = 0;
    let totalProfit = 0;
    let highRiskCount = 0;

    const channelTotals = {
      'In-Store': { Orders: 0, Revenue: 0, NetProfit: 0 },
      'Uber Eats': { Orders: 0, Revenue: 0, NetProfit: 0 },
      'DoorDash': { Orders: 0, Revenue: 0, NetProfit: 0 },
      'Self-Delivery': { Orders: 0, Revenue: 0, NetProfit: 0 }
    };

    restaurants.forEach(r => {
      if (r.RiskFlag) highRiskCount++;

      channelTotals['In-Store'].Orders += r.InStoreOrders || 0;
      channelTotals['In-Store'].Revenue += r.InStoreRevenue || 0;
      channelTotals['In-Store'].NetProfit += r.InStoreNetProfit || 0;

      channelTotals['Uber Eats'].Orders += r.UberEatsOrders || 0;
      channelTotals['Uber Eats'].Revenue += r.UberEatsRevenue || 0;
      channelTotals['Uber Eats'].NetProfit += r.UberEatsNetProfit || 0;

      channelTotals['DoorDash'].Orders += r.DoorDashOrders || 0;
      channelTotals['DoorDash'].Revenue += r.DoorDashRevenue || 0;
      channelTotals['DoorDash'].NetProfit += r.DoorDashNetProfit || 0;

      channelTotals['Self-Delivery'].Orders += r.SelfDeliveryOrders || 0;
      channelTotals['Self-Delivery'].Revenue += r.SelfDeliveryRevenue || 0;
      channelTotals['Self-Delivery'].NetProfit += r.SelfDeliveryNetProfit || 0;
    });

    // Apply Channel Mode filter
    let activeChannels = ['In-Store', 'Uber Eats', 'DoorDash', 'Self-Delivery'];
    if (state.channelMode === 'in-store') {
      activeChannels = ['In-Store'];
    } else if (state.channelMode === 'delivery') {
      activeChannels = ['Uber Eats', 'DoorDash', 'Self-Delivery'];
    } else if (state.channelMode === 'aggregators') {
      activeChannels = ['Uber Eats', 'DoorDash'];
    } else if (state.channelMode === 'direct') {
      activeChannels = ['In-Store', 'Self-Delivery'];
    }

    activeChannels.forEach(ch => {
      totalOrders += channelTotals[ch].Orders;
      totalRev += channelTotals[ch].Revenue;
      totalProfit += channelTotals[ch].NetProfit;
    });

    const channels = activeChannels.map(ch => {
      const o = channelTotals[ch].Orders;
      const rev = channelTotals[ch].Revenue;
      const prof = channelTotals[ch].NetProfit;
      return {
        Channel: ch,
        Orders: o,
        OrderShare: totalOrders > 0 ? (o / totalOrders * 100) : 0,
        Revenue: rev,
        RevenueShare: totalRev > 0 ? (rev / totalRev * 100) : 0,
        NetProfit: prof,
        ProfitMargin: rev > 0 ? (prof / rev * 100) : 0,
        ProfitPerOrder: o > 0 ? (prof / o) : 0
      };
    });

    return {
      totalOrders,
      totalRev,
      totalProfit,
      margin: totalRev > 0 ? (totalProfit / totalRev * 100) : 0,
      highRiskCount,
      highRiskPct: restaurants.length > 0 ? (highRiskCount / restaurants.length * 100) : 0,
      channels
    };
  }

  // 8. Update UI Elements
  function updateApp() {
    const restaurants = getFilteredRestaurants();
    const metrics = computeMetrics(restaurants);

    // Update Top Navbar Badge
    const badge = document.getElementById('filterBadge');
    if (badge) badge.textContent = `${restaurants.length.toLocaleString()} Active Branches`;

    // 1. Update Signature Metric Cards
    const heroProfit = document.getElementById('metricHeroProfit');
    const heroMargin = document.getElementById('metricHeroMargin');
    const flatOrders = document.getElementById('metricOrders');
    const flatRev = document.getElementById('metricRevenue');
    const flatRisk = document.getElementById('metricRisk');
    const riskBadge = document.getElementById('metricRiskBadge');

    if (heroProfit) heroProfit.textContent = '$' + Math.round(metrics.totalProfit).toLocaleString();
    if (heroMargin) heroMargin.textContent = `${metrics.margin.toFixed(1)}% Avg Margin (${state.channelMode.toUpperCase()})`;
    if (flatOrders) flatOrders.textContent = metrics.totalOrders.toLocaleString();
    if (flatRev) flatRev.textContent = '$' + Math.round(metrics.totalRev).toLocaleString();
    if (flatRisk) flatRisk.textContent = metrics.highRiskCount.toLocaleString();
    if (riskBadge) riskBadge.textContent = `${metrics.highRiskPct.toFixed(1)}% Ratio`;

    // 2. Render Tables & Heatmap
    renderChannelsTable(metrics.channels);
    renderRiskTable(restaurants.filter(r => r.RiskFlag));

    // Subregion Heatmap Matrix
    const subMatrixData = computeDynamicDimensionMatrix(restaurants, 'Subregion');
    window.DineCharts.renderSubregionHeatmapTable('subregionHeatmapContainer', subMatrixData.shares, subMatrixData.counts);

    // 3. Render Active Tab Visualizations
    renderActiveTabCharts(state.activeTab, metrics, restaurants);

    // 4. Update Simulator & Comparison
    updateSimulator(restaurants);
    updateComparisonView();
  }

  function renderActiveTabCharts(tabId, metrics, restaurants) {
    if (!metrics) {
      restaurants = getFilteredRestaurants();
      metrics = computeMetrics(restaurants);
    }

    const dynCuisines = computeDynamicDimensionMatrix(restaurants, 'CuisineType');
    const dynSegments = computeDynamicDimensionMatrix(restaurants, 'Segment');

    if (tabId === 'tab-overview') {
      window.DineCharts.renderDonut('channelDonutChart', metrics.channels);
      window.DineCharts.renderEconomicsBar('economicsBarChart', metrics.channels);
    } else if (tabId === 'tab-distance') {
      window.DineCharts.renderRadiusScatter('radiusScatterChart', restaurants);
      const subMatrixData = computeDynamicDimensionMatrix(restaurants, 'Subregion');
      window.DineCharts.renderSubregionHeatmapTable('subregionHeatmapContainer', subMatrixData.shares, subMatrixData.counts);
    } else if (tabId === 'tab-cuisines') {
      window.DineCharts.renderCuisineMix('cuisineMixChart', dynCuisines.shares);
    } else if (tabId === 'tab-segments') {
      window.DineCharts.renderSegmentBar('segmentBarChart', dynSegments.shares);
    } else if (tabId === 'tab-comparison') {
      updateComparisonView();
    } else if (tabId === 'tab-reports') {
      loadReport(state.activeReport);
    } else if (tabId === 'tab-simulator') {
      updateSimulator(restaurants);
    }
  }

  function renderChannelsTable(channels) {
    const tbody = document.getElementById('channelsTableBody');
    if (!tbody) return;

    tbody.innerHTML = channels.map(c => `
      <tr>
        <td style="font-weight:600; color:var(--text-primary);">${c.Channel}</td>
        <td>${c.Orders.toLocaleString()}</td>
        <td>${c.OrderShare.toFixed(1)}%</td>
        <td>$${c.Revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td>${c.RevenueShare.toFixed(1)}%</td>
        <td>$${c.NetProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td><span class="trend-badge ${c.ProfitMargin > 15 ? 'trend-green' : (c.ProfitMargin < 5 ? 'trend-red' : 'trend-amber')}">${c.ProfitMargin.toFixed(1)}%</span></td>
        <td style="font-weight:600;">$${c.ProfitPerOrder.toFixed(2)}</td>
      </tr>
    `).join('');
  }

  function renderRiskTable(riskRestaurants) {
    const tbody = document.getElementById('riskTableBody');
    if (!tbody) return;

    const displayRows = riskRestaurants.slice(0, 20);
    tbody.innerHTML = displayRows.map(r => `
      <tr>
        <td style="font-weight:600; color:var(--text-primary);">${r.RestaurantName}</td>
        <td>${r.Subregion}</td>
        <td>${r.CuisineType}</td>
        <td>${r.Segment}</td>
        <td><span class="trend-badge trend-red">${((r.AggregatorDependence || 0) * 100).toFixed(1)}%</span></td>
        <td>${((r.InStoreOrderShare || 0) * 100).toFixed(1)}%</td>
        <td>${(r.DiversificationScore || 0).toFixed(2)}</td>
        <td>${((r.OverallProfitMargin || 0) * 100).toFixed(1)}%</td>
      </tr>
    `).join('');
  }

  // 9. Side-by-Side Subregion Comparison Logic
  function updateComparisonView() {
    const all = data.restaurants || [];
    const listA = all.filter(r => r.Subregion === state.compA);
    const listB = all.filter(r => r.Subregion === state.compB);

    const metA = computeMetrics(listA);
    const metB = computeMetrics(listB);

    // Update Header labels
    document.getElementById('compATitle').textContent = state.compA;
    document.getElementById('compBTitle').textContent = state.compB;

    // Update Subregion A metrics
    document.getElementById('compAOrders').textContent = metA.totalOrders.toLocaleString();
    document.getElementById('compARevenue').textContent = '$' + Math.round(metA.totalRev).toLocaleString();
    document.getElementById('compAProfit').textContent = '$' + Math.round(metA.totalProfit).toLocaleString();
    document.getElementById('compAMargin').textContent = `${metA.margin.toFixed(1)}%`;
    document.getElementById('compARisk').textContent = `${metA.highRiskCount} (${metA.highRiskPct.toFixed(1)}%)`;
    const avgRadiusA = listA.reduce((a, r) => a + (r.DeliveryRadiusKM || 0), 0) / Math.max(listA.length, 1);
    document.getElementById('compARadius').textContent = `${avgRadiusA.toFixed(1)} km`;

    // Update Subregion B metrics
    document.getElementById('compBOrders').textContent = metB.totalOrders.toLocaleString();
    document.getElementById('compBRevenue').textContent = '$' + Math.round(metB.totalRev).toLocaleString();
    document.getElementById('compBProfit').textContent = '$' + Math.round(metB.totalProfit).toLocaleString();
    document.getElementById('compBMargin').textContent = `${metB.margin.toFixed(1)}%`;
    document.getElementById('compBRisk').textContent = `${metB.highRiskCount} (${metB.highRiskPct.toFixed(1)}%)`;
    const avgRadiusB = listB.reduce((a, r) => a + (r.DeliveryRadiusKM || 0), 0) / Math.max(listB.length, 1);
    document.getElementById('compBRadius').textContent = `${avgRadiusB.toFixed(1)} km`;

    // Comparison Chart
    const sharesA = {};
    metA.channels.forEach(c => { sharesA[c.Channel] = c.OrderShare; });
    const sharesB = {};
    metB.channels.forEach(c => { sharesB[c.Channel] = c.OrderShare; });

    window.DineCharts.renderComparisonChart('comparisonChart', state.compA, sharesA, state.compB, sharesB);
  }

  // 10. Simulator Updates
  function updateSimulator(restaurants) {
    const ueSlider = document.getElementById('ueSlider');
    const ddSlider = document.getElementById('ddSlider');
    const destSelect = document.getElementById('targetChannelSelect');

    const ueVal = ueSlider ? parseInt(ueSlider.value) : 15;
    const ddVal = ddSlider ? parseInt(ddSlider.value) : 15;
    const destVal = destSelect ? destSelect.value : 'Self-Delivery';

    const ueLabel = document.getElementById('ueSliderVal');
    const ddLabel = document.getElementById('ddSliderVal');
    if (ueLabel) ueLabel.textContent = `${ueVal}%`;
    if (ddLabel) ddLabel.textContent = `${ddVal}%`;

    const sim = window.DineSimulator.calculate(restaurants, ueVal, ddVal, destVal);

    const simCurr = document.getElementById('simCurrentProfit');
    const simNew = document.getElementById('simNewProfit');
    const simGain = document.getElementById('simGainPct');
    const simComm = document.getElementById('simCommSaved');
    const simMarg = document.getElementById('simMargin');

    if (simCurr) simCurr.textContent = '$' + Math.round(sim.baselineProfit).toLocaleString();
    if (simNew) simNew.textContent = '$' + Math.round(sim.simulatedProfit).toLocaleString();
    if (simGain) simGain.textContent = `+${sim.profitGainPct.toFixed(1)}%`;
    if (simComm) simComm.textContent = '$' + Math.round(sim.totalCommSaved).toLocaleString();
    if (simMarg) simMarg.textContent = `${sim.simulatedMargin.toFixed(1)}%`;

    window.DineCharts.renderSimulatorComparison(
      'simulatorChart',
      sim.baselineProfit,
      sim.simulatedProfit,
      sim.totalCommSaved
    );
  }

  // 11. Reports Reader Loader
  async function loadReport(reportType) {
    const container = document.getElementById('reportMarkdownContent');
    if (!container) return;

    const url = reportType === 'executive-summary'
      ? '/api/reports/executive-summary'
      : '/api/reports/research-paper';

    container.innerHTML = '<p style="color:var(--text-muted);">Loading report content...</p>';

    try {
      const res = await fetch(url);
      if (res.ok) {
        const md = await res.text();
        // Convert basic markdown to clean HTML
        container.innerHTML = parseMarkdownToHtml(md);
      } else {
        container.innerHTML = '<p>Report file could not be loaded via API.</p>';
      }
    } catch (err) {
      container.innerHTML = '<p>Could not connect to report API server.</p>';
    }
  }

  function parseMarkdownToHtml(md) {
    let html = md
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/\| (.*) \|/gim, (match) => {
        const cells = match.split('|').filter(c => c.trim() !== '');
        return '<tr>' + cells.map(c => `<td>${c.trim()}</td>`).join('') + '</tr>';
      })
      .replace(/\n\n/gim, '<br><br>');
    return html;
  }

  function initReportTabs() {
    const reportBtns = document.querySelectorAll('.report-tab-btn[data-report]');
    reportBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        reportBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.activeReport = btn.getAttribute('data-report');
        loadReport(state.activeReport);
      });
    });

    const downloadBtn = document.getElementById('downloadReportBtn');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        const fileName = state.activeReport === 'executive-summary' ? 'executive_summary.md' : 'research_paper.md';
        window.open(`/api/reports/${state.activeReport}`, '_blank');
      });
    }
  }

  // Setup Tab Navigation
  function initTabs() {
    const navItems = document.querySelectorAll('.nav-item[data-tab]');
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        navItems.forEach(n => n.classList.remove('active'));
        item.classList.add('active');

        const tabId = item.getAttribute('data-tab');
        state.activeTab = tabId;

        document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
        const targetTab = document.getElementById(tabId);
        if (targetTab) {
          targetTab.classList.add('active');
          setTimeout(() => {
            renderActiveTabCharts(tabId);
          }, 40);
        }
      });
    });
  }

  // Setup Simulator Event Listeners
  function initSimulatorControls() {
    const ueSlider = document.getElementById('ueSlider');
    const ddSlider = document.getElementById('ddSlider');
    const destSelect = document.getElementById('targetChannelSelect');

    if (ueSlider) ueSlider.addEventListener('input', () => updateSimulator(getFilteredRestaurants()));
    if (ddSlider) ddSlider.addEventListener('input', () => updateSimulator(getFilteredRestaurants()));
    if (destSelect) destSelect.addEventListener('change', () => updateSimulator(getFilteredRestaurants()));
  }

  // Initialize All
  initTheme();
  initChannelToggle();
  initFilters();
  initTabs();
  initReportTabs();
  initSimulatorControls();
  updateApp();
});
