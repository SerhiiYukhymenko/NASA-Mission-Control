const mongoose = require('mongoose');
require('dotenv').config();
const MONGO_URL = process.env.MONGO_URL;

async function mongoConnect() {
  await mongoose.connect(MONGO_URL);
}

async function mongoDisconnect() {
  await mongoose.disconnect();
}

mongoose.connection.once('open', () => {
  console.log('Connected to DB');
});

mongoose.connection.on('error', (err) => {
  console.error(err);
});

module.exports = { mongoConnect, mongoDisconnect };
