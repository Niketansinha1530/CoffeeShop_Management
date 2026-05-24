const express = require('express');
const { body } = require('express-validator');
const { getOrders, getOrderById, createOrder } = require('../controllers/orders.controller');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.get('/', getOrders);
router.get('/:id', getOrderById);

router.post(
  '/',
  validate([
    body('customerId').isInt({ min: 1 }).withMessage('Valid customer ID is required'),
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('items.*.productId').isInt({ min: 1 }).withMessage('Valid product ID is required'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('paymentMethod').isIn(['CARD', 'UPI', 'CASH']).withMessage('Payment method must be CARD, UPI, or CASH'),
  ]),
  createOrder
);

module.exports = router;
