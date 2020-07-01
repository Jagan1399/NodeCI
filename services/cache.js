const mongoose=require('mongoose');
const redis = require('redis');
const util=require('util');
const { UV_FS_O_FILEMAP } = require('constants');
const keys=require('../config/keys')

//REDIS CONFIG
// const redisURL='redis://127.0.0.1:6379'
const client=redis.createClient(keys.redisURL)
client.hget=util.promisify(client.hget);

mongoose.Query.prototype.cache=function(options={}){

    this.useCache=true      //if this func is called,  useCache is set to true and content is cached
    this.hashKey=JSON.stringify(options.key || '');  //if obj is passed it converts to string/ num, if key passed is empty, we declare it a null

    return this;            //return this is to enable this func to be chained
}

const exec=mongoose.Query.prototype.exec;   //setting dfault behaviour to exec and modify baviour in next line

mongoose.Query.prototype.exec= async function(){
    if(!this.useCache)
    {
        // console.log("FROM DB")
        return exec.apply(this,arguments);
    }

   
    const key=JSON.stringify(Object.assign({},this.getQuery(),{collection:this.mongooseCollection.name}));
    // console.log("key is "+JSON.stringify(key))

    // 1. get value for the key from redis
    const cacheValue=await client.hget(this.hashKey,key);

    //2. check if there is a value or it is null
    if(cacheValue)
    {
        // console.log("FROM CACHE")
        const res_doc=JSON.parse(cacheValue)    
        return Array.isArray(res_doc)
            ? res_doc.map(indi_doc => new this.model(indi_doc))  //if it is an array then iterate thro and model each value in iteration 
            : new this.model(res_doc)   //this refers to curr query and hence points to model, we convert JSon from redis to mongoose document format
        
    }

    // 3. if no value in cache then let run mongoose cmd
    const result=await exec.apply(this,arguments)

    client.hset(this.hashKey,key,JSON.stringify(result),'EX',10)  //redis oly handles json values
    return result

    
}

module.exports={
    clearCache(hash_key)
    {
        client.del(JSON.stringify(hash_key));
    }
}
//object.assign == 1.{} ==created an empty object
//                  2.this.Query()==output is this gets assigned to 1
//                  3. {collection: this.mongooseCollection.name} == creates an obj containing collection name of query

//MONGOOSE FUNCTION EXPECTS MONGOOSE DOCUMENTS TO BE RETURNED INSTEAD OF JSON

 // console.log("Im Bout to run a query")
    // console.log(this.getQuery());   //this gets the entire query sent to mongoose
    // console.log(this.mongooseCollection.name);  //this stands for the current query that is being executed

// redis oly accepts string or number as key