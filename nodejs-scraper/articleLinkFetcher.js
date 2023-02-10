const puppeteer = require('puppeteer-extra') 
const fs = require('fs')
const performance = require('execution-time')()

//at beggining of code
performance.start()
 
// add stealth plugin and use defaults (all evasion techniques) 
const StealthPlugin = require('puppeteer-extra-plugin-stealth') 
puppeteer.use(StealthPlugin()) 
 
const {executablePath} = require('puppeteer') 

let searchText = "arts"
let number_of_articles = 10
let startPage = 1
let articlesUrl = `https://journals.sagepub.com/action/doSearch?field1=AllField&text1=${searchText}&publication=&Ppub=&access=&pageSize=${number_of_articles}&AfterYear=2014&BeforeYear=2023&queryID=14%2F1651925948&startPage=${startPage}&sortBy=FullEpubDateField`

let fileName = `journals.sagepub.com__start=${startPage}_articles=${number_of_articles}_search=${searchText}__.json`
let filePath = '/home/zoe/email-marketing/nodejs-scraper/articlesLinkJsons/'

let filePathPlusName = filePath+fileName

async function run () {
    const browser = await puppeteer.launch({
        // headless: false,
        // defaultViewport: false,
        // userDataDir: './temp',
        executablePath: executablePath()
    })

    console.log('Browser Launched.....\n')
    const page = await browser.newPage()
    await page.goto(articlesUrl, {
        waitUntil: "domcontentloaded",
    })

    console.log('Page Loaded....\n')

    const grabArticletitles = await page.evaluate(() => {
        let results = []
        let items = document.querySelectorAll(".sage-search-title")
        items.forEach((item)=>{
            results.push({
                url: item.getAttribute('href'),
                title: item.innerText
            })
        })
        return results

    })
    jsonStringified = JSON.stringify(grabArticletitles)

    console.log('Got all article urls....\n')
    await browser.close()
    console.log('Browser closed.....\n')

    fs.writeFile(filePathPlusName, jsonStringified, 'utf8' , (err)=>{
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












