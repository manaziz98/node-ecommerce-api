const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const { isAuth, hasRole } = require("../middlewares/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management endpoints
 */

/**
 * @swagger
 * /api/v1/orders:
 *   post:
 *     summary: Create an order
 *     description: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.post('/', isAuth, hasRole(["Client"]), async (req, res) => {
  try {
    // Create a new order using the request body
    const newOrder = await Order.create({ ...req.body, client: req.user.id });

    res.status(201).json(newOrder);
  } catch (error) {
    res.status(400).json({ error: 'Invalid request' });
  }
});

/**
 * @swagger
 * /api/v1/orders:
 *   get:
 *     summary: Get all orders
 *     description: Retrieve all orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get('/', isAuth, hasRole(["Admin"]), async (req, res) => {
    try {
      const orders = await Order.find().populate('client');
  
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
});

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     description: Retrieve an order by its ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
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

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   put:
 *     summary: Update order by ID
 *     description: Update an order by its ID (only admin)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       200:
 *         description: Order updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
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


/**
 * @swagger
 * /api/v1/orders/{id}:
 *   patch:
 *     summary: Change order status by ID
 *     description: Change the status of an order by its ID (only admin)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *             required:
 *               - status
 *     responses:
 *       200:
 *         description: Order status changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
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

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   delete:
 *     summary: Delete order by ID
 *     description: Delete an order by its ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Order ID
 *     responses:
 *       204:
 *         description: Order deleted successfully
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
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