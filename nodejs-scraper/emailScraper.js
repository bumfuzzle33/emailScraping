const puppeteer = require('puppeteer-extra') 
const fs = require('fs').promises
const performance = require('execution-time')()

//at beggining of code
performance.start()


// add stealth plugin and use defaults (all evasion techniques) 
const StealthPlugin = require('puppeteer-extra-plugin-stealth') 
puppeteer.use(StealthPlugin()) 
 
const {executablePath} = require('puppeteer') 

//Fill right below variable from articlesLinkJsons folder
let articleJSONFileName = 'journals.sagepub.com__start=0_articles=1000_search=arts__.json'

let articleJSONFilePath = '/home/zoe/email-marketing/nodejs-scraper/articlesLinkJsons/'
let articleJSONFilePathPlusName = articleJSONFilePath + articleJSONFileName

let fileName = `journals.sagepub.com__${articleJSONFileName}__emails.txt`
let filePath = '/home/zoe/email-marketing/nodejs-scraper/emailsScraped/'
let filePathPlusName = filePath + fileName

async function scrapeMails(){
    const siteUrl = 'https://journals.sagepub.com'
    const articlesJSON = await fs.readFile(articleJSONFilePathPlusName, 'utf8')
    const articleObj = JSON.parse(articlesJSON)

    const browser = await puppeteer.launch({
        // headless: false,
        // defaultViewport: false,
        // userDataDir: './temp',
        executablePath: executablePath()
    })

    console.log('Browser Launched.....\n')

    const page = await browser.newPage()

    for (let i = 0; i < articleObj.length; i++){
        console.log(`${i+1} article(s) of ${articleObj.length} articles processing...\n`)
        let constructedUrl = siteUrl+articleObj[i].url
        await page.goto(constructedUrl, {
            waitUntil: "domcontentloaded",
        })
        console.log(`Page Loaded....\n`)

        const grabEmails = await page.evaluate(() => {
            let results = []
            let mailtoElements = document.querySelectorAll('a[href^="mailto:"]')

            mailtoElements.forEach((mailElement)=>{
                results.push({
                    email: mailElement.innerText
                })

            })

            return results

        })

        let emailSubArray = grabEmails
        console.log(`Got ${i+1} article, mails`)
        emailSubArray.forEach(emailObj=>{
            fs.appendFile(filePathPlusName, `${emailObj.email}\n`, 'utf8', (err)=>{
                if(err){
                    console.log(`An error occured while writing emails to ${fileName}`)
                    return console.log(err)
                }

                console.log(`Emails of article = ${i+1} has been written`)
            })
        })

    }
    //at end of your code
    const performaceResults = performance.stop();
    const performanceTimeMilli = performaceResults.time
    console.log(`Time Took: ${(performanceTimeMilli/1000)/60} minutes or ${performanceTimeMilli/1000} seconds or ${performanceTimeMilli} milli seconds\n`);  // in milliseconds
    await browser.close()

 
}

scrapeMails()
