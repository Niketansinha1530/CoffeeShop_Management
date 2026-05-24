const express = require('express');
const { body } = require('express-validator');
const { getCustomers, createCustomer } = require('../controllers/customers.controller');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.get('/', getCustomers);

router.post(
  '/',
  validate([
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('email').trim().isEmail().withMessage('Valid email is required'),
  ]),
  createCustomer
);

module.exports = router;
