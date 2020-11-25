require('dotenv/config');
const bcrypt = require('bcrypt');
const mongoose = require("mongoose");
const User = require('../models/user');

const seed_data = {
    users:[
        {
            username:'admin',
            password:'admin123'
        }
    ]
};

const saltRounds = 5;

const seed = ()=>{
    const db = process.env.DB_URI;
    mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => console.log("Database Connected")).catch((err) => console.log(err));
    seed_data.users.forEach(element => {
        bcrypt.hash(element.password,saltRounds,async (err,hash)=>{
            const current_user = await User.find();
            if(current_user) {
                   mongoose.connection.db.dropCollection('user',()=>{
                    User.create({username:element.username,password:hash});                       
                   });
            } else {
                User.create({username:element.username,password:hash});
            }
        });
    });
};

seed();