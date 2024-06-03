const express = require('express');
const bodyParser = require('body-parser');
const { Kafka } = require('kafkajs');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const Order = require('./models/order');
const Product = require('./models/product');

const app = express();
const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092']
});
const producer = kafka.producer();

const uri = 'mongodb+srv://martin:aliaga@martincitop.4yvuxpp.mongodb.net/?retryWrites=true&w=majority&appName=martincitop';

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.json());

app.post('/solicitar', async (req, res) => {
  const { name, email } = req.body;
  const product = await Product.findOne({ name });
  if (!product) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }
  const orderId = uuidv4();
  const order = new Order({
    id: orderId,
    name: product.name,
    price: product.price,
    email,
    status: 'recibido'
  });

  await order.save();
  await producer.connect();
  await producer.send({
    topic: 'solicitudes',
    messages: [{ value: JSON.stringify(order) }],
  });
  await producer.disconnect();
  res.status(200).json({ status: 'Solicitud recibida', data: order });
});

app.listen(3000, () => {
  console.log('Servicio de Solicitud corriendo en el puerto 3000');
});