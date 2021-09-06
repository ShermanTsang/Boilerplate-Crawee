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

const elementClass = {
    twitterEnterLoginBtn: '.btn-twitter',
    twitterUsernameOrEmail: '#username_or_email',
    twitterPassword: '#password',
    twitterSubmitLoginBtn: '#allow',
    submitGetInvitationCodeBtn: 'input[type="submit"]',
    leftCodeNum: 'span[class="text-danger"]',
}

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

puppeteer.launch(options).then(async browser => {
    const page = await browser.newPage()
    await page.goto('https://onboarding.nine-chronicles.com/')
    writeLog('页面跳转', '进入 nine-chronicles 抢激活码页面')

    // await page.setViewport({width: 1920, height: 1080});

    writeLog('任务事件', '服务启动')

    await page.waitForSelector(elementClass.twitterEnterLoginBtn)
    await Promise.all([
        page.waitForNavigation(),
        page.$eval(elementClass.twitterEnterLoginBtn, element => element.click())
    ])
    writeLog('页面跳转', '进入 Twitter OAuth 登录页面')
    writeLog('模拟操作', '点击 Twitter 登录按钮')

    await page.waitForSelector(elementClass.twitterUsernameOrEmail)
    await page.type(elementClass.twitterUsernameOrEmail, config.twitterUsernameOrEmail, {delay: 100})
    writeLog('模拟操作', '输入 Twitter 登录账号')

    await page.waitForSelector(elementClass.twitterPassword)
    await page.type(elementClass.twitterPassword, config.twitterPassword, {delay: 300})
    writeLog('模拟操作', '输入 Twitter 登录密码')

    await page.waitForSelector(elementClass.twitterPassword)
    await Promise.all([
        page.waitForNavigation(),
        page.$eval(elementClass.twitterSubmitLoginBtn, element => element.click())
    ])
    writeLog('模拟操作', '点击 Twitter 登录按钮')

    writeLog('页面跳转', '回到 nine-chronicles 抢激活码页面')

    await page.waitForSelector(elementClass.leftCodeNum)
    const leftCodeNum = Number.parseInt(await page.$eval(elementClass.leftCodeNum, element => element.innerText))
    writeLog('数据捕获', '检测当前激活码显示数量 ' + leftCodeNum)

    while (leftCodeNum === 0) {
        await page.waitForSelector(elementClass.submitGetInvitationCodeBtn)
        await Promise.all([
            page.waitForNavigation(),
            page.$eval(elementClass.submitGetInvitationCodeBtn, element => element.click())
        ])
        writeLog('模拟操作', '点击获取激活码按钮')
        writeLog('操作结果', '当前未获取到，即将继续点击')
    }

    writeLog('操作结果', '当前获取到激活码或出现异常，请人工查看账号')

    // await browser.close();
})