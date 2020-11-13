const AWS=require('aws-sdk')
const uuid=require('uuid/v1')
const keys=require('../config/keys')
const requirelogin=require('../middlewares/requireLogin')

const s3=new AWS.S3({
    accessKeyId:keys.accessKeyId,
    secretAccessKey:keys.secretAccessKey
})

module.exports=app=>{
    app.get('/api/upload',requirelogin,(req,res)=>{
        const key= `${req.user.id}/${uuid()}.jpeg`
        s3.getSignedUrl('putObject',
        {
            Bucket:'',  //bucket name must be given
            ContentType:'image/jpeg',
            Key:key
        },
        (err,presignedurl)=>{
            res.send({key,presignedurl})
        })
    })  
}