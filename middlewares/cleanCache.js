const {clearCache} = require('../services/cache')

module.exports= async (req,res,next)=>{
    await next();       //this waits until next func in line executes and returns 

    clearCache(req.user.id);    //then cache is cleared
}