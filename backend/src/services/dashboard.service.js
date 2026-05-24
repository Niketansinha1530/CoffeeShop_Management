const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class DashboardService {
  async getKPIs() {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [totalSales, totalOrders, todaySales, topProduct, paymentDistribution, recentOrders] =
      await Promise.all([
        // Total Sales
        prisma.order.aggregate({
          _sum: { totalAmount: true },
          where: { status: 'COMPLETED' },
        }),

        // Total Orders
        prisma.order.count({ where: { status: 'COMPLETED' } }),

        // Today's Sales
        prisma.order.aggregate({
          _sum: { totalAmount: true },
          _count: true,
          where: {
            status: 'COMPLETED',
            createdAt: { gte: startOfDay },
          },
        }),

        // Top Selling Product
        prisma.orderItem.groupBy({
          by: ['productId'],
          _sum: { quantity: true },
          orderBy: { _sum: { quantity: 'desc' } },
          take: 1,
        }),

        // Payment Method Distribution
        prisma.payment.groupBy({
          by: ['method'],
          _count: { method: true },
          where: { status: 'COMPLETED' },
        }),

        // Recent Orders (latest 5)
        prisma.order.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            customer: { select: { name: true } },
            orderItems: {
              include: { product: { select: { name: true, category: true } } },
            },
            payment: { select: { method: true, status: true } },
          },
        }),
      ]);

    // Get top product details
    let topProductDetails = null;
    if (topProduct.length > 0) {
      const product = await prisma.product.findUnique({
        where: { id: topProduct[0].productId },
      });
      topProductDetails = {
        ...product,
        totalQuantitySold: topProduct[0]._sum.quantity,
      };
    }

    return {
      totalSales: Number(totalSales._sum.totalAmount || 0),
      totalOrders,
      todaySales: {
        amount: Number(todaySales._sum.totalAmount || 0),
        count: todaySales._count,
      },
      topProduct: topProductDetails,
      paymentDistribution: paymentDistribution.map((p) => ({
        method: p.method,
        count: p._count.method,
      })),
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        txnId: order.txnId,
        customerName: order.customer.name,
        products: order.orderItems.map((item) => ({
          name: item.product.name,
          category: item.product.category,
          quantity: item.quantity,
        })),
        totalAmount: Number(order.totalAmount),
        paymentMethod: order.payment?.method || 'N/A',
        status: order.status,
        createdAt: order.createdAt,
      })),
    };
  }

  async getSalesChart(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const dailySales = await prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        SUM(total_amount)::float as revenue,
        COUNT(*)::int as orders
      FROM orders
      WHERE created_at >= ${startDate}
        AND status = 'COMPLETED'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    return dailySales;
  }
}

module.exports = new DashboardService();
