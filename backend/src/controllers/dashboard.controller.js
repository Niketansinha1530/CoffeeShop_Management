const dashboardService = require('../services/dashboard.service');

const getDashboard = async (req, res, next) => {
  try {
    const [kpis, salesChart] = await Promise.all([
      dashboardService.getKPIs(),
      dashboardService.getSalesChart(parseInt(req.query.days) || 30),
    ]);

    res.json({
      success: true,
      data: {
        ...kpis,
        salesChart,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard };
