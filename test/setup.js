jest.setTimeout(30000)
//set timeout for failing indi test to 30 secs,  by dfault it is 5 secs

require('../models/User')
const mongoose=require('mongoose')
const keys=require('../config/keys')


mongoose.Promise=global.Promise
mongoose.connect(keys.mongoURI, { useMongoClient: true });