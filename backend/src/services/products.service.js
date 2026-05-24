const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ProductsService {
  async getProducts() {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { orderItems: true } },
      },
    });

    return products.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: Number(p.price),
      available: p.available,
      totalOrders: p._count.orderItems,
      createdAt: p.createdAt,
    }));
  }

  async createProduct({ name, category, price, available = true }) {
    const product = await prisma.product.create({
      data: { name, category, price, available },
    });

    return {
      ...product,
      price: Number(product.price),
    };
  }
}

module.exports = new ProductsService();
