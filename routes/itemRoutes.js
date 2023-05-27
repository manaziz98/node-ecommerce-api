const express = require('express');
const router = express.Router();
const Item = require('../models/item');
const { isAuth, isOwner, hasRole } = require("../middlewares/authMiddleware")

// GET /api/v1/items?q
// Querying items (pagination and search)
router.get('/', async (req, res) => {
    try {
      // Extract the query parameters from req.query
      const { q, page, limit } = req.query;
  
      // Prepare the filter for the search query
      const searchFilter = q ? { name: { $regex: q, $options: 'i' } } : {};
  
      // Set default values for page and limit if not provided
      const currentPage = page ? parseInt(page) : 1;
      const itemsPerPage = limit ? parseInt(limit) : 10;
  
      // Calculate the skip and limit values for pagination
      const skip = (currentPage - 1) * itemsPerPage;
  
      // Execute the query to retrieve items based on the search filter and pagination
      const items = await Item.find(searchFilter)
        .skip(skip)
        .limit(itemsPerPage);
  
      // Count the total number of items matching the search filter
      const totalCount = await Item.countDocuments(searchFilter);
  
      res.status(200).json({
        items,
        currentPage,
        totalPages: Math.ceil(totalCount / itemsPerPage),
        totalCount
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });
  

// POST /api/v1/items
// Add item
router.post('/', isAuth, hasRole(["Admin", "Owner"]), async (req, res) => {
  try {
    // Create a new item using the request body
    const newItem = await Item.create({...req.body, owner: req.user.id});

    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ error: 'Invalid request' });
  }
});

// GET /api/v1/items/:id
// Get item by id
router.get('/:id', async (req, res) => {
  try {
    // Find the item by id
    const item = await Item.findById(req.params.id);

    if (!item) {
      res.status(404).json({ error: 'Item not found' });
    } else {
      res.status(200).json(item);
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/v1/items/:id
// Update item by id
router.put('/:id', isAuth, isOwner, async (req, res) => {
  try {
    // Find the item by id and update its properties based on the request body
    const updatedItem = await Item.findByIdAndUpdate(req.params.id, {...req.body, owner: req.user.id}, { new: true });

    if (!updatedItem) {
      res.status(404).json({ error: 'Item not found' });
    } else {
      res.status(203).json(updatedItem);
    }
  } catch (error) {
    res.status(400).json({ error: 'Invalid request' });
  }
});

// DELETE /api/v1/items/:id
// Delete item by id
router.delete('/:id', isAuth, isOwner, async (req, res) => {
  try {
    // Find the item by id and delete it
    const deletedItem = await Item.findByIdAndDelete(req.params.id);

    if (!deletedItem) {
      res.status(404).json({ error: 'Item not found' });
    } else {
      res.status(204).end();
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
