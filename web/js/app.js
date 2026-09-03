/**
 * SkyCity DineMetrics — Main Web Application Controller
 * Supports Filters, Dark Mode Toggle, and Subregion Side-by-Side Comparison
 */

document.addEventListener('DOMContentLoaded', () => {
  const data = window.SKY_DATA;
  if (!data) {
    console.error('Data file not loaded');
    return;
  }

  // State Management
  const state = {
    subregion: 'All',
    cuisine: 'All',
    segment: 'All',
    activeTab: 'tab-overview',
    theme: localStorage.getItem('sky_theme') || 'light',
    compA: 'CBD',
    compB: 'South Auckland'
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
        // Re-render active charts with updated theme colors
        renderActiveTabCharts(state.activeTab);
      });
    }
  }

  // 2. Populate Select Options
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
  }

  // Filter Data
  function getFilteredRestaurants() {
    return (data.restaurants || []).filter(r => {
      const matchSub = state.subregion === 'All' || r.Subregion === state.subregion;
      const matchCui = state.cuisine === 'All' || r.CuisineType === state.cuisine;
      const matchSeg = state.segment === 'All' || r.Segment === state.segment;
      return matchSub && matchCui && matchSeg;
    });
  }

  // Compute Aggregations
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
      totalOrders += r.MonthlyOrders || 0;
      totalRev += r.TotalRevenue || 0;
      totalProfit += r.TotalNetProfit || 0;
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

    const channels = Object.keys(channelTotals).map(ch => {
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

  // Update UI Elements
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
    if (heroMargin) heroMargin.textContent = `${metrics.margin.toFixed(1)}% Avg Profit Margin Across Network`;
    if (flatOrders) flatOrders.textContent = metrics.totalOrders.toLocaleString();
    if (flatRev) flatRev.textContent = '$' + Math.round(metrics.totalRev).toLocaleString();
    if (flatRisk) flatRisk.textContent = metrics.highRiskCount.toLocaleString();
    if (riskBadge) riskBadge.textContent = `${metrics.highRiskPct.toFixed(1)}% Ratio`;

    // 2. Render Tables
    renderChannelsTable(metrics.channels);
    renderRiskTable(restaurants.filter(r => r.RiskFlag));

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

    if (tabId === 'tab-overview') {
      window.DineCharts.renderDonut('channelDonutChart', metrics.channels);
      window.DineCharts.renderEconomicsBar('economicsBarChart', metrics.channels);
    } else if (tabId === 'tab-distance') {
      window.DineCharts.renderRadiusScatter('radiusScatterChart', restaurants);
    } else if (tabId === 'tab-cuisines' && data.cuisines) {
      window.DineCharts.renderCuisineMix('cuisineMixChart', data.cuisines);
    } else if (tabId === 'tab-segments' && data.segments) {
      window.DineCharts.renderSegmentBar('segmentBarChart', data.segments);
    } else if (tabId === 'tab-comparison') {
      updateComparisonView();
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

  // 3. Side-by-Side Subregion Comparison Logic
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

  // Initialize
  initTheme();
  initFilters();
  initTabs();
  initSimulatorControls();
  updateApp();
});
