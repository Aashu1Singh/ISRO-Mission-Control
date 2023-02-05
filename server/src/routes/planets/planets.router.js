const express = require("express");
const { httpGetAllPlanets } = require("./planets.controller.js");

const PlanetsRouter = express.Router();

PlanetsRouter.get("/", httpGetAllPlanets);

module.exports = PlanetsRouter;
