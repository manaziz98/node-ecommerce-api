const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { isAuth, hasRole } = require("../middlewares/authMiddleware");

// GET /api/v1/users
// Get all users with pagination and search
router.get('/', isAuth, hasRole(["Admin"]), async (req, res) => {
    try {
      // Extract the query parameters from req.query
      const { q, page, limit } = req.query;
  
      // Prepare the filter for the search query
      const searchFilter = q ? { username: { $regex: q, $options: 'i' } } : {};
  
      // Set default values for page and limit if not provided
      const currentPage = page ? parseInt(page) : 1;
      const usersPerPage = limit ? parseInt(limit) : 10;
  
      // Calculate the skip and limit values for pagination
      const skip = (currentPage - 1) * usersPerPage;
  
      // Execute the query to retrieve users based on the search filter and pagination
      const users = await User.find(searchFilter)
        .skip(skip)
        .limit(usersPerPage);
  
      // Count the total number of users matching the search filter
      const totalCount = await User.countDocuments(searchFilter);
  
      res.status(200).json({
        users,
        currentPage,
        totalPages: Math.ceil(totalCount / usersPerPage),
        totalCount
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });

// GET /api/v1/users/:id
// Get user by id
router.get('/:id', isAuth, hasRole(["Admin"]), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.status(200).json(user);
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/v1/users/:id
// Update user by id
router.put('/:id', isAuth, hasRole(["Admin"]), async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedUser) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.status(200).json(updatedUser);
    }
  } catch (error) {
    res.status(400).json({ error: 'Invalid request' });
  }
});

// DELETE /api/v1/users/:id
// Delete user by id
router.delete('/:id', isAuth, hasRole(["Admin"]), async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.status(204).end();
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
