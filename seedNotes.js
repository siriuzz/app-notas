// Cargar los datos de prueba en la base de datos
const mongoose = require('mongoose');
require('dotenv').config();
const fs = require('fs');
const Note = require('./database.js');

// Conecta a tu base de datos MongoDB
const {MONGO_DB_NAME} = process.env; 
mongoose.connect(`mongodb://localhost:27017/${MONGO_DB_NAME}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Ruta al archivo JSON con los datos que deseas cargar
const jsonFilePath = './notes.json';

// Carga los datos desde el archivo JSON
const loadData = () => {
  fs.readFile(jsonFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error al leer el archivo JSON:', err);
      process.exit(1);
    }

    const jsonData = JSON.parse(data);

    // Guarda los datos en la base de datos
    Note.insertMany(jsonData, (err, docs) => {
      if (err) {
        console.error('Error al cargar los datos:', err);
      } else {
        console.log('Datos cargados exitosamente:', docs);
      }

      // Cierra la conexión a la base de datos
      mongoose.connection.close();
    });
  });
};

// Ejecuta la función para cargar los datos
loadData();
