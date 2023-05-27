const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
    date: Date,
    description: String,
    status: {
      type: String,
      enum: ['Created', 'Cancelled']
    }, // Possible status values
    client:  {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    total: Number,
    itemsOrder: [{item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item"
      }, quantity: Number}]
});

const Order = mongoose.model("Order", OrderSchema);

module.exports = Order;