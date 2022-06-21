const {
  getAllLaunches,
  addNewLaunch,
  launchExists,
  abortLaunch,
} = require('../../models/launches/launches.model');
const getPagination = require('../../services/query');

async function httpGetAllLaunches(req, res) {
  const { skip, limit } = getPagination(req.query);
  return res.status(200).json(await getAllLaunches(skip, limit));
}

async function httpPostNewLaunch(req, res) {
  const launch = req.body;
  if (!launch.mission || !launch.rocket || !launch.target || !launch.launchDate) {
    return res.status(400).json({ error: 'Missing required launch property' });
  }

  launch.launchDate = new Date(launch.launchDate);

  if (isNaN(launch.launchDate)) {
    return res.status(400).json({ error: 'Invalid launch date' });
  }

  await addNewLaunch(launch);
  return res.status(201).json(launch);
}

async function httpAbortLaunch(req, res) {
  const id = Number(req.params.id);
  const launch = await launchExists(id);
  if (!launch) {
    res.status(404).json({
      error: 'Launch not found',
    });
  } else {
    const aborted = await abortLaunch(id);
    if (!aborted) {
      return res.status(400).json({ error: 'Launch had not been aborted' });
    }
    res.status(200).json({ ok: true });
  }
}
module.exports = { httpAbortLaunch, httpGetAllLaunches, httpPostNewLaunch };
