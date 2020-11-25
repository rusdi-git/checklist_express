require('dotenv/config');
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const {checkAuth} = require('./helpers/authenticate');

const app = express();
app.use(bodyParser.json());

const db = process.env.DB_URI;
mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Database Connected"))
  .catch((err) => console.log(err));

const checklistRouter = require("./routes/checklist");
const userRouter = require("./routes/user");
app.use("/checklists", (req,res)=>checkAuth(req,res,checklistRouter));
app.use("/authenticate",userRouter);

app.listen(process.env.PORT, () => console.log(`Server Running at ${process.env.PORT}`));