const PORT = process.env.PORT || 8000;
const app = require('./app');

const { loadPlanetsData } = require('./models/planets.model');

const http = require('http');
const server = http.createServer(app);

loadPlanetsData().then(() => {
  server.listen(PORT, () => {
    console.log(`Server is listening on port: ${PORT}`);
  });
});
