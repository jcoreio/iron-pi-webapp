/* global browser */

import {expect} from 'chai'
import {clearCollection} from "../../server-integration/util/clearCollection"
import navigateTo from '../util/navigateTo'
import login from '../util/login'
import delay from 'delay'
import drilldownTransitionsDone from "../util/drilldownTransitionsDone"

describe('CreatePlannedSite', () => {
  beforeEach(async () => {
    await clearCollection('plannedSitesConfigsJoin')
    await clearCollection('plannedSiteConfigs')
    await clearCollection('loadProfileUploads')
    await clearCollection('plannedSites')
    await clearCollection('sites')
  })

  it('is possible to create a planned site', async function () {
    this.timeout(60000 * 5)
    browser.timeouts('implicit', 2000)

    await navigateTo('/admin/sites')
    await login('admin', '@dmin123')

    await browser.click('=Add Planned Site')
    await drilldownTransitionsDone()

    await browser.setValue('[name="siteName"]', 'Pason HQ')
    await browser.setValue('[name="address"]', '7701 West Little York Rd, Houston, TX, United States')
    await browser.click('button[type="submit"]')

    await browser.waitForText('[name="country"]', 5000)
    expect((await browser.getText('[name="country"]')).trim()).to.equal('United States of America')
    expect(await browser.getValue('[name="zipCode"]')).to.equal('77040')

    await browser.click('[name="electricityProvider"]')
    await browser.click('li=Pacific Gas & Electric Co')
    await delay(500)

    await browser.click('[name="rateTariff"]')
    await browser.click('li=Residential Time-Of-Use Service E-7 (Basic)')
    await delay(500)

    await browser.click('button[type="submit"]')
    await drilldownTransitionsDone()

    await browser.chooseFile(
      'input[type="file"]',
      require.resolve('../../unit/server/methods/parseLoadProfile/data/a_test_load_greenbutton.csv')
    )
    await browser.setValue('[name="notes"]', 'asdf')
    await browser.click('button[type="submit"]')
    await drilldownTransitionsDone()

    await browser.waitForText('[name="dateTimeSource"]')
    expect(await browser.getText('[name="dateColumn"]')).to.equal('B - USAGE_DATE')
    expect(await browser.getText('[name="timeColumn"]')).to.equal('C - USAGE_START_TIME')
    expect(await browser.getText('[name="demandColumn"]')).to.equal('E - USAGE_KWH')
    expect(await browser.getText('[name="dateTimeSource"]')).to.equal('Separate columns for date and time')
    expect(await browser.getText('[name="powerUnits"]')).to.equal('Kilowatt-Hours')

    await browser.waitForText('[name="timezone"]', 5000)
    expect(await browser.getText('[name="timezone"]')).to.equal('Central Standard Time')

    await browser.waitForText('[data-test-name="processedData"]', 5000)
    expect(await browser.getText('[data-test-name="processedData"] tr:first-child > td')).to.deep.equal([
      '7/18/2016 12:00 AM',
      '10',
    ])
    expect(await browser.getText('[data-test-name="processedData"] tr:nth-child(2) > td')).to.deep.equal([
      '7/18/2016 12:15 AM',
      '20',
    ])

    await browser.click('button[type="submit"]')
    await drilldownTransitionsDone()

    await browser.setValue('[name="powerPerSystem"]', '5')
    await browser.setValue('[name="capacityPerSystem"]', '6')
    await browser.setValue('[name="costPerSystem"]', '7')
    await browser.setValue('[name="numSystems"]', '2')

    await browser.click('button[type="submit"]')
    await delay(500)

    await browser.waitForText('h1=Prospective Site: Pason HQ')
  })
})

