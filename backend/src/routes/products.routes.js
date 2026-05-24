const express = require('express');
const { body } = require('express-validator');
const { getProducts, createProduct } = require('../controllers/products.controller');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.get('/', getProducts);

router.post(
  '/',
  validate([
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('category').isIn(['HOT', 'COLD']).withMessage('Category must be HOT or COLD'),
    body('price').isFloat({ min: 0.01 }).withMessage('Price must be a positive number'),
    body('available').optional().isBoolean().withMessage('Available must be a boolean'),
  ]),
  createProduct
);

module.exports = router;
