const express = require("express");
const router = express.Router();
const User = require('../models/user');
const Joi = require("joi");

const loginSchema = Joi.object({
    username:Joi.string().required(),
    password:Joi.string().required(),
});