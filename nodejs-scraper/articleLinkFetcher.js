const puppeteer = require('puppeteer-extra') 
const fs = require('fs')
const performance = require('execution-time')()

//at beggining of code
performance.start()
 
// add stealth plugin and use defaults (all evasion techniques) 
const StealthPlugin = require('puppeteer-extra-plugin-stealth') 
puppeteer.use(StealthPlugin()) 
 
const {executablePath} = require('puppeteer') 

//copy the url and paste it on browser if you wanna see the details...
var arguments = process.argv ;
//checking startPage is given
if (arguments.length === 2) {
    console.error('Expected at least one argument!');
    // return will only stop the function that contains the return statement. 
    // process.exit will stop all the running functions and stop all the tasks.
    process.exit(1);
}
let sampleUrl = 'https://journals.sagepub.com/action/doSearch?field1=AllField&text1=arts&publication=&Ppub=&access=&pageSize=1000&AfterYear=2014&BeforeYear=2023&queryID=14%2F1651925948&startPage=7&sortBy=FullEpubDateField'
let searchText = "humanities"
let number_of_articles = 2000
let startPage = arguments[2]
let articlesUrl = `https://journals.sagepub.com/action/doSearch?field1=AllField&text1=${searchText}&publication=&Ppub=&access=&pageSize=${number_of_articles}&AfterYear=2014&BeforeYear=2023&queryID=14%2F1651925948&startPage=${startPage}&sortBy=FullEpubDateField`

let fileName = `start=${startPage}_search=${searchText}_articles=${number_of_articles}__.json`
let filePath = '/home/zoe/email-marketing/nodejs-scraper/articlesLinkJsons/'

let filePathPlusName = filePath+fileName

async function run () {
    const browser = await puppeteer.launch({
        headless: false,
        // defaultViewport: false,
        userDataDir: './temp',
        executablePath: executablePath()
    })

    console.log('Browser Launched.....\n')
    const page = await browser.newPage()
    let httpStatus = await page.goto(articlesUrl, {
        waitUntil: "domcontentloaded",
        timeout: 100000
    })

    let statusCode = httpStatus.status()

    console.log('Status Code is ', statusCode, '\n')
    console.log('Page Loaded....\n')

    const grabArticletitles = await page.evaluate(() => {
        let results = []
        let items = document.querySelectorAll(".sage-search-title")
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












