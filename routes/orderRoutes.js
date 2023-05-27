const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const { isAuth, hasRole } = require("../middlewares/authMiddleware");

// POST /api/v1/orders
// Create an order
router.post('/', isAuth, hasRole(["Client"]), async (req, res) => {
  try {
    // Create a new order using the request body
    const newOrder = await Order.create({ ...req.body, client: req.user.id });

    res.status(201).json(newOrder);
  } catch (error) {
    res.status(400).json({ error: 'Invalid request' });
  }
});

// GET /api/v1/orders
// Get all orders
router.get('/', isAuth, hasRole(["Admin"]), async (req, res) => {
    try {
      const orders = await Order.find().populate('client');
  
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/v1/orders/:id
// Get order by id
router.get('/:id', isAuth, hasRole(["Admin"]), async (req, res) => {
    try {
      // Find the order by id
      const order = await Order.findById(req.params.id).populate('client');
  
      if (!order) {
        res.status(404).json({ error: 'Order not found' });
      } else {
        res.status(200).json(order);
      }
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });

// PUT /api/v1/orders/:id
// Update order by id (only admin)
router.put('/:id', isAuth, hasRole(["Admin"]), async (req, res) => {
    try {
      // Find the order by id
      const order = await Order.findById(req.params.id);
  
      if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }
  
      // Update the order with the request body
      order.set(req.body);
      const updatedOrder = await order.save();
  
      res.status(200).json(updatedOrder);
    } catch (error) {
      res.status(400).json({ error: 'Invalid request' });
    }
  });


// PATCH /api/v1/orders/:id
// Change order status by id (only admin)
router.patch('/:id', isAuth, hasRole(["Admin"]), async (req, res) => {
    try {
      // Find the order by id
      const order = await Order.findById(req.params.id);
  
      if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }
  
      // Update the order status with the request body
      order.status = req.body.status;
      const updatedOrder = await order.save();
  
      res.status(200).json(updatedOrder);
    } catch (error) {
      res.status(400).json({ error: 'Invalid request' });
    }
  });

// DELETE /api/v1/orders/:id
// Delete order by id
router.delete('/:id', isAuth, hasRole(["Admin"]), async (req, res) => {
    try {
      // Find the order by id
      const order = await Order.findById(req.params.id);
  
      if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }
  
      // Delete the order
      await order.remove();
  
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });

module.exports = router;