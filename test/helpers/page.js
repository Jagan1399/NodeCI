const puppeteer=require('puppeteer');
const sessionfactory=require('../factories/sessionFactory')
const userfactory=require('../factories/userfactory')
class CustomPage{
    static async build(){
        const browser=await puppeteer.launch({
            headless:true,
            args:['--no-sandbox']   
        })  
        const page=await browser.newPage();
        const customPage=new CustomPage(page)

        return new Proxy(CustomPage,{
            get:(target,property)=>{
                return customPage[property] || browser[property] || page[property]
            }
        })
    }
    constructor(page)
    {
        this.page=page;
    }
    
    async login()
    {
        const user=await userfactory()
        const {session,sig}=sessionfactory(user)
        //set-cookie
        await this.page.setCookie({name:'session', value:session});
        await this.page.setCookie({name:'session.sig',value:sig})

        //reload page once cookie is set
        await this.page.goto('http://localhost:3000/blogs')

        //to wait for one particular thing,
        //await this.page.waitFor('a[href="/auth/logout"])
    }

    async getContentsof(selector)
    {
        return this.page.$eval(selector, content=>content.innerHTML)
    }

} 

module.exports=CustomPage