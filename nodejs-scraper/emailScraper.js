const puppeteer = require('puppeteer-extra') 
const fs = require('fs').promises
const performance = require('execution-time')()
const { Cluster } = require('puppeteer-cluster')

//at beggining of code
performance.start()


// add stealth plugin and use defaults (all evasion techniques) 
const StealthPlugin = require('puppeteer-extra-plugin-stealth') 
puppeteer.use(StealthPlugin()) 
 
const {executablePath} = require('puppeteer') 

//Fill right below variable from articlesLinkJsons folder
let articleJSONFileName = 'journals.sagepub.com__start=1_articles=1000_search=arts__.json'

let articleJSONFilePath = '/home/zoe/email-marketing/nodejs-scraper/articlesLinkJsons/'
let articleJSONFilePathPlusName = articleJSONFilePath + articleJSONFileName

let fileName = `journals.sagepub.com__${articleJSONFileName}__emails.txt`
let filePath = '/home/zoe/email-marketing/nodejs-scraper/emailsScraped/'
let filePathPlusName = filePath + fileName

async function scrapeMails(){
    const siteUrl = 'https://journals.sagepub.com'
    const articlesJSON = await fs.readFile(articleJSONFilePathPlusName, 'utf8')
    const articleObj = JSON.parse(articlesJSON)
    let successCount = 0

    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        maxConcurrency: 10,
        puppeteerOptions: {
            // headless: false,
            // defaultViewport: false,
            // userDataDir: './temp',
            // executablePath: executablePath()
        }
    })

    const userAgent = 'Mozilla/5.0 (X11; Linux x86_64)' + 'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.39 Safari/537.36';

    // await page.setUserAgent(userAgent);
    await cluster.task(async ({page, data: {url,} }) => {
        await page.setUserAgent(userAgent)
        await page.goto(url, {
            waitUntil: 'domcontentloaded'
        })

        console.log(`Page Loaded.... \n`)
        await page.screenshot({
            path: 'scrnshot2.jpg'
        })

        const grabEmails = await page.evaluate(() => {
            let results = []
            let mailtoElements = document.querySelectorAll('a[href^="mailto:"]')
            mailtoElements.forEach((mailElement) => {
                results.push({
                    email: mailElement.innerText
                })

            })

            return results

        })
        let emailSubArray = grabEmails
        console.log(emailSubArray)
        console.log(`Got article mails object`)

        emailSubArray.forEach((emailObj,index)=>{
            fs.appendFile(filePathPlusName, `${emailObj.email}\n`, 'utf8', (err)=>{
                if(err){
                    console.log(`An error occured while writing emails to ${fileName}`)
                    return console.log(err)
                }

            })

            if(index == emailSubArray.length - 1){
                successCount += 1
            }
        })
        console.log(`Successful Articles Finished = ${successCount}....`)


    })

    for (let i = 0; i < articleObj.length; i++){
        console.log(`${i+1} article(s) of ${articleObj.length} articles processing...\n`)
        let constructedUrl = siteUrl+articleObj[i].url
        await cluster.queue({
            url: constructedUrl,
            count: i
        })
    }

    

    
    await cluster.idle()
    await cluster.close()

    //at end of your code
    const performaceResults = performance.stop();
    const performanceTimeMilli = performaceResults.time
    console.log(`Time Took: ${(performanceTimeMilli/1000)/60} minutes or ${performanceTimeMilli/1000} seconds or ${performanceTimeMilli} milli seconds\n`);  // in milliseconds
}

scrapeMails()
