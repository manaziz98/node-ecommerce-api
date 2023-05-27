const express = require('express');
const router = express.Router();
const Item = require('../models/item');
const { isAuth, isOwner, hasRole } = require("../middlewares/authMiddleware")

/**
 * @swagger
 * tags:
 *   name: Items
 *   description: Item management endpoints
 */

/**
 * @swagger
 * /api/v1/items:
 *   get:
 *     summary: Get all items
 *     description: Retrieve all items with pagination and search
 *     tags: [Items]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query for item name
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       price:
 *                         type: number
 *                       description:
 *                         type: string
 *                       quantity:
 *                         type: number
 *                       image:
 *                         type: string
 *                       owner:
 *                         type: string
 *                         format: ObjectId
 *                 currentPage:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 totalCount:
 *                   type: integer
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
  

/**
 * @swagger
 * /api/v1/items:
 *   post:
 *     summary: Add an item
 *     description: Add a new item
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               quantity:
 *                 type: number
 *               image:
 *                 type: string
 *               owner:
 *                 type: string
 *                 format: ObjectId
 *     responses:
 *       201:
 *         description: Item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                name:
 *                  type: string
 *                price:
 *                  type: number
 *                description:
 *                  type: string
 *                quantity:
 *                  type: number
 *                image:
 *                  type: string
 *                owner:
 *                  type: string
 *                  format: ObjectId
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
router.post('/', isAuth, hasRole(["Admin", "Owner"]), async (req, res) => {
  try {
    // Create a new item using the request body
    const newItem = await Item.create({...req.body, owner: req.user.id});

    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ error: 'Invalid request' });
  }
});

/**
 * @swagger
 * /api/v1/items/{id}:
 *   get:
 *     summary: Get item by ID
 *     description: Retrieve an item by its ID
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Item ID
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                name:
 *                  type: string
 *                price:
 *                  type: number
 *                description:
 *                  type: string
 *                quantity:
 *                  type: number
 *                image:
 *                  type: string
 *                owner:
 *                  type: string
 *                  format: ObjectId
 *       404:
 *         description: Item not found
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

/**
 * @swagger
 * /api/v1/items/{id}:
 *   put:
 *     summary: Update item by ID
 *     description: Update an item by its ID
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *            schema:
 *              type: object
 *              properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               quantity:
 *                 type: number
 *               image:
 *                 type: string
 *               owner:
 *                 type: string
 *                 format: ObjectId
 *     responses:
 *       203:
 *         description: Item updated successfully
 *         content:
 *           application/json:
 *              schema:
 *                 type: object
 *                 properties:
 *                  name:
 *                    type: string
 *                  price:
 *                    type: number
 *                  description:
 *                    type: string
 *                  quantity:
 *                    type: number
 *                  image:
 *                    type: string
 *                  owner:
 *                    type: string
 *                    format: ObjectId
 *       404:
 *         description: Item not found
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

/**
 * @swagger
 * /api/v1/items/{id}:
 *   delete:
 *     summary: Delete item by ID
 *     description: Delete an item by its ID
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Item ID
 *     responses:
 *       204:
 *         description: Item deleted successfully
 *       404:
 *         description: Item not found
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
