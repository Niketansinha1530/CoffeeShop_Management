const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class CustomersService {
  async getCustomers() {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { orders: true } },
      },
    });

    return customers.map((c) => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      email: c.email,
      totalOrders: c._count.orders,
      createdAt: c.createdAt,
    }));
  }

  async createCustomer({ name, phone, email }) {
    const customer = await prisma.customer.create({
      data: { name, phone, email },
    });

    return customer;
  }
}

module.exports = new CustomersService();
