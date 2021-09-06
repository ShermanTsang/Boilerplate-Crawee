const fs = require('fs')
const puppeteer = require('puppeteer')
const config = require('./config')

const user_agent = '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.183 Safari/537.36'
const options = {
    ignoreHTTPSErrors: true,
    headless: false,
    defaultViewport: null,
    args: ['--no-sandbox', user_agent],
    slowMo: 1,
}

const baseUrl = 'https://etherscan.io/token/'
const iterator = config[Symbol.iterator]()

function writeLog(eventText, string) {
    const fileName = 'log.txt'
    const date = new Date()
    const text = `[ ${date.toLocaleDateString()} ${date.toLocaleTimeString()} ] [ ${eventText} ] ${string}\n`
    console.log(text)
    fs.appendFileSync(fileName, text, function (err) {
        if (err) {
            return console.error(err)
        }
    })
}

function writeResult({coinName, token, decimals, officialSite}) {
    const fileName = 'result.txt'
    const resultItem = `{ coinName:'${coinName}', token:'${token}', decimals:'${decimals}', officialSite:'${officialSite}' },\n`
    fs.appendFileSync(fileName, resultItem, function (err) {
        if (err) {
            return console.error(err)
        }
    })
}

const elementSelectors = {
    decimals: '#ContentPlaceHolder1_trDecimals > div > div.col-md-8',
    officialSite: '#ContentPlaceHolder1_tr_officialsite_1 > div > div.col-md-8'
}

puppeteer.launch(options).then(async browser => {
    writeLog('任务启动', '开始检查爬取队列')

    let nextItem = iterator.next()
    const page = await browser.newPage()
    while (!nextItem.done) {
        await page.goto(`${baseUrl}${nextItem.value.token}`)
        writeLog('进入页面', `开始爬取${nextItem.value.coinName}数据`)

        try {
            await page.waitForSelector(elementSelectors.decimals)
            nextItem.value.decimals = await page.$eval(elementSelectors.decimals, element => element.innerText)
        } catch {
            nextItem.value.decimals = null
        }

        try {
            await page.waitForSelector(elementSelectors.officialSite)
            nextItem.value.officialSite = await page.$eval(elementSelectors.officialSite, element => element.innerText)
        } catch {
            nextItem.value.officialSite = null
        }

        writeLog('获取数据', `${nextItem.value.coinName} | decimal:${nextItem.value.decimals} | officialSite:${nextItem.value.officialSite}`)
        writeResult(nextItem.value)

        nextItem = iterator.next()
        await page.waitForTimeout((10 + Math.round(Math.random() * 10)) * 1000)
    }

    writeLog('任务结束', '停止爬取')
})