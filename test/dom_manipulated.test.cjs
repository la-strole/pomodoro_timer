/* eslint-disable no-undef */
const chai = require('chai')
const expect = chai.expect
const { Builder, By, Key } = require('selenium-webdriver')
const { Options } = require('selenium-webdriver/firefox')

describe('CLIENT-SIDE', () => {
  it('1. should test client-side functionality', async () => {
    // Import the CommonJS version of the selenium-webdriver/firefox module
    const firefoxOptions = new Options()
    firefoxOptions.headless()
    const driver = await new Builder().forBrowser('firefox').setFirefoxOptions(firefoxOptions).build()

    // Navigate to  web application
    await driver.get('localhost:80')

    // Perform assertions
    const title = await driver.getTitle()
    expect(title).to.be.equal('Pomodoro timer')
    // Quit the WebDriver once all tests are done
    await driver.quit()
  })
})
