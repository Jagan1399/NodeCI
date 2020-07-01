const Buffer=require('safe-buffer').Buffer
const Keygrip=require('keygrip')
const keys = require('../../config/keys')
const keygrip=new Keygrip([keys.cookieKey])

module.exports=(user)=>{

    const session_obj={passport:{user:user._id.toString()}} //session is set by using this obj format in OAUTH.
    const session=Buffer.from(JSON.stringify(session_obj)).toString('base64') //converting raw data to base64 encoded
    const sess_sig=keygrip.sign('session='+session) //generate session sign
    
    return {session,sig:sess_sig}
    
}