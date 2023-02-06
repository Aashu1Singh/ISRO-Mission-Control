const launchDatabase = require("./launches.mongo");
const planets = require("./planets.mongo");
const axios = require("axios");

// const launch = {
//   flightNumber: 100,
//   mission: "kepler Exploration X",
//   rocket: "Explorer IS1",
//   launchDate: new Date("December 27, 2030"),
//   target: "Kepler-442 b",
//   upcoming: true,
//   customers: ["NOA", "NASA"],
//   success: true,
// };

// saveLaunch(launch);

const SACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";

async function populateLaunches() {
  const response = await axios.post(SACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: {
            name: "1",
          },
        },
        {
          path: "payloads",
          select: {
            customers: 1,
          },
        },
      ],
    },
  });

  if (response.status != 200) {
    console.log("Error while downloading launch data");
    throw new Error("Launch data downloaad failed");
  }

  const launchDocs = response.data.docs;
  for (const launchDoc of launchDocs) {
    const payloads = launchDoc["payloads"];
    const customers = payloads.flatMap((payload) => {
      return payload["customers"];
    });
    const launch = {
      flightNumber: launchDoc["flight_number"],
      mission: launchDoc["name"],
      rocket: launchDoc["rocket"]["name"],
      upcoming: launchDoc["upcoming"],
      success: launchDoc["success"],
      launchDate: launchDoc["date_local"],
      customers,
    };
    // console.log(`${launch.flightNumber}`);
    saveLaunch(launch);
  }
}

async function loadLaunchData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: "Falcon 1",
    mission: "FalconSat",
  });
  if (firstLaunch) {
    console.log("Launch data already exits");
    return;
  } else {
    await populateLaunches();
  }
}

async function getAllLaunches(skip, limit) {
  return await launchDatabase
    .find(
      {},
      {
        _id: 0,
        __v: 0,
      }
    )
    .skip(skip)
    .limit(limit);
}

async function saveLaunch(launch) {
  await launchDatabase.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    {
      upsert: true,
    }
  );
}

async function scheduleNewLaunch(launch) {
  const planet = await planets.findOne({
    keplerName: launch.target,
  });

  if (!planet) {
    throw new Error("No matching planets found");
  }

  const newFlightNumber = (await getLatestFlightNumber()) + 1;

  const newLaunch = Object.assign(launch, {
    upcoming: true,
    success: true,
    customers: ["ZTM", "Nasa"],
    flightNumber: newFlightNumber,
  });

  await saveLaunch(newLaunch);
}

// function addNewLaunch(launch) {
//   latestFlightNumber++;
//   launches.set(
//     latestFlightNumber,
//     Object.assign(launch, {
//       success: true,
//       upcoming: true,
//       customer: ["Zero to mastery", "NASA"],
//       flightNumber: latestFlightNumber,
//     })
//   );
// }

async function findLaunch(filter) {
  return await launchDatabase.findOne(filter);
}

async function existsLaunchById(launchId) {
  // return launch.has(launchId);
  return await findLaunch({
    flightNumber: launchId,
  });
}

async function getLatestFlightNumber() {
  const latestLaunch = await launchDatabase.findOne().sort("-flightNumber");
  if (!latestLaunch) {
    return 100;
  }

  return latestLaunch.flightNumber;
}

async function abortLaunchById(launchId) {
  const aborted = await launchDatabase.updateOne(
    {
      flightNumber: launchId,
    },
    {
      upcoming: false,
      success: false,
    }
  );

  return aborted.modifiedCount === 1 && aborted.matchedCount === 1;

  // const aborted = launches.get(launchId);
  // aborted.upcoming = false;
  // aborted.success = false;
  // return aborted;
}

module.exports = {
  getAllLaunches,
  scheduleNewLaunch,
  existsLaunchById,
  abortLaunchById,
  loadLaunchData,
};
