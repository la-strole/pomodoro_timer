/* eslint-disable no-undef */
const chai = require('chai')
const expect = chai.expect
const { Builder, By, Key } = require('selenium-webdriver')
const { Options } = require('selenium-webdriver/firefox')

let driver

describe('CLIENT-SIDE INITIAL STATE', () => {
  before(async () => {
    const firefoxOptions = new Options()
    firefoxOptions.headless()
    driver = await new Builder().forBrowser('firefox').setFirefoxOptions(firefoxOptions).build()
  })

  it('1. should test client-side functionality if nginx server is run - check title of the page to be equal Pomodoro timer', async () => {
    // Navigate to  web application
    await driver.get('localhost:80')

    // Perform assertions
    const title = await driver.getTitle()
    expect(title).to.be.equal('Pomodoro timer')
  })

  it('2. should test client-side timer initialization after offcanvas form confirmation', async () => {
    // Arrange
    const m = 3
    const bm = 11
    const lbm = 13
    const bAfter = 2
    const addBreaks = true

    // Find and fill elements on web page
    const minutes = await driver.findElement(By.name('pomo_set_minutes'))
    await minutes.clear()
    await minutes.sendKeys(m)
    const brMinutes = await driver.findElement(By.name('br_set_minutes'))
    await brMinutes.clear()
    await brMinutes.sendKeys(bm)
    const lbrMinutes = await driver.findElement(By.name('lbr_set_minutes'))
    await lbrMinutes.clear()
    await lbrMinutes.sendKeys(lbm)
    const lbrAfter = await driver.findElement(By.name('lbr_after'))
    await lbrAfter.clear()
    await lbrAfter.sendKeys(bAfter)

    // Submit form
    await driver.findElement(By.id('confirm_button')).click()

    // Perform assertions
    const timerInstance = await driver.executeScript('return window.t')
    expect(timerInstance.timer_init.m).to.be.equal(m)
    expect(timerInstance.timer_init.pomo_session).to.be.equal(addBreaks)
    expect(timerInstance.timer_init.lb_m).to.be.equal(lbm)
    expect(timerInstance.timer_init.b_m).to.be.equal(bm)
    expect(timerInstance.timer_init.b_after).to.be.equal(bAfter)
  })
  it('3. should be start button enabled, pause button disabled, and pomo timer be equal initial values', async () => {
    // Perform assertions
    const startButton = await driver.findElement(By.id('btn_stop'))
    const pauseButton = await driver.findElement(By.id('btn_pause'))
    const timerMinute = await driver.findElement(By.id('minute'))
    const timerSecond = await driver.findElement(By.id('second'))

    startButton.isEnabled().then((enabled) => {
      expect(enabled).to.be.true
    })
    pauseButton.isEnabled().then((enabled) => {
      expect(enabled).to.be.false
    })
    startButton.getAttribute('value').then((value) => {
      expect(value).to.be.equal('start')
    })
    startButton.getText().then((inner) => {
      expect(inner).to.be.equal('Start')
    })
    pauseButton.getAttribute('value').then((value) => {
      expect(value).to.be.equal('pause')
    })
    pauseButton.getText().then((inner) => {
      expect(inner).to.be.equal('Pause')
    })
    timerMinute.getText().then((inner) => {
      expect(inner).to.be.equal(`0${m}:`)
    })
    timerSecond.getText().then((inner) => {
      expect(inner).to.be.equal('00')
    })
  })
  after(async () => {
    // Quit the WebDriver once all tests are done
    await driver.quit()
  })
})
