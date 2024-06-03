const express = require('express');
const mongoose = require('mongoose');
const Order = require('./server-estado/models/order');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

const uri = process.env.MONGO_URI;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.get('/estado/:id', async (req, res) => {
  const id = req.params.id;
  const solicitud = await Order.findOne({ id });
  if (solicitud) {
    res.status(200).json(solicitud);
  } else {
    res.status(404).json({ error: 'Solicitud no encontrada' });
  }
});

app.listen(3002, () => {
  console.log('Servicio de Estado corriendo en el puerto 3002');
});
