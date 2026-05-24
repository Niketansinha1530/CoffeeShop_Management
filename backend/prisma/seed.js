const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();

  // Create Customers
  const customers = await Promise.all([
    prisma.customer.create({ data: { name: 'Aarav Sharma', phone: '9876543210', email: 'aarav@email.com' } }),
    prisma.customer.create({ data: { name: 'Priya Patel', phone: '9876543211', email: 'priya@email.com' } }),
    prisma.customer.create({ data: { name: 'Rahul Verma', phone: '9876543212', email: 'rahul@email.com' } }),
    prisma.customer.create({ data: { name: 'Sneha Gupta', phone: '9876543213', email: 'sneha@email.com' } }),
    prisma.customer.create({ data: { name: 'Vikram Singh', phone: '9876543214', email: 'vikram@email.com' } }),
    prisma.customer.create({ data: { name: 'Ananya Roy', phone: '9876543215', email: 'ananya@email.com' } }),
    prisma.customer.create({ data: { name: 'Karan Mehta', phone: '9876543216', email: 'karan@email.com' } }),
    prisma.customer.create({ data: { name: 'Divya Nair', phone: '9876543217', email: 'divya@email.com' } }),
    prisma.customer.create({ data: { name: 'Arjun Reddy', phone: '9876543218', email: 'arjun@email.com' } }),
    prisma.customer.create({ data: { name: 'Meera Joshi', phone: '9876543219', email: 'meera@email.com' } }),
  ]);
  console.log(`✅ Created ${customers.length} customers`);

  // Create Products
  const products = await Promise.all([
    prisma.product.create({ data: { name: 'Espresso', category: 'HOT', price: 149.00 } }),
    prisma.product.create({ data: { name: 'Cappuccino', category: 'HOT', price: 199.00 } }),
    prisma.product.create({ data: { name: 'Latte', category: 'HOT', price: 219.00 } }),
    prisma.product.create({ data: { name: 'Americano', category: 'HOT', price: 179.00 } }),
    prisma.product.create({ data: { name: 'Mocha', category: 'HOT', price: 249.00 } }),
    prisma.product.create({ data: { name: 'Macchiato', category: 'HOT', price: 229.00 } }),
    prisma.product.create({ data: { name: 'Iced Latte', category: 'COLD', price: 249.00 } }),
    prisma.product.create({ data: { name: 'Cold Brew', category: 'COLD', price: 229.00 } }),
    prisma.product.create({ data: { name: 'Frappe', category: 'COLD', price: 279.00 } }),
    prisma.product.create({ data: { name: 'Iced Mocha', category: 'COLD', price: 269.00 } }),
    prisma.product.create({ data: { name: 'Smoothie', category: 'COLD', price: 199.00 } }),
    prisma.product.create({ data: { name: 'Affogato', category: 'COLD', price: 299.00 } }),
  ]);
  console.log(`✅ Created ${products.length} products`);

  // Create Orders spanning last 30 days
  const paymentMethods = ['CARD', 'UPI', 'CASH'];
  const orders = [];

  for (let i = 0; i < 40; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const hoursAgo = Math.floor(Math.random() * 12) + 8; // 8 AM to 8 PM
    const orderDate = new Date();
    orderDate.setDate(orderDate.getDate() - daysAgo);
    orderDate.setHours(hoursAgo, Math.floor(Math.random() * 60), 0, 0);

    const customer = customers[Math.floor(Math.random() * customers.length)];
    const numItems = Math.floor(Math.random() * 3) + 1;
    const selectedProducts = [];
    const usedProductIds = new Set();

    for (let j = 0; j < numItems; j++) {
      let product;
      do {
        product = products[Math.floor(Math.random() * products.length)];
      } while (usedProductIds.has(product.id));
      usedProductIds.add(product.id);

      const quantity = Math.floor(Math.random() * 3) + 1;
      selectedProducts.push({
        productId: product.id,
        quantity,
        unitPrice: Number(product.price),
        subtotal: Number(product.price) * quantity,
      });
    }

    const totalAmount = selectedProducts.reduce((sum, item) => sum + item.subtotal, 0);
    const txnId = `TXN-${orderDate.getTime()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

    const order = await prisma.order.create({
      data: {
        txnId,
        customerId: customer.id,
        totalAmount,
        status: 'COMPLETED',
        createdAt: orderDate,
        orderItems: {
          create: selectedProducts,
        },
        payment: {
          create: {
            method: paymentMethod,
            status: 'COMPLETED',
            paidAt: orderDate,
          },
        },
      },
    });

    orders.push(order);
  }

  console.log(`✅ Created ${orders.length} orders with items and payments`);
  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
