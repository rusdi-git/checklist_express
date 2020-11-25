const express = require("express");
const bcrypt = require('bcrypt');
const router = express.Router();
const User = require('../models/user');
const Joi = require("joi");
const { use } = require("./checklist");

const loginSchema = Joi.object({
    username:Joi.string().required(),
    password:Joi.string().required(),
});

router.post('/', async (req,res)=>{
    const data = req.body.data;
    const {error,value} = loginSchema.validate(data);
    if(error) {
        return res.status(400).json({status:400,error:'Validation Failed'});
    } else {
        current_user = await User.findOne({username:value.username});
        if(current_user) {
            bcrypt.compare(value.password,current_user.password,async (err,result)=>{
                const token = bcrypt.hashSync(current_user.username,bcrypt.genSaltSync(8));
                const updated_user = await User.updateOne({username:current_user.username},{apikey:token});
                res.status(200).json({data:{api_key:token}});
            });
        } else {
            return res.status(404).json({result:'Not Found.'});
        }
    }
});

module.exports = router;