const express = require('express');
const launchesRouter = express.Router();
const { httpGetAllLaunches, httpPostNewLaunch, httpAbortLaunch } = require('./launches.controller');

launchesRouter.route('/').get(httpGetAllLaunches).post(httpPostNewLaunch);

launchesRouter.delete('/:id', httpAbortLaunch);

module.exports = launchesRouter;
