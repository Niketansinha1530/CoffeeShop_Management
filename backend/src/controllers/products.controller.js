const productsService = require('../services/products.service');

const getProducts = async (req, res, next) => {
  try {
    const products = await productsService.getProducts();
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const { name, category, price, available } = req.body;
    const product = await productsService.createProduct({ name, category, price, available });
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProducts, createProduct };
