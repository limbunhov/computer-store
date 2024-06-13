const express = require('express');
const router = express.Router();
const Banner = require('../models/Banners');

// Create a banner (POST)
router.post('/', async (req, res) => {
  const { title, image, description } = req.body;
  try {
    const newBanner = new Banner({ title, image, description });
    await newBanner.save();
    res.status(201).json({ message: 'Banner created successfully', banner: newBanner });
  } catch (error) {
    console.error('Error creating banner:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get all banners (GET)
router.get('/', async (req, res) => {
  try {
    const banners = await Banner.find();
    res.json(banners);
  } catch (error) {
    console.error('Error fetching banners:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get a single banner by ID (GET)
router.get('/:bannerId', async (req, res) => {
  const { bannerId } = req.params;
  try {
    const banner = await Banner.findById(bannerId);
    if (!banner) {
      return res.status(404).json({ error: 'Banner not found' });
    }
    res.json(banner);
  } catch (error) {
    console.error('Error fetching banner:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update a banner (PUT)
router.put('/:bannerId', async (req, res) => {
  const { bannerId } = req.params;
  const { title, image, description } = req.body;
  try {
    const updatedBanner = await Banner.findByIdAndUpdate(
      bannerId,
      { title, image, description },
      { new: true }
    );
    if (!updatedBanner) {
      return res.status(404).json({ error: 'Banner not found' });
    }
    res.json({ message: 'Banner updated successfully', banner: updatedBanner });
  } catch (error) {
    console.error('Error updating banner:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete a banner (DELETE)
router.delete('/:bannerId', async (req, res) => {
  const { bannerId } = req.params;
  try {
    const deletedBanner = await Banner.findByIdAndDelete(bannerId);
    if (!deletedBanner) {
      return res.status(404).json({ error: 'Banner not found' });
    }
    res.json({ message: 'Banner deleted successfully', banner: deletedBanner });
  } catch (error) {
    console.error('Error deleting banner:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
