require('dotenv/config');
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const db = process.env.DB_URI;
mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Database Connected"))
  .catch((err) => console.log(err));

const checklistRouter = require("./routes/checklist");
app.use("/checklists", checklistRouter);

app.listen(process.env.PORT, () => console.log(`Server Running at ${process.env.PORT}`));