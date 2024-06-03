const express = require('express');
const { Kafka } = require('kafkajs');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const Order = require('./models/order');

const app = express();
const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092']
});
const consumer = kafka.consumer({ groupId: 'group_notificaciones' });

const uri = 'mongodb+srv://martin:aliaga@martincitop.4yvuxpp.mongodb.net/?retryWrites=true&w=majority&appName=martincitop';


mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'maliagapacheco@gmail.com',
    pass: ''
  }
});

const enviarCorreo = (solicitud) => {
  const mailOptions = {
    from: 'maliagapacheco@gmail.com',
    to: solicitud.email,
    subject: `Estado de tu pedido: ${solicitud.status}`,
    text: `Tu pedido con ID ${solicitud.id} está en estado: ${solicitud.status}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Email enviado: ' + info.response);
    }
  });
};

const consumeMessages = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'procesamiento', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      let solicitud = JSON.parse(message.value.toString());
      enviarCorreo(solicitud);
    },
  });
};

consumeMessages().catch(console.error);

app.listen(3001, () => {
  console.log('Servicio de Notificación corriendo en el puerto 3001');
});
