const express = require('express');
const mongoose = require('mongoose');
const Order = require('./models/order');

const app = express();

const uri = 'mongodb+srv://martin:aliaga@martincitop.4yvuxpp.mongodb.net/?retryWrites=true&w=majority&appName=martincitop';

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
