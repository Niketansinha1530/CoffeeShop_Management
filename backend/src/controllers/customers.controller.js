const customersService = require('../services/customers.service');

const getCustomers = async (req, res, next) => {
  try {
    const customers = await customersService.getCustomers();
    res.json({ success: true, data: customers });
  } catch (error) {
    next(error);
  }
};

const createCustomer = async (req, res, next) => {
  try {
    const { name, phone, email } = req.body;
    const customer = await customersService.createCustomer({ name, phone, email });
    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCustomers, createCustomer };
