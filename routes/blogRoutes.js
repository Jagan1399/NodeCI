const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');

const clearCache =require('../middlewares/cleanCache')
const Blog = mongoose.model('Blog');

module.exports = app => {
  app.get('/api/blogs/:id', requireLogin, async (req, res) => {
    const blog = await Blog.findOne({
      _user: req.user.id,
      _id: req.params.id
    });

    res.send(blog);
  });

  app.get('/api/blogs', requireLogin, async (req, res) => {

    const blog=await Blog
                        .find({_user : req.user.id})
                        .cache({ key: req.user.id})
    res.send(blog)
    // const redis=require('redis')
    // const util=require('util')
    // const redisURL='redis://127.0.0.1:6379'
    // const client=redis.createClient(redisURL)
    // client.get=util.promisify(client.get) //modifies bhaviour of client.get function to return a promise. this works with func that has last argu as callback func.
    // const Cacheblogs= await client.get(req.user.id) //await can be used since it returns a promise
    // .catch((err)=>{
    //   console.log(err)
    // })

    // if(Cacheblogs)
    // {
    //   console.log("FROM CACHE")
    //   return res.send(JSON.parse(Cacheblogs))    //if blog found in cache response is sent
    // }
    // const blogs = await Blog.find({ _user: req.user.id });   //IF not found in cache, db is queried , response is sent

    // res.send(blogs);
    // client.set(req.user.id,JSON.stringify(blogs)); //and cache is updated
  
  });

    //check first with data in redis
    // client.get(req.user.id,(err,val)=>{
    //   if(val)
    //   {
    //     res.send(val)
    //   }
    //   else{
    //     const blogs = await Blog.find({ _user: req.user.id });

    //     res.send(blogs);
    //   }
    // })

    
  

  app.post('/api/blogs', requireLogin,clearCache, async (req, res) => {
    const { title, content } = req.body;

    const blog = new Blog({
      title,
      content,
      _user: req.user.id
    });

    try {
      await blog.save();
      res.send(blog);
    } catch (err) {
      res.send(400, err);
    }

  });
};
