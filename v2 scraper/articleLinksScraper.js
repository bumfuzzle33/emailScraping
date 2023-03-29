const puppeteer = require('puppeteer-extra') 
const fs = require('fs')
const performance = require('execution-time')()

//at beggining of code
performance.start()
 
// add stealth plugin and use defaults (all evasion techniques) 
const StealthPlugin = require('puppeteer-extra-plugin-stealth') 
puppeteer.use(StealthPlugin()) 
 
const {executablePath} = require('puppeteer') 


async function run() {
    const browser = await puppeteer.launch({
        userDataDir: './temp',
        executablePath: executablePath()
    })

    console.log('Browser Launched....\n')
    const page = await browser.newPage()
    let httpStatus = await page.goto("https://ajol.ateneo.edu/jmgs/issues/29", {
        waitUntil: "domcontentloaded",
        timeout: 100000
    })

    let statusCode = httpStatus.status()

    console.log('Status Code is ', statusCode, '\n')
    console.log('Page Loaded....\n')

    const grabArticletitles = await page.evaluate(() => {
        let results = []
        let items = document.querySelectorAll(".a-title > [href]")
        console.log('Total Elements Match Found = ', items.length)
        items.forEach((item)=>{
            results.push({
                url: item.getAttribute('href'),
                title: item.innerText
            })
        })
        return results

    })

    jsonStringified = JSON.stringify(grabArticletitles)
    console.warn("Article URL's scraped = ", grabArticletitles.length)
    console.log('Got all article urls....\n')

    await browser.close()
    console.log('Browser closed.....\n')
    let fileName = 'articles.txt'

    fs.appendFile(fileName, jsonStringified, 'utf8' , (err)=>{
        if(err){
            console.log(`An error occured while writing JSON object to ${fileName}`)
            return console.log(err)
        }

        console.log("JSON file has been saved.")
    })

    //at end of your code
    const performaceResults = performance.stop();
    const performanceTimeMilli = performaceResults.time
    console.log(`Time Took: ${(performanceTimeMilli/1000)/60} minutes or ${performanceTimeMilli/1000} seconds or ${performanceTimeMilli} milli seconds\n`);  // in milliseconds
    console.log(`saved to json file = ${fileName}`)

}

run()









