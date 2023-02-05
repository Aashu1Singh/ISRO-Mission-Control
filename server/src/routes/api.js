const express = require("express");

const PlanetsRouter = require("./planets/planets.router");
const LaunchesRouter = require("./launches/launches.router");

const api = express();

api.use("/planets", PlanetsRouter);
api.use("/launches", LaunchesRouter);

module.exports = api

