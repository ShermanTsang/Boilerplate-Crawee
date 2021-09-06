const puppeteer = require('puppeteer')

const user_agent = '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.183 Safari/537.36'
const options = {
    //当为true时，客户端不会打开，使用无头模式；为false时，可打开浏览器界面
    headless: false,
    args: ['--no-sandbox', user_agent]
}

puppeteer.launch(options).then(async browser => {
    const page = await browser.newPage()
    await page.goto('https://app.1inch.io/#/1/classic/swap/ETH/DAI')
    const element = '#mat-tab-content-1-0 > div > app-alternatives-preview > div > div > div.table-amount.table-amount-number.current-color'
    await page.waitForSelector(element)
    // await page.setViewport({width:1920, height:1080});
    const test = await page.$$eval(element,items => {
        return items.map(e => {
            return e.innerText
        })
    })
    console.log(test)
    // await page.screenshot({
    //   path: 'screen.png',
    //   type: 'png',
    //   // quality: 100, 只对jpg有效
    //   fullPage: true,
    //   // 指定区域截图，clip和fullPage两者只能设置一个
    //   // clip: {
    //   //   x: 0,
    //   //   y: 0,
    //   //   width: 1000,
    //   //   height: 40
    //   // }
    // });
    // await browser.close();
})