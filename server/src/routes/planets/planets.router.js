const express = require('express');
const planetsRouter = express.Router();
const {getAllPlanets} = require('./planets.controllers');

planetsRouter.get('/planets', getAllPlanets);

module.exports = planetsRouter;
