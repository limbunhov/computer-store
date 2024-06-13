const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Create a product (POST)
router.post('/', async (req, res) => {
  const { name, title, price, image, category, year, rate, model } = req.body;
  try {
    const newProduct = new Product({ name, title, price, image, category, year, rate, model });
    await newProduct.save();
    res.json({ message: 'Product added successfully!' });
  } catch (error) {
    console.error('Error saving product:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get all products (GET)
router.get('/', async (req, res) => {
  try {
    const query = req.query.search ? { name: new RegExp(req.query.search, 'i') } : {};
    const sort = req.query.sort ? { [req.query.sort]: 1 } : {};
    const products = await Product.find(query).sort(sort);
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get products by category (GET)
router.get('/byCategory/:category', async (req, res) => {
  try {
    const { category } = req.params;
    console.log('Category:', category); // Log the category value
    const products = await Product.find({ category: new RegExp(`^${category}$`, 'i') });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// Get products by model (GET)
router.get('/byModel/:model', async (req, res) => {
  try {
    const { model } = req.params;
    const products = await Product.find({ model: new RegExp(`^${model}$`, 'i') });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products by model:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Get product by ID (GET)
router.get('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update a product (PUT)
router.put('/:productId', async (req, res) => {
  const { productId } = req.params;
  const updatedProductData = req.body;
  try {
    const updatedProduct = await Product.findByIdAndUpdate(productId, updatedProductData, { new: true });
    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product updated successfully', product: updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete a product (DELETE)
router.delete('/:productId', async (req, res) => {
  const { productId } = req.params;
  try {
    const deletedProduct = await Product.findByIdAndDelete(productId);
    if (!deletedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully', product: deletedProduct });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
