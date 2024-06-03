const fs = require('fs');
const csv = require('csv-parser');

const csvFiles = [
  'atlantic_superstore.csv', 'chalo.csv', 'dominion.csv', 'farmboy.csv',
  'independent_grocer.csv', 'loblaws.csv', 'longos.csv', 'maxi.csv',
  'nofrills.csv', 'provigo.csv', 'real_canadian_superstore.csv', 'sobeys.csv',
  'valumart.csv', 'wholesale_club.csv', 'zehrs.csv'
];

const products = new Map();

function readCSV(file) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(file)
      .pipe(csv())
      .on('data', (data) => {
        let name = data.Name.trim();
        // Check if the name contains commas and is not enclosed in double quotes
        if (name.includes(',') && !name.startsWith('"') && !name.endsWith('"')) {
          // Enclose the name in double quotes to ensure it's treated as a single field
          name = `"${name}"`;
        }
        const price = parseFloat(data.Price.replace(/[^\d.]/g, ''));
        if (name && !isNaN(price)) {
          products.set(name, price);
        } else {
          console.warn(`Invalid data in file ${file}:`, data);
        }
      })
      .on('end', resolve)
      .on('error', reject);
  });
}

async function mergeCSVs() {
  for (const file of csvFiles) {
    await readCSV("./csvS/" + file); // Adjust the file path
  }

  const writeStream = fs.createWriteStream('output.csv');
  writeStream.write('name,price\n');

  for (const [Name, Price] of products) {
    writeStream.write(`${Name},${Price}\n`);
  }

  writeStream.end();
}

mergeCSVs().then(() => {
  console.log('Todos los archivos CSV se han combinado en output.csv');
}).catch((err) => {
  console.error('Error al combinar archivos CSV:', err);
});
