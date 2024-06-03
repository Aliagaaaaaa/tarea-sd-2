const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  id: String,
  name: String,
  price: Number,
  email: String,
  status: String
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;