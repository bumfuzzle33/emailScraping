const puppeteer = require('puppeteer-extra') 
const fs = require('fs').promises
const performance = require('execution-time')()
const { Cluster } = require('puppeteer-cluster')
const child_process = require("child_process")
const readline = require("readline")


//at beggining of code
performance.start()

const maxThreads = 4


// add stealth plugin and use defaults (all evasion techniques) 
const StealthPlugin = require('puppeteer-extra-plugin-stealth') 
puppeteer.use(StealthPlugin()) 
 
const {executablePath} = require('puppeteer') 


async function scrapeMails(){
    const articlesJSON = await fs.readFile('./articles.txt', 'utf8')
    const articleObj = JSON.parse(articlesJSON)

    let improvisedArticleObj = []

    for (let i = 0; i<articleObj.length; i++){
        let i_nstant_url = articleObj[i].url
        if(i_nstant_url.slice(0,4) == 'http' ){
            improvisedArticleObj.push({
                url: articleObj[i].url,
                title: articleObj[i].title
            })
        }
    }

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

            // if(vpnReconnectCommandThreadActivate == false){
            //     console.log("\n\n PROTONVPN RECCONNECT PROCESS STARTED \n\n")
            //     vpnReconnectCommandThreadActivate = true
            //     const protonvpnDisconnect = child_process.spawn("protonvpn-cli", ["d"])

            //     protonvpnDisconnect.on("close", code => {
            //         console.log(`child process exited with code ${code}\n vpn disconnect phase done!`);
            //         const protonvpnRconnectRandom = child_process.spawn("protonvpn-cli", ["c","-r"])
                
            //         protonvpnRconnectRandom.on('close', (code) => {
            //             console.log(`child process exited with code ${code}\n, Let's continue scraping!!!`);
            //             vpnReconnectCommandThreadActivate=false
            //         });
                
            //     });
            // }
        });

        console.log(`Page Loaded.... \n`)
    //     // await page.screenshot({
    //     //     path: 'scrnshot3.jpg'
    //     // })

        const grabEmails = await page.evaluate(() => {
           
            let results = []
            let mailtoElements = document.querySelectorAll('a[href^="mailto:"]')
            mailtoElements.forEach((mailElement) => {
                results.push({
                    email: mailElement.getAttribute('href').slice(7)
                })

            })

            return results

        })
        let emailSubArray = grabEmails
        console.log(emailSubArray)

        emailSubArray.forEach((emailObj,index)=>{
            fs.appendFile('./ajol_ateneo_edu_jmgs', `${emailObj.email}\n`, 'utf8', (err)=>{
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

    console.warn('Number of Articles = ,',improvisedArticleObj.length)

    for (let i = 0; i < improvisedArticleObj.length; i++){
        console.log(`${i+1} article(s) of ${improvisedArticleObj.length} articles processing...\n`)
        await cluster.queue({
            url: improvisedArticleObj[i].url,
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

