const { Kafka } = require('kafkajs');
const mongoose = require('mongoose');
const Order = require('./models/order');

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092']
});
const consumer = kafka.consumer({ groupId: 'group_procesamiento' });
const producer = kafka.producer();

const uri = process.env.MONGO_URI;


mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const processOrder = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'solicitudes', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      let order = JSON.parse(message.value.toString());
      const estados = ['recibido', 'preparando', 'entregando', 'finalizado'];

      for (let estado of estados) {
        order.status = estado;
        await Order.findOneAndUpdate({ id: order.id }, { status: estado });
        await producer.connect();
        await producer.send({
          topic: 'procesamiento',
          messages: [{ value: JSON.stringify(order) }],
        });
        await producer.disconnect();

        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    },
  });
};

processOrder().catch(console.error);
