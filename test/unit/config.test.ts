import { after, before, describe, test } from "node:test"
import { faker } from '@faker-js/faker'
import assert from 'node:assert/strict'
import Config from "../../src/helpers/config.helper"
import config from "../../src/config/config"

describe('Config Helper - Unit', async () => {
  const cfg = JSON.parse(JSON.stringify(config))

  before(() => {
    Config.write('app.env', 'testing')
  })

  after(() => {
    Config.write('app.env', cfg.app.env)
  });

  /**
   * Read: Success
   */
  test("Config Helper: read", async () => {
    const env = Config.read('app.env');
    assert.equal(env, 'testing')
  })

  /**
   * Read: Undefined
   */
  test("Config Helper: undefined", async () => {
    const value = Config.read('app.undefined');
    assert.equal(value, undefined)
  })

  /**
   * Write: Success
   */
  test("Config Helper: write", async () => {
    const newEnv = faker.string.alphanumeric(10)

    Config.write('app.env', newEnv)

    const env = Config.read('app.env')

    assert.equal(newEnv, env)
  })
})
