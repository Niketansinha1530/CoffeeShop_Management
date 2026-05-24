const ordersService = require('../services/orders.service');

const getOrders = async (req, res, next) => {
  try {
    const { search, startDate, endDate, page, limit, sortBy, sortOrder } = req.query;
    const result = await ordersService.getOrders({
      search,
      startDate,
      endDate,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      sortBy: sortBy || 'createdAt',
      sortOrder: sortOrder || 'desc',
    });

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await ordersService.getOrderById(req.params.id);
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

const createOrder = async (req, res, next) => {
  try {
    const { customerId, items, paymentMethod } = req.body;
    const order = await ordersService.createOrder({ customerId, items, paymentMethod });
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

module.exports = { getOrders, getOrderById, createOrder };
