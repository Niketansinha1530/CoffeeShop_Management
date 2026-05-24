const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class OrdersService {
  async getOrders({ search, startDate, endDate, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' }) {
    const where = { AND: [] };

    // Search by txnId
    if (search) {
      where.AND.push({
        txnId: { contains: search, mode: 'insensitive' },
      });
    }

    // Date range filter
    if (startDate) {
      where.AND.push({ createdAt: { gte: new Date(startDate) } });
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.AND.push({ createdAt: { lte: end } });
    }

    if (where.AND.length === 0) delete where.AND;

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          customer: { select: { name: true, email: true } },
          orderItems: {
            include: { product: { select: { name: true, category: true } } },
          },
          payment: { select: { method: true, status: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders: orders.map((order) => ({
        id: order.id,
        txnId: order.txnId,
        customerName: order.customer.name,
        customerEmail: order.customer.email,
        products: order.orderItems.map((item) => ({
          name: item.product.name,
          category: item.product.category,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          subtotal: Number(item.subtotal),
        })),
        totalAmount: Number(order.totalAmount),
        paymentMethod: order.payment?.method || 'N/A',
        paymentStatus: order.payment?.status || 'N/A',
        status: order.status,
        createdAt: order.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getOrderById(id) {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        customer: true,
        orderItems: {
          include: { product: true },
        },
        payment: true,
      },
    });

    if (!order) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }

    return {
      id: order.id,
      txnId: order.txnId,
      customer: order.customer,
      items: order.orderItems.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        subtotal: Number(item.subtotal),
      })),
      totalAmount: Number(order.totalAmount),
      payment: order.payment,
      status: order.status,
      createdAt: order.createdAt,
    };
  }

  async createOrder({ customerId, items, paymentMethod }) {
    // Validate customer
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      const error = new Error('Customer not found');
      error.statusCode = 404;
      throw error;
    }

    // Validate products and calculate totals
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      const error = new Error('One or more products not found');
      error.statusCode = 400;
      throw error;
    }

    const unavailable = products.filter((p) => !p.available);
    if (unavailable.length > 0) {
      const error = new Error(`Products not available: ${unavailable.map((p) => p.name).join(', ')}`);
      error.statusCode = 400;
      throw error;
    }

    // Build order items with pricing
    const productMap = new Map(products.map((p) => [p.id, p]));
    const orderItems = items.map((item) => {
      const product = productMap.get(item.productId);
      const unitPrice = Number(product.price);
      const subtotal = unitPrice * item.quantity;
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        subtotal,
      };
    });

    const totalAmount = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
    const txnId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Create order with items and payment in a transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          txnId,
          customerId,
          totalAmount,
          status: 'COMPLETED',
          orderItems: {
            create: orderItems,
          },
          payment: {
            create: {
              method: paymentMethod,
              status: 'COMPLETED',
            },
          },
        },
        include: {
          customer: { select: { name: true } },
          orderItems: {
            include: { product: { select: { name: true, category: true } } },
          },
          payment: true,
        },
      });

      return newOrder;
    });

    return {
      id: order.id,
      txnId: order.txnId,
      customerName: order.customer.name,
      products: order.orderItems.map((item) => ({
        name: item.product.name,
        category: item.product.category,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        subtotal: Number(item.subtotal),
      })),
      totalAmount: Number(order.totalAmount),
      paymentMethod: order.payment?.method,
      status: order.status,
      createdAt: order.createdAt,
    };
  }
}

module.exports = new OrdersService();
