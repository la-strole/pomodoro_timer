/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

const chai = require('chai')
const expect = chai.expect
const { Builder, By } = require('selenium-webdriver')
const { Options } = require('selenium-webdriver/firefox')

let driver
const webAppUrl = 'http://127.0.0.1:8080/pomodoro.html'

describe('CLIENT SIDE: INITIAL STATE', () => {
  before(async () => {
    const firefoxOptions = new Options()
    firefoxOptions.headless()
    driver = await new Builder().forBrowser('firefox').setFirefoxOptions(firefoxOptions).build()
  })

  it('1. When the Nginx server is running, test the client-side functionality by verifying that the title of the page is equal to "Pomodoro Timer".', async () => {
    // Navigate to the web application.
    await driver.manage().window().maximize()
    await driver.get(webAppUrl)

    // Perform assertions.
    const title = await driver.getTitle()
    expect(title).to.be.equal('Pomodoro timer')
  })

  it('2. Test the client-side timer initialization after confirmation from the off-canvas form.', async () => {
    // Arrange.
    const m = 3
    const bm = 11
    const lbm = 13
    const bAfter = 2
    const addBreaks = true
    await driver.sleep(1500)
    // Locate and populate elements on the web page.
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

    // Submit the form.
    await driver.findElement(By.id('confirm_button')).click()

    // Perform assertions.
    const timerInstance = await driver.executeScript('return window.current_timer')
    expect(timerInstance.timer_init.m).to.be.equal(m)
    expect(timerInstance.timer_init.pomo_session).to.be.equal(addBreaks)
    expect(timerInstance.timer_init.lb_m).to.be.equal(lbm)
    expect(timerInstance.timer_init.b_m).to.be.equal(bm)
    expect(timerInstance.timer_init.b_after).to.be.equal(bAfter)
  })
  it('3. The start button should be enabled, the pause button disabled, and the Pomodoro timer should have initial values.', async () => {
    // Perform assertions.
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
    // Quit the WebDriver once all tests are done.
    await driver.quit()
  })
})

