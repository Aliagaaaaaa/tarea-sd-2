const fs = require('fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const Product = require('./product');

const uri = 'mongodb+srv://martin:aliaga@martincitop.4yvuxpp.mongodb.net/?retryWrites=true&w=majority&appName=martincitop';

async function uploadCsvToMongo(filePath) {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Conectado a MongoDB');

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', async (row) => {
        try {
          if (!isNaN(price)) {
            const product = new Product({
              name: row.name,
              price: price
            });

            await product.save();
          } else {
            console.error(`Valor no numérico para el producto: ${row.name}`);
          }
        } catch (error) {
          console.error('Error al procesar fila:', error);
        }
      })
      .on('end', () => {
        console.log('Datos insertados exitosamente.');
      });
  } catch (error) {
    console.error('Error al conectar con MongoDB:', error);
  }
}

uploadCsvToMongo('output.csv');
