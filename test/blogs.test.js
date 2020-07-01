const Page=require('./helpers/page')

let page
beforeEach(async ()=>{
    page=await Page.build()
    await page.goto('http://localhost:3000')
})

afterEach(async ()=>{
    await page.close()
})

//describe allows us to nest tests and also specify before,afterEach for these tests
describe("when logged in",async ()=>{
    beforeEach(async ()=>{
        await page.login()
        await page.click('.fixed-action-btn')
    })

    test("Can see blog creation form",async ()=>{
        const label_head=await page.getContentsof('.title label')
        expect(label_head).toEqual('Blog Title')
    })

    describe('And when valid input is given', () => {
        beforeEach(async ()=>{
            await page.type('.title input',"My Title")
            await page.type('.content input',"My content")
            await page.click('form button')
        })

        test("Review form is displayed",async ()=>{
            const review_header=await page.getContentsof('form h5')
            expect(review_header).toEqual("Please confirm your entries")
        })

        test("Submitting and verify if blog is added to index page",async ()=>{
            await page.click('.green')
            await page.waitFor('.card')
            const card_title=await page.getContentsof('.card-title')
            const card_content=await page.getContentsof('.card-content p')
            expect(card_title).toEqual('My Title')
            expect(card_content).toEqual('My content')
        })
    })
    

    describe("And when no input is given",async ()=>{
        beforeEach(async ()=>{
            await page.click('form button')
        })
        
        test("Error message is displayed",async ()=>{
            const error_title=await page.getContentsof('.title .red-text')
            const error_content=await page.getContentsof('.content .red-text')
            expect(error_content).toEqual("You must provide a value")
            expect(error_title).toEqual('You must provide a value')
        })

    })
    
})

describe('When not logged in', async () => {
    test('Blog cannot be created',async ()=>{
        const outcome= await page.evaluate(
            ()=>{
                return fetch('/api/blogs',{
                    method:'POST',
                    credentials:'same-origin',
                    headers:{
                        "Content-Type":'application/json'
                    },
                    body: JSON.stringify({title:"My Title",content:"My content"})                    
                })
                .then(res=>
                   res.json()
                )
            }
        )
        expect(outcome).toEqual({error:"You must log in!"})
    })

    test("Cannot view posts",async ()=>{
        const outcome=await page.evaluate(
            ()=>{
                return fetch('/api/blogs',{
                    method:'GET',
                    credentials:'same-origin',
                    headers:{
                        'Content-Type':'application/json'
                    }
                })
                .then(res=>res.json())
            }
        )
        expect(outcome).toEqual({error:"You must log in!"})
    })
})
