const express = require('express');
const planetsRouter = express.Router();
const { httpGetAllPlanets } = require('./planets.controllers');

planetsRouter.get('/', httpGetAllPlanets);

module.exports = planetsRouter;
