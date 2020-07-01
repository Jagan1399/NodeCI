const puppeteer=require('puppeteer')
const Buffer=require('safe-buffer').Buffer
const Keygrip=require('keygrip')
const keys = require('../config/keys')
const sessionfactory=require('./factories/sessionFactory')
const userfactory=require('./factories/userfactory')

const SuperPage=require('./helpers/page')

let page

// beforeEach(async ()=>{    //beforeEach func runs before each test is run
//     browser=await puppeteer.launch({
//         headless:false   //if headless is true ==> opens without graphical interface | bydfault it is set to true
//     })                  //evthin inside puppeteer is async and hence await is mandatory
//     page=await browser.newPage();
//     await page.goto('localhost:3000')
// })
beforeEach(async ()=>{
    page=await SuperPage.build()
    await page.goto('http://localhost:3000')
})

afterEach(async ()=>{
    await page.close()
})

test("Verify Brand Logo text",async ()=>{
    
    const header_text=await page.getContentsof('a.brand-logo');
   
    expect(header_text).toEqual('Blogster');

})

test('clicking on login, verify redirect',async ()=>{
    await page.click('.right a');  //pupp converts each cmd to string sends to browser and then re-exec func | hence awit is used
    const curr_URL=await page.url()
    expect(curr_URL).toMatch(/accounts\.google\.com/)
})

test('When logged in, check logout button appears',async ()=>{

//all below code is transferred to page.js    
    // const user=await userfactory()
    // const {session,sig}=sessionfactory(user)
    // //set-cookie
    // await page.setCookie({name:'session', value:session});
    // await page.setCookie({name:'session.sig',value:sig})

    // //reload page once cookie is set
    // await page.goto('localhost:3000')

    // //below command is used if req ele is not loaded, this ensures test waits for the content which is to be tested
    // // await page.waitFor('a[href="/auth/logout"]')

    await page.login()

    const logout_text= await page.$eval('a[href="/auth/logout"]',content=> content.innerHTML);
   
    expect(logout_text).toEqual('Logout');

})