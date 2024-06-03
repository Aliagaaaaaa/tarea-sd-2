const express = require('express');
const mongoose = require('mongoose');
const { Kafka } = require('kafkajs');
const { Resend } = require('resend');
const dotenv = require('dotenv');
dotenv.config();


const app = express();
const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092']
});
const consumer = kafka.consumer({ groupId: 'group_notificaciones' });

const resend = new Resend(process.env.RESEND_API_KEY);

const uri = process.env.MONGO_URI;


mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const enviarCorreo = async (solicitud) => {
  const { data, error } = await resend.emails.send({
    from: "Acme <onboarding@resend.dev>",
    to: [solicitud.email],
    subject: `Estado de tu pedido: ${solicitud.status}`,
    html: `<strong>Tu pedido con ID ${solicitud.id} está en estado: ${solicitud.status}</strong>`,
  });

  if (error) {
    console.log('Error al enviar el correo:', error);
  } else {
    console.log('Correo enviado:', data);
  }
};

const consumeMessages = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'procesamiento', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      let solicitud = JSON.parse(message.value.toString());
      await enviarCorreo(solicitud);
    },
  });
};

consumeMessages().catch(console.error);

app.listen(3001, () => {
  console.log('Servicio de Notificación corriendo en el puerto 3001');
});

