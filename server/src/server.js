require('dotenv').config();
const app = require('./app');
const http = require('http');
const { mongoConnect } = require('./services/mongo');
const { loadPlanetsData } = require('./models/planets/planets.model');
const { loadLaunches } = require('./models/launches/launches.model');

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

async function startServer() {
  await mongoConnect();
  await loadPlanetsData();
  await loadLaunches();
  server.listen(PORT, () => {
    console.log(`Server is listening on port: ${PORT}`);
  });
}

startServer();
