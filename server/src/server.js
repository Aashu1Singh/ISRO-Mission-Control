const http = require("http");
const app = require("./app");
const mongoose = require("mongoose");

const { loadPlanetsData } = require("./models/planets.model");

const PORT = 5000;
const MONGO_URL =
  "mongodb+srv://nasa-api:11Y08W8XklhazbhG@cluster0.hzy3dgr.mongodb.net/nasa?retryWrites=true&w=majority";

const server = http.createServer(app);

mongoose.connection.once("open", () => {
  console.log("MongoDB connected ");
});

mongoose.connection.on("error", (err) => {
  console.error(err);
});

async function startServer() {
  mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await loadPlanetsData();
  
  server.listen(PORT, () => {
    console.log(`Server is Running on port ${PORT}`);
  });
}

startServer();
