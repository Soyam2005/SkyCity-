/**
 * Profit Simulator Engine for SkyCity DineMetrics
 */

window.DineSimulator = {
  calculate(restaurants, ueShiftPct, ddShiftPct, targetChannel = 'Self-Delivery') {
    let baselineRevenue = 0;
    let baselineProfit = 0;
    let totalShiftedOrders = 0;
    let totalCommSaved = 0;
    let additionalDeliveryCost = 0;

    restaurants.forEach(r => {
      baselineRevenue += r.TotalRevenue || 0;
      baselineProfit += r.TotalNetProfit || 0;

      const shiftedUE = r.UberEatsOrders * (ueShiftPct / 100);
      const shiftedDD = r.DoorDashOrders * (ddShiftPct / 100);
      const shiftedTotal = shiftedUE + shiftedDD;
      totalShiftedOrders += shiftedTotal;

      const ueRevShifted = shiftedUE * r.AOV;
      const ddRevShifted = shiftedDD * r.AOV;
      const commSaved = (ueRevShifted + ddRevShifted) * (r.CommissionRate || 0.30);
      totalCommSaved += commSaved;

      if (targetChannel === 'Self-Delivery') {
        additionalDeliveryCost += shiftedTotal * (r.DeliveryCostPerOrder || 3.0);
      }
    });

    const netGain = targetChannel === 'Self-Delivery'
      ? totalCommSaved - additionalDeliveryCost
      : totalCommSaved;

    const simulatedProfit = baselineProfit + netGain;
    const profitGainPct = baselineProfit > 0 ? (netGain / baselineProfit * 100) : 0;
    const baselineMargin = baselineRevenue > 0 ? (baselineProfit / baselineRevenue * 100) : 0;
    const simulatedMargin = baselineRevenue > 0 ? (simulatedProfit / baselineRevenue * 100) : 0;

    return {
      baselineProfit,
      simulatedProfit,
      netGain,
      profitGainPct,
      totalCommSaved,
      totalShiftedOrders: Math.round(totalShiftedOrders),
      baselineMargin,
      simulatedMargin
    };
  }
};
