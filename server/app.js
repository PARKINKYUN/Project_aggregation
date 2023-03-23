const express = require("express");
const app = express();
const cors = require("cors");
const routes = require("./routes");

const dotenv = require("dotenv");
dotenv.config();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

app.use("/", routes);

const port = 4000;
const server = app.listen(port, () => console.log("Server started. port: ", port));

module.exports = server;
