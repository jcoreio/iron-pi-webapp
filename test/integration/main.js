import superagent from 'superagent'

describe('webapp integration tests', function () {
  before(async function () {
    this.timeout(15 * 60000)

    try {
      await superagent.get(`${process.env.ROOT_URL}/__test__`)
    } catch (error) {
      throw new Error(`Make sure a server is running in test mode; ${error.message}`)
    }
  })

  beforeEach(async function () {
    // TODO: clear tables
  })

  require('./basicTests')
})


