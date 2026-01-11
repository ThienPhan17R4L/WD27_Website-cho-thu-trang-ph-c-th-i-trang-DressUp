import dotenv from "dotenv";
dotenv.config();

import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(process.env.PORT, () => {
  console.log("Server running on port " + process.env.PORT);
});
