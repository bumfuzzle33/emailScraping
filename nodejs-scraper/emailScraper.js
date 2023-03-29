const puppeteer = require('puppeteer-extra') 
const fs = require('fs').promises
const performance = require('execution-time')()
const { Cluster } = require('puppeteer-cluster')
const child_process = require("child_process")
const readline = require("readline")
const sleep = require("sleep")




//at beggining of code
performance.start()

const maxThreads = 4


// add stealth plugin and use defaults (all evasion techniques) 
const StealthPlugin = require('puppeteer-extra-plugin-stealth') 
puppeteer.use(StealthPlugin()) 
 
const {executablePath} = require('puppeteer') 

//Fill right below variable from articlesLinkJsons folder
var arguments = process.argv ;
//checking json file argument is passed
if (arguments.length === 2) {
    console.error('Expected at least one argument!');
    // return will only stop the function that contains the return statement. 
    // process.exit will stop all the running functions and stop all the tasks.
    process.exit(1);
}
// let articleJSONFileName = 'journals.sagepub.com__start=6_articles=1000_search=arts__.json'
let articleJSONFileName = arguments[2]


let articleJSONFilePath = '/home/zoe/email-marketing/nodejs-scraper/articlesLinkJsons/'
let articleJSONFilePathPlusName = articleJSONFilePath + articleJSONFileName

let fileName = `${articleJSONFileName}__emails.txt`
let filePath = '/home/zoe/email-marketing/nodejs-scraper/emailsScraped/'
let filePathPlusName = filePath + fileName

async function scrapeMails(){
    const siteUrl = 'https://journals.sagepub.com'
    const articlesJSON = await fs.readFile(articleJSONFilePathPlusName, 'utf8')
    const articleObj = JSON.parse(articlesJSON)
    let successCount = 0
    let vpnReconnectCommandThreadActivate = false

    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        maxConcurrency: maxThreads,
        puppeteerOptions: {
            // headless: false,
            // defaultViewport: false,
            // userDataDir: './temp',
            executablePath: executablePath()
        }
    })

    const userAgent = 'Mozilla/5.0 (X11; Linux x86_64)' + 'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.39 Safari/537.36';

    await cluster.task(async ({page, data: {url,} }) => {
        await page.setUserAgent(userAgent)
        console.log(`Visit URL = ${url}`)
        await page.goto(url, {
            waitUntil: 'domcontentloaded'
        })
        .catch((err) => {
            
            console.log("error loading url")

            if(vpnReconnectCommandThreadActivate == false){
                console.log("\n\n PROTONVPN RECCONNECT PROCESS STARTED \n\n")
                vpnReconnectCommandThreadActivate = true
                const protonvpnDisconnect = child_process.spawn("protonvpn-cli", ["d"])

                // readline.createInterface({
                //     input     : protonvpnDisconnect.stdout,
                //     terminal  : false
                //   }).on('line', function(line) {
                //     console.log(line);
                // });
                // readline.createInterface({
                //     input     : protonvpnDisconnect.stderr,
                //     terminal  : false
                //   }).on('line', function(line) {
                //     console.log(line);
                // });
                
                // protonvpnDisconnect.on('error', (error) => {
                //     console.log(`error: ${error.message}`);
                // });
                
                protonvpnDisconnect.on("close", code => {
                    console.log(`child process exited with code ${code}\n vpn disconnect phase done!`);
                    const protonvpnRconnectRandom = child_process.spawn("protonvpn-cli", ["c","-r"])
                
                    // readline.createInterface({
                    //     input     : protonvpnRconnectRandom.stdout,
                    //     terminal  : false
                    //   }).on('line', function(line) {
                    //     console.log(line);
                    // });
                    // readline.createInterface({
                    //     input     : protonvpnRconnectRandom.stderr,
                    //     terminal  : false
                    //   }).on('line', function(line) {
                    //     console.log(line);
                    // });
                    
                    // protonvpnRconnectRandom.on('error', (error) => {
                    //     console.log(`error: ${error.message}`);
                    // });
                
                    protonvpnRconnectRandom.on('close', (code) => {
                        console.log(`child process exited with code ${code}\n, Let's continue scraping!!!`);
                        vpnReconnectCommandThreadActivate=false
                    });
                
                });
            }
        
          
    
        });

        console.log(`Page Loaded.... \n`)
        // await page.screenshot({
        //     path: 'scrnshot3.jpg'
        // })

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

    console.warn('Number of Articles = ,',articleObj.length)
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
