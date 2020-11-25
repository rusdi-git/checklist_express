const User = require('../models/user');

const checkApi = async (apikey) =>{
    const user = await User.findOne({apikey});
    return user?user._id:null;
}

const checkAuth = (req,res,next) =>{
    const apikey = req.headers.authorization;
    if(apikey&&checkApi(apikey)) {
        req.user = apikey;
        return next(req,res);
    } else {
        res.status(401).json({error:'Not Authorized'});
    }
}

module.exports ={checkAuth};