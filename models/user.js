const mongoose = require("mongoose");
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: {type: String, unique: true},
    fullname: String,
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
          validator: function (value) {
            // Use the built-in email validator
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
          },
          message: 'Invalid email address',
        },
      },
      password: String,
      role: {
        type: String,
        enum: ['Admin', 'Owner', 'Client']
      }, // Possible role values
      orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order"
      }],
      joinedAt: Date,
      isActive: Boolean
});

// Hash the password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
      return next();
    }
  
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(this.password, salt);
      this.password = hashedPassword;
      next();
    } catch (error) {
      return next(error);
    }
  });
const User = mongoose.model("User", userSchema);
module.exports = User;