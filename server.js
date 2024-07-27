const express = require("express");
require("dotenv").config();

const shopifyRoute = require("./src/controller/shopifyRoute.js");
const errorHandler = require("./src/middleware/errorHandler.js");

const app = express();
const PORT = process.env.PORT || 5050;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api", shopifyRoute);
app.use(errorHandler);

const server = app.listen(PORT, () => {
  const port = server.address().port;
  console.log(`Server listening on ${port}`);
});

const closeServer = (eventName) => {
  server.close(() => {
    console.log(`Closing server: ${eventName}`);
  });
};

process.on("SIGINT", closeServer);
process.on("SIGTERM", closeServer);
process.on("uncaughtException", (err) => {
  console.log(err);
  process.exit(1);
});