describe('CLIENT-SIDE: Test the "start" button pipeline.', () => {
  before(async () => {
    const firefoxOptions = new Options()
    firefoxOptions.headless()
    driver = await new Builder().forBrowser('firefox').setFirefoxOptions(firefoxOptions).build()
    // Navigate to the web application.
    await driver.manage().window().maximize()
    await driver.get(webAppUrl)
    // Submit offcanvas initiate form.
    await driver.sleep(1500)
    await driver.findElement(By.id('confirm_button')).click()
  })

  it('1. Pressing the Start Button should initiate the timer in Pomodoro mode.', async () => {
    // Press the Start button.
    await driver.findElement(By.id('btn_stop')).click()

    // Assert timer is running in pomo mode.
    // Perform assertions.
    const timerInstance = await driver.executeScript('return window.current_timer')
    expect(timerInstance.timer_control.stop_flag).to.be.false
    expect(timerInstance.timer_control.pause_flag).to.be.false
    expect(timerInstance.timer_control.breaking_flag).to.be.true
    // Expect the timer to have the start property as a Date object.
    expect(timerInstance.timer_state.pomo_time_start).not.to.be.false
    expect(timerInstance.timer_state.pomo_time_end).to.be.false
    // Expect the buttons on the timer to be in the proper state.
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
    // Expect the timer and title inner text to change over time.
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

  it(`2. After ending the Pomodoro time, the number should be added to the Pomodoro session count, 
    a tree should be added to the garden, 
    and the timer should be in the breaking state.`, async () => {
    // Change the inner timer state to end the Pomodoro time.
    await driver.executeScript('window.current_timer.timer_state.minutes = 0')
    await driver.executeScript('window.current_timer.timer_state.seconds = 1')

    // Wait for 1 second to end the Pomodoro session.
    await driver.sleep(2500)
    const timerInstance = await driver.executeScript('return window.current_timer')
    // Assert timer is running in breaking mode.
    // Perform assertions.
    expect(timerInstance.timer_control.stop_flag).to.be.false
    expect(timerInstance.timer_control.pause_flag).to.be.false
    expect(timerInstance.timer_control.breaking_flag).to.be.false
    // Expect the timer to not have a start property as a Date object.
    expect(timerInstance.timer_state.pomo_time_start).to.be.false
    expect(timerInstance.timer_state.pomo_time_end).to.be.false
    expect(timerInstance.timer_history.length).to.be.equal(1)
    // Expect the buttons on the timer to be in the proper state.
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
    // Retrieve the garden and assert that there is one tree.
    const garden = await driver.findElement(By.id('garden'))
    const children = await garden.findElements(By.xpath('./*'))
    expect(children.length).to.be.equal(1)
  })
  it(`3. After ending the break time, the timer should be in the Pomodoro state, 
    and no additional Pomodoro sessions or trees should be added to the garden.`, async () => {
    // Change the inner timer state to end the break time.
    await driver.executeScript('window.current_timer.timer_state.minutes = 0')
    await driver.executeScript('window.current_timer.timer_state.seconds = 1')
    // Wait for 1 second to end the break time.
    await driver.sleep(1500)
    const timerInstance = await driver.executeScript('return window.current_timer')
    // Assert timer is running in pomo mode.
    // Perform assertions.
    expect(timerInstance.timer_control.stop_flag).to.be.false
    expect(timerInstance.timer_control.pause_flag).to.be.false
    expect(timerInstance.timer_control.breaking_flag).to.be.true
    // Expect the timer to have a start property as a Date object.
    expect(timerInstance.timer_state.pomo_time_start).not.to.be.false
    expect(timerInstance.timer_state.pomo_time_end).to.be.false
    expect(timerInstance.timer_history.length).to.be.equal(1)
    // Expect the buttons on the timer to be in the proper state.
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
    // Retrieve the garden and assert that there is one tree.
    const garden = await driver.findElement(By.id('garden'))
    const children = await garden.findElements(By.xpath('./*'))
    expect(children.length).to.be.equal(1)
  })
  after(async () => {
    // Quit the WebDriver once all tests are completed.
    await driver.quit()
  })
})
describe('CLIENT-SIDE: Press Stop during the Pomodoro session.', () => {
  before(async () => {
    const firefoxOptions = new Options()
    firefoxOptions.headless()
    driver = await new Builder().forBrowser('firefox').setFirefoxOptions(firefoxOptions).build()
    // Navigate to the web application.
    await driver.manage().window().maximize()
    await driver.get(webAppUrl)
    // Submit the off-canvas initiation form.
    await driver.sleep(1500)
    await driver.findElement(By.id('confirm_button')).click()
  })
  it(`1. After submitting the off-canvas initiation form, the application should be 
    in the initiate by Pomodoro session screen. 
    The Pomodoro session count should be set to 0, 
    and a tree should be added to the garden.`, async () => {
    // Run the Pomodoro timer.
    // Press the Start button.
    await driver.findElement(By.id('btn_stop')).click()
    await driver.sleep(500)
    // Press the Stop button.
    await driver.findElement(By.id('btn_stop')).click()
    const timerInstance = await driver.executeScript('return window.current_timer')
    // Assert timer is running in pomo mode.
    // Perform assertions.
    expect(timerInstance.timer_control.stop_flag).to.be.true
    expect(timerInstance.timer_control.pause_flag).to.be.false
    expect(timerInstance.timer_control.breaking_flag).to.be.true
    // Expect the timer to have a start property as a Date object.
    expect(timerInstance.timer_state.pomo_time_start).to.be.false
    expect(timerInstance.timer_state.pomo_time_end).to.be.false
    expect(timerInstance.timer_history.length).to.be.equal(1)
    // Expect the buttons on the timer to be in the proper state.
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
    // Retrieve the garden and assert that there is one tree.
    const garden = await driver.findElement(By.id('garden'))
    const children = await garden.findElements(By.xpath('./*'))
    expect(children.length).to.be.equal(1)
  })
  after(async () => {
    // Quit the WebDriver once all tests are completed.
    await driver.quit()
  })
})
describe('CLIENT-SIDE: Press Stop during the break time.', () => {
  before(async () => {
    const firefoxOptions = new Options()
    firefoxOptions.headless()
    driver = await new Builder().forBrowser('firefox').setFirefoxOptions(firefoxOptions).build()
    // Navigate to the web application.
    await driver.manage().window().maximize()
    await driver.get(webAppUrl)
    // Submit offcanvas initiate form.
    await driver.sleep(1500)
    await driver.findElement(By.id('confirm_button')).click()
  })
  it('1. Shuld be in initate by pomo session screen, set pomo in raw to 0, NOT add tree to the garden', async () => {
    // Run thr pomodoro timer.
    // Change the inner timer state to end the Pomodoro time.
    await driver.executeScript('window.current_timer.timer_state.minutes = 0')
    await driver.executeScript('window.current_timer.timer_state.seconds = 1')
    // Press the Start Button
    await driver.findElement(By.id('btn_stop')).click()
    // Wait for 1 second to end the Pomodoro time.
    await driver.sleep(1500)
    // Now, during the break time, press the Stop button.
    await driver.findElement(By.id('btn_stop')).click()
    const timerInstance = await driver.executeScript('return window.current_timer')
    // Assert timer is running in pomo mode.
    // Perform assertions.
    expect(timerInstance.timer_control.stop_flag).to.be.true
    expect(timerInstance.timer_control.pause_flag).to.be.false
    expect(timerInstance.timer_control.breaking_flag).to.be.true
    // Expect the timer to have a start property as a Date object.
    expect(timerInstance.timer_state.pomo_time_start).to.be.false
    expect(timerInstance.timer_state.pomo_time_end).to.be.false
    expect(timerInstance.timer_history.length).to.be.equal(1)
    // Expect the buttons on the timer to be in the proper state.
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
    // Retrieve the garden and assert that there is one tree.
    const garden = await driver.findElement(By.id('garden'))
    const children = await garden.findElements(By.xpath('./*'))
    expect(children.length).to.be.equal(1)
  })
  after(async () => {
    // Quit the WebDriver once all tests are completed.
    await driver.quit()
  })
})
describe('CLIENT-SIDE: Press Stop when the timer is paused during the Pomodoro session.', () => {
  before(async () => {
    const firefoxOptions = new Options()
    firefoxOptions.headless()
    driver = await new Builder().forBrowser('firefox').setFirefoxOptions(firefoxOptions).build()
    // Navigate to the web application.
    await driver.manage().window().maximize()
    await driver.get(webAppUrl)
    // Submit the offcanvas initiate form.
    await driver.sleep(1500)
    await driver.findElement(By.id('confirm_button')).click()
  })
  it('1. Shuld be in initate by pomo session screen, set pomo in raw to 0, add tree to the garden', async () => {
    // Run the Pomodoro timer.
    await driver.findElement(By.id('btn_stop')).click()
    // Pause the timer.
    await driver.findElement(By.id('btn_pause')).click()
    // Stop the timer.
    await driver.findElement(By.id('btn_stop')).click()

    const timerInstance = await driver.executeScript('return window.current_timer')
    // Assert timer is running in pomo mode.
    // Perform assertions.
    expect(timerInstance.timer_control.stop_flag).to.be.true
    expect(timerInstance.timer_control.pause_flag).to.be.false
    expect(timerInstance.timer_control.breaking_flag).to.be.true
    // Expect the timer to have a start property as a Date object.
    expect(timerInstance.timer_state.pomo_time_start).to.be.false
    expect(timerInstance.timer_state.pomo_time_end).to.be.false
    expect(timerInstance.timer_history.length).to.be.equal(1)
    // Expect the buttons on the timer to be in the proper state.
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
    // Retrieve the garden and assert that there is one tree.
    const garden = await driver.findElement(By.id('garden'))
    const children = await garden.findElements(By.xpath('./*'))
    expect(children.length).to.be.equal(1)
  })
  after(async () => {
    // Quit the WebDriver once all tests are completed.
    await driver.quit()
  })
})
describe('CLIENT-SIDE: Press Stop when the timer is paused during the break time.', () => {
  before(async () => {
    const firefoxOptions = new Options()
    firefoxOptions.headless()
    driver = await new Builder().forBrowser('firefox').setFirefoxOptions(firefoxOptions).build()
    // Navigate to the web application.
    await driver.manage().window().maximize()
    await driver.get(webAppUrl)
    // Submit the off-canvas initiation form.
    await driver.sleep(1500)
    await driver.findElement(By.id('confirm_button')).click()
  })
  it('1. Shuld be in initate by pomo session screen, set pomo in raw to 0, NOT add tree to the garden', async () => {
    // Run the Pomodoro timer.
    // Change the inner timer state to be at Pomodoro time.
    await driver.executeScript('window.current_timer.timer_state.minutes = 0')
    await driver.executeScript('window.current_timer.timer_state.seconds = 1')
    await driver.findElement(By.id('btn_stop')).click()
    await driver.sleep(1500)
    // Now, during the break time, pause the timer.
    await driver.findElement(By.id('btn_pause')).click()
    // Stop the timer.
    await driver.findElement(By.id('btn_stop')).click()

    const timerInstance = await driver.executeScript('return window.current_timer')
    // Assert that the timer is running in Pomodoro mode.
    // Perform assertions.
    expect(timerInstance.timer_control.stop_flag).to.be.true
    expect(timerInstance.timer_control.pause_flag).to.be.false
    expect(timerInstance.timer_control.breaking_flag).to.be.true
    // Expect the timer to have a start property as a Date object.
    expect(timerInstance.timer_state.pomo_time_start).to.be.false
    expect(timerInstance.timer_state.pomo_time_end).to.be.false
    expect(timerInstance.timer_history.length).to.be.equal(1)
    // Expect the buttons on the timer to be in the proper state.
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
    // Retrieve the garden and assert that there is one tree.
    const garden = await driver.findElement(By.id('garden'))
    const children = await garden.findElements(By.xpath('./*'))
    expect(children.length).to.be.equal(1)
  })
  after(async () => {
    // Quit the WebDriver once all tests are completed.
    await driver.quit()
  })
})
