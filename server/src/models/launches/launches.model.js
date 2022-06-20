const launchesModel = require('./launches.mongo');
const planetsModel = require('../planets/planets.mongo');
const axios = require('axios');

let DEFAULT_FLIGHT_NUMBER = 0;
const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';

async function populateLaunches() {
  console.log('Downloading launches...');
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: 'rocket',
          select: {
            name: 1,
          },
        },
        {
          path: 'payloads',
          select: {
            customers: 1,
          },
        },
      ],
    },
  });

  if (response.status !== 200) {
    console.log('Problem downloading launches');
    throw new Error('Launch data download failed');
  }

  const launchDocs = response.data.docs;
  for (let launchDoc of launchDocs) {
    const payloads = launchDoc.payloads;
    const customers = payloads.flatMap((payload) => {
      return payload.customers;
    });
    const launch = {
      flightNumber: launchDoc.flight_number,
      mission: launchDoc.name,
      rocket: launchDoc.rocket.name,
      launchDate: launchDoc.date_local,
      upcoming: launchDoc.upcoming,
      success: launchDoc.success,
      customers,
    };
    await saveLaunch(launch);
  }
}

async function getAllLaunches(skip, limit) {
  return await launchesModel
    .find({}, { __id: 0, __v: 0 })
    .skip(skip)
    .limit(limit)
    .sort({ flightNumber: 1 });
}

async function loadLaunches() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: 'Falcon 1',
    mission: 'FalconSat',
  });
  if (firstLaunch) {
    console.log('Launch data already loaded');
  } else {
    populateLaunches();
  }
}

async function findLaunch(filter) {
  return await launchesModel.findOne(filter);
}

async function getLatestFlightNumber() {
  const latestLaunch = await launchesModel.findOne({}).sort('-flightNumber');
  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }
  return latestLaunch.flightNumber;
}

async function saveLaunch(launch) {
  await launchesModel.updateOne(
    { flightNumber: launch.flightNumber },
    { ...launch },
    { upsert: true }
  );
}

async function addNewLaunch(launch) {
  const planet = await planetsModel.findOne({ keplerName: launch.target });
  if (!planet) {
    throw new Error('No matching planet is found.');
  }
  const newFlightNumber = (await getLatestFlightNumber()) + 1;
  const newLaunch = {
    ...launch,
    flightNumber: newFlightNumber,
    success: true,
    upcoming: true,
    customers: ['NASA'],
  };
  await saveLaunch(newLaunch);
}

async function launchExists(launchId) {
  return await findLaunch({ flightNumber: launchId });
}

async function abortLaunch(launchId) {
  const aborted = await launchesModel.updateOne(
    { flightNumber: launchId },
    {
      success: false,
      upcoming: false,
    }
  );
  return aborted.modifiedCount === 1;
}

module.exports = { loadLaunches, abortLaunch, launchExists, getAllLaunches, addNewLaunch };
