const mongoose = require('mongoose');
const User = require('../models/user');
const Item = require('../models/item');
const Order = require('../models/order');

// Define dummy data for users, items, and orders
const dummyUsers = [
  {
    username: 'user1',
    fullname: 'User One',
    email: 'user1@example.com',
    password: 'password1',
    role: 'Admin',
    isActive: true,
  },
  {
    username: 'user2',
    fullname: 'User Two',
    email: 'user2@example.com',
    password: 'password2',
    role: 'Owner',
    isActive: true,
  },
];

const dummyItems = [
  {
    name: 'Item 1',
    price: 9.99,
    description: 'Description for Item 1',
    quantity: 10,
  },
  {
    name: 'Item 2',
    price: 19.99,
    description: 'Description for Item 2',
    quantity: 5,
  },
];

const dummyOrders = [
  {
    user: null, // User reference will be added later
    itemsOrder: [], // Item references will be added later
    total: 0,
    status: 'Created',
  },
];

// Function to seed the database
async function seedDB() {
  try {
    // Remove existing data from collections
    await User.deleteMany({});
    await Item.deleteMany({});
    await Order.deleteMany({});

    // Create dummy users
    const users = await User.create(dummyUsers);

    // Create dummy items
    const items = await Item.create(dummyItems);

    // Create dummy orders
    for (const orderData of dummyOrders) {
      const order = new Order(orderData);

      // Add user reference to the order
      order.user = users[Math.floor(Math.random() * users.length)]._id;

      // Add item references to the order and calculate the total
      for (const item of items) {
        const quantity = Math.floor(Math.random() * 5) + 1; // Random quantity between 1 and 5
        order.itemsOrder.push({ item: item._id, quantity });
        order.total += item.price * quantity;
      }

      await order.save();
    }

    console.log('Database seeding completed.');
  } catch (error) {
    console.error('Error during database seeding:', error);
  } finally {
    // Close the database connection after seeding is complete
    mongoose.connection.close();
  }
}

// Call the seed function
module.exports = seedDB;
