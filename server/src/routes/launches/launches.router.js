const express = require("express");
const {
  httpGetAllLaunches,
  httpAddNewLaunches,
  httpAbortLaunch
} = require("./launches.controller");

const LaunchesRouter = express();

LaunchesRouter.get("/", httpGetAllLaunches);
LaunchesRouter.post("/", httpAddNewLaunches);
LaunchesRouter.delete("/:id", httpAbortLaunch);

module.exports = LaunchesRouter;
