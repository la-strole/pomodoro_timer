/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

const chai = require('chai')
const expect = chai.expect
const { Builder, By } = require('selenium-webdriver')
const { Options } = require('selenium-webdriver/firefox')

let driver
const webAppUrl = 'http://127.0.0.1:5500/pomodoro.html'

describe('CLIENT-SIDE INITIAL STATE', () => {
  before(async () => {
    const firefoxOptions = new Options()
    firefoxOptions.headless()
    driver = await new Builder().forBrowser('firefox').setFirefoxOptions(firefoxOptions).build()
  })

  it('1. should test client-side functionality if nginx server is run - check title of the page to be equal Pomodoro timer', async () => {
    // Navigate to  web application
    await driver.get(webAppUrl)

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
    const timerInstance = await driver.executeScript('return window.current_timer')
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

describe('CLIENT-SIDE test Press start Button pipeline', () => {
  before(async () => {
    const firefoxOptions = new Options()
    firefoxOptions.headless()
    driver = await new Builder().forBrowser('firefox').setFirefoxOptions(firefoxOptions).build()
    // Navigate to  web application
    await driver.get(webAppUrl)
    // Submit offcanvas initiate form
    await driver.findElement(By.id('confirm_button')).click()
  })

  it('1. Press Start Button should start timer in pomo mode', async () => {
    // Press Start Button
    await driver.findElement(By.id('btn_stop')).click()

    // Assert timer is running in pomo mode
    // Perform assertions
    const timerInstance = await driver.executeScript('return window.current_timer')
    expect(timerInstance.timer_control.stop_flag).to.be.false
    expect(timerInstance.timer_control.pause_flag).to.be.false
    expect(timerInstance.timer_control.breaking_flag).to.be.true
    // Expect timer has start property as Date object
    expect(timerInstance.timer_state.pomo_time_start).not.to.be.false
    expect(timerInstance.timer_state.pomo_time_end).to.be.false
    // Expect Buttons on timer to be in properly state
    const startButton = await driver.findElement(By.id('btn_stop'))
    const pauseButton = await driver.findElement(By.id('btn_pause'))
    const pomoInRawCount = await driver.findElement(By.id('row_pomo_number'))
    startButton.isEnabled().then((value) => {
      expect(value).to.be.true
    })
    startButton.getAttribute('value').then((value) => {
      expect(value).to.be.equal('stop')
    })
    startButton.getText().then((value) => {
      expect(value).to.be.equal('Stop')
    })
    pauseButton.getAttribute('value').then((value) => {
      expect(value).to.be.equal('pause')
    })
    pauseButton.getText().then((value) => {
      expect(value).to.be.equal('Pause')
    })
    pauseButton.isEnabled().then((value) => {
      expect(value).to.be.true
    })
    pomoInRawCount.getText().then((text) => {
      expect(text).to.be.equal('0 pomodoro in a row')
    })
    // Expect timer and title inner text is changed by time
    await driver.sleep(1000)
    const timerMinute = await driver.findElement(By.id('minute'))
    const timerSecond = await driver.findElement(By.id('second'))
    let minutes
    let seconds
    minutes = await timerMinute.getText()
    minutes = parseInt(minutes.slice(0, -1))
    seconds = await timerSecond.getText()
    seconds = parseInt(seconds)
    expect(timerInstance.timer_init.m * 60).to.be.greaterThan(minutes * 60 + seconds)
  })

  it(`2. After ending pomo time shuld add number to pomo session count,  
      add tree to garden and be in breaking state`, async () => {
    // Change inner timer state to end pomo time
    await driver.executeScript('window.current_timer.timer_state.minutes = 0')
    await driver.executeScript('window.current_timer.timer_state.seconds = 1')

    // Wait 1 second to end pomo
    await driver.sleep(2500)
    const timerInstance = await driver.executeScript('return window.current_timer')
    // Assert timer is running in breaking mode
    // Perform assertions
    expect(timerInstance.timer_control.stop_flag).to.be.false
    expect(timerInstance.timer_control.pause_flag).to.be.false
    expect(timerInstance.timer_control.breaking_flag).to.be.false
    // Expect timer has not start property as Date object
    expect(timerInstance.timer_state.pomo_time_start).to.be.false
    expect(timerInstance.timer_state.pomo_time_end).to.be.false
    expect(timerInstance.timer_history.length).to.be.equal(1)
    // Expect Buttons on timer to be in properly state
    const startButton = await driver.findElement(By.id('btn_stop'))
    const pauseButton = await driver.findElement(By.id('btn_pause'))
    const pomoInRawCount = await driver.findElement(By.id('row_pomo_number'))
    startButton.isEnabled().then((value) => {
      expect(value).to.be.true
    })
    startButton.getAttribute('value').then((value) => {
      expect(value).to.be.equal('stop')
    })
    startButton.getText().then((value) => {
      expect(value).to.be.equal('Stop')
    })
    pauseButton.getAttribute('value').then((value) => {
      expect(value).to.be.equal('pause')
    })
    pauseButton.getText().then((value) => {
      expect(value).to.be.equal('Pause')
    })
    pauseButton.isEnabled().then((value) => {
      expect(value).to.be.true
    })
    pomoInRawCount.getText().then((text) => {
      expect(text).to.be.equal('1 pomodoro in a row')
    })
    // Get garden and assert there are one tree
    const garden = await driver.findElement(By.id('garden'))
    const children = await garden.findElements(By.xpath('./*'))
    expect(children.length).to.be.equal(1)
  })
  it('3. After ending break time shuld be at pomo state, not add pomo in raw number or tree to the garden', async () => {
    // Change inner timer state to end breaking time
    await driver.executeScript('window.current_timer.timer_state.minutes = 0')
    await driver.executeScript('window.current_timer.timer_state.seconds = 1')
    // Wait 1 second to end breaking time
    await driver.sleep(1500)
    const timerInstance = await driver.executeScript('return window.current_timer')
    // Assert timer is running in pomo mode
    // Perform assertions
    expect(timerInstance.timer_control.stop_flag).to.be.false
    expect(timerInstance.timer_control.pause_flag).to.be.false
    expect(timerInstance.timer_control.breaking_flag).to.be.true
    // Expect timer has start property as Date object
    expect(timerInstance.timer_state.pomo_time_start).not.to.be.false
    expect(timerInstance.timer_state.pomo_time_end).to.be.false
    expect(timerInstance.timer_history.length).to.be.equal(1)
    // Expect Buttons on timer to be in properly state
    const startButton = await driver.findElement(By.id('btn_stop'))
    const pauseButton = await driver.findElement(By.id('btn_pause'))
    const pomoInRawCount = await driver.findElement(By.id('row_pomo_number'))
    startButton.isEnabled().then((value) => {
      expect(value).to.be.true
    })
    startButton.getAttribute('value').then((value) => {
      expect(value).to.be.equal('stop')
    })
    startButton.getText().then((value) => {
      expect(value).to.be.equal('Stop')
    })
    pauseButton.getAttribute('value').then((value) => {
      expect(value).to.be.equal('pause')
    })
    pauseButton.getText().then((value) => {
      expect(value).to.be.equal('Pause')
    })
    pauseButton.isEnabled().then((value) => {
      expect(value).to.be.true
    })
    pomoInRawCount.getText().then((text) => {
      expect(text).to.be.equal('1 pomodoro in a row')
    })
    // Get garden and assert there are one tree
    const garden = await driver.findElement(By.id('garden'))
    const children = await garden.findElements(By.xpath('./*'))
    expect(children.length).to.be.equal(1)
  })
  after(async () => {
    // Quit the WebDriver once all tests are done
    await driver.quit()
  })
})
describe('CLIENT-SIDE Press Stop in pomo time', () => {
  before(async () => {
    const firefoxOptions = new Options()
    firefoxOptions.headless()
    driver = await new Builder().forBrowser('firefox').setFirefoxOptions(firefoxOptions).build()
    // Navigate to  web application
    await driver.get(webAppUrl)
    // Submit offcanvas initiate form
    await driver.findElement(By.id('confirm_button')).click()
  })
  it('1. Shuld be in initate by pomo session screen, set pomo in raw to 0, add tree to the garden', async () => {
    // Run pomo timer
    // Press Start Button
    await driver.findElement(By.id('btn_stop')).click()
    await driver.sleep(500)
    // Press stop button
    await driver.findElement(By.id('btn_stop')).click()
    const timerInstance = await driver.executeScript('return window.current_timer')
    // Assert timer is running in pomo mode
    // Perform assertions
    expect(timerInstance.timer_control.stop_flag).to.be.true
    expect(timerInstance.timer_control.pause_flag).to.be.false
    expect(timerInstance.timer_control.breaking_flag).to.be.true
    // Expect timer has start property as Date object
    expect(timerInstance.timer_state.pomo_time_start).to.be.false
    expect(timerInstance.timer_state.pomo_time_end).to.be.false
    expect(timerInstance.timer_history.length).to.be.equal(1)
    // Expect Buttons on timer to be in properly state
    const startButton = await driver.findElement(By.id('btn_stop'))
    const pauseButton = await driver.findElement(By.id('btn_pause'))
    const pomoInRawCount = await driver.findElement(By.id('row_pomo_number'))
    startButton.isEnabled().then((value) => {
      expect(value).to.be.true
    })
    startButton.getAttribute('value').then((value) => {
      expect(value).to.be.equal('start')
    })
    startButton.getText().then((value) => {
      expect(value).to.be.equal('Start')
    })
    pauseButton.getAttribute('value').then((value) => {
      expect(value).to.be.equal('pause')
    })
    pauseButton.getText().then((value) => {
      expect(value).to.be.equal('Pause')
    })
    pauseButton.isEnabled().then((value) => {
      expect(value).to.be.false
    })
    pomoInRawCount.getText().then((text) => {
      expect(text).to.be.equal('0 pomodoro in a row')
    })
    // Get garden and assert there are one tree
    const garden = await driver.findElement(By.id('garden'))
    const children = await garden.findElements(By.xpath('./*'))
    expect(children.length).to.be.equal(1)
  })
  after(async () => {
    // Quit the WebDriver once all tests are done
    await driver.quit()
  })
})
describe('CLIENT-SIDE Press Stop in breaking time', () => {
  before(async () => {
    const firefoxOptions = new Options()
    firefoxOptions.headless()
    driver = await new Builder().forBrowser('firefox').setFirefoxOptions(firefoxOptions).build()
    // Navigate to  web application
    await driver.get(webAppUrl)
    // Submit offcanvas initiate form
    await driver.findElement(By.id('confirm_button')).click()
  })
  it('1. Shuld be in initate by pomo session screen, set pomo in raw to 0, NOT add tree to the garden', async () => {
    // Run pomo timer
    // Change inner timer state to end pomo time
    await driver.executeScript('window.current_timer.timer_state.minutes = 0')
    await driver.executeScript('window.current_timer.timer_state.seconds = 1')
    // Press Start Button
    await driver.findElement(By.id('btn_stop')).click()
    // Wait 1 second to end pomo time
    await driver.sleep(1500)
    // Now we are at breaking time - Press Stop Button
    await driver.findElement(By.id('btn_stop')).click()
    const timerInstance = await driver.executeScript('return window.current_timer')
    // Assert timer is running in pomo mode
    // Perform assertions
    expect(timerInstance.timer_control.stop_flag).to.be.true
    expect(timerInstance.timer_control.pause_flag).to.be.false
    expect(timerInstance.timer_control.breaking_flag).to.be.true
    // Expect timer has start property as Date object
    expect(timerInstance.timer_state.pomo_time_start).to.be.false
    expect(timerInstance.timer_state.pomo_time_end).to.be.false
    expect(timerInstance.timer_history.length).to.be.equal(1)
    // Expect Buttons on timer to be in properly state
    const startButton = await driver.findElement(By.id('btn_stop'))
    const pauseButton = await driver.findElement(By.id('btn_pause'))
    const pomoInRawCount = await driver.findElement(By.id('row_pomo_number'))
    startButton.isEnabled().then((value) => {
      expect(value).to.be.true
    })
    startButton.getAttribute('value').then((value) => {
      expect(value).to.be.equal('start')
    })
    startButton.getText().then((value) => {
      expect(value).to.be.equal('Start')
    })
    pauseButton.getAttribute('value').then((value) => {
      expect(value).to.be.equal('pause')
    })
    pauseButton.getText().then((value) => {
      expect(value).to.be.equal('Pause')
    })
    pauseButton.isEnabled().then((value) => {
      expect(value).to.be.false
    })
    pomoInRawCount.getText().then((text) => {
      expect(text).to.be.equal('0 pomodoro in a row')
    })
    // Get garden and assert there are one tree
    const garden = await driver.findElement(By.id('garden'))
    const children = await garden.findElements(By.xpath('./*'))
    expect(children.length).to.be.equal(1)
  })
  after(async () => {
    // Quit the WebDriver once all tests are done
    await driver.quit()
  })
})
describe('CLIENT-SIDE Press Stop than timer is paused during pomo session', () => {
  before(async () => {
    const firefoxOptions = new Options()
    firefoxOptions.headless()
    driver = await new Builder().forBrowser('firefox').setFirefoxOptions(firefoxOptions).build()
    // Navigate to  web application
    await driver.get(webAppUrl)
    // Submit offcanvas initiate form
    await driver.findElement(By.id('confirm_button')).click()
  })
  it('1. Shuld be in initate by pomo session screen, set pomo in raw to 0, add tree to the garden', async () => {
    // Run pomo timer
    await driver.findElement(By.id('btn_stop')).click()
    // Pause timer
    await driver.findElement(By.id('btn_pause')).click()
    // Stop timer
    await driver.findElement(By.id('btn_stop')).click()

    const timerInstance = await driver.executeScript('return window.current_timer')
    // Assert timer is running in pomo mode
    // Perform assertions
    expect(timerInstance.timer_control.stop_flag).to.be.true
    expect(timerInstance.timer_control.pause_flag).to.be.false
    expect(timerInstance.timer_control.breaking_flag).to.be.true
    // Expect timer has start property as Date object
    expect(timerInstance.timer_state.pomo_time_start).to.be.false
    expect(timerInstance.timer_state.pomo_time_end).to.be.false
    expect(timerInstance.timer_history.length).to.be.equal(1)
    // Expect Buttons on timer to be in properly state
    const startButton = await driver.findElement(By.id('btn_stop'))
    const pauseButton = await driver.findElement(By.id('btn_pause'))
    const pomoInRawCount = await driver.findElement(By.id('row_pomo_number'))
    startButton.isEnabled().then((value) => {
      expect(value).to.be.true
    })
    startButton.getAttribute('value').then((value) => {
      expect(value).to.be.equal('start')
    })
    startButton.getText().then((value) => {
      expect(value).to.be.equal('Start')
    })
    pauseButton.getAttribute('value').then((value) => {
      expect(value).to.be.equal('pause')
    })
    pauseButton.getText().then((value) => {
      expect(value).to.be.equal('Pause')
    })
    pauseButton.isEnabled().then((value) => {
      expect(value).to.be.false
    })
    pomoInRawCount.getText().then((text) => {
      expect(text).to.be.equal('0 pomodoro in a row')
    })
    // Get garden and assert there are one tree
    const garden = await driver.findElement(By.id('garden'))
    const children = await garden.findElements(By.xpath('./*'))
    expect(children.length).to.be.equal(1)
  })
  after(async () => {
    // Quit the WebDriver once all tests are done
    await driver.quit()
  })
})
describe('CLIENT-SIDE Press Stop than timer is paused during breaking time', () => {
  before(async () => {
    const firefoxOptions = new Options()
    firefoxOptions.headless()
    driver = await new Builder().forBrowser('firefox').setFirefoxOptions(firefoxOptions).build()
    // Navigate to  web application
    await driver.get(webAppUrl)
    // Submit offcanvas initiate form
    await driver.findElement(By.id('confirm_button')).click()
  })
  it('1. Shuld be in initate by pomo session screen, set pomo in raw to 0, NOT add tree to the garden', async () => {
    // Run pomo timer
    // Change inner timer state to be at pomo time
    await driver.executeScript('window.current_timer.timer_state.minutes = 0')
    await driver.executeScript('window.current_timer.timer_state.seconds = 1')
    await driver.findElement(By.id('btn_stop')).click()
    await driver.sleep(1500)
    // Now we are at breaking time - Pause timer
    await driver.findElement(By.id('btn_pause')).click()
    // Stop timer
    await driver.findElement(By.id('btn_stop')).click()

    const timerInstance = await driver.executeScript('return window.current_timer')
    // Assert timer is running in pomo mode
    // Perform assertions
    expect(timerInstance.timer_control.stop_flag).to.be.true
    expect(timerInstance.timer_control.pause_flag).to.be.false
    expect(timerInstance.timer_control.breaking_flag).to.be.true
    // Expect timer has start property as Date object
    expect(timerInstance.timer_state.pomo_time_start).to.be.false
    expect(timerInstance.timer_state.pomo_time_end).to.be.false
    expect(timerInstance.timer_history.length).to.be.equal(1)
    // Expect Buttons on timer to be in properly state
    const startButton = await driver.findElement(By.id('btn_stop'))
    const pauseButton = await driver.findElement(By.id('btn_pause'))
    const pomoInRawCount = await driver.findElement(By.id('row_pomo_number'))
    startButton.isEnabled().then((value) => {
      expect(value).to.be.true
    })
    startButton.getAttribute('value').then((value) => {
      expect(value).to.be.equal('start')
    })
    startButton.getText().then((value) => {
      expect(value).to.be.equal('Start')
    })
    pauseButton.getAttribute('value').then((value) => {
      expect(value).to.be.equal('pause')
    })
    pauseButton.getText().then((value) => {
      expect(value).to.be.equal('Pause')
    })
    pauseButton.isEnabled().then((value) => {
      expect(value).to.be.false
    })
    pomoInRawCount.getText().then((text) => {
      expect(text).to.be.equal('0 pomodoro in a row')
    })
    // Get garden and assert there are one tree
    const garden = await driver.findElement(By.id('garden'))
    const children = await garden.findElements(By.xpath('./*'))
    expect(children.length).to.be.equal(1)
  })
  after(async () => {
    // Quit the WebDriver once all tests are done
    await driver.quit()
  })
})
