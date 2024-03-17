import { after, before, describe, test } from "node:test"
import { faker } from '@faker-js/faker'
import mockHttp from 'mock-http'
import assert from 'node:assert/strict'
import BasicAuthMiddleware from "../../src/middleware/basic-auth.middleware"
import NotAuthorizedError from "../../src/errors/not-authorized.error"
import config from "../../src/config/config"
import Config from "../../src/helpers/config.helper"

describe('Middlewares - Unit', async () => {
  const cfg = JSON.parse(JSON.stringify(config))

  before(() => {
    Config.write('auth.user', faker.string.alphanumeric(10))
    Config.write('auth.pass', faker.string.alphanumeric(20))
  })

  after(() => {
    Config.write('auth.user', cfg.auth.user)
    Config.write('auth.pass', cfg.auth.pass)
  });

  /**
   * Success
   */
  test("basic auth middleware", async () => {
    const user = Config.read('auth.user')
    const pass = Config.read('auth.pass')

    const req = new mockHttp.Request({
      headers: {
        authorization: 'Basic ' + Buffer.from(`${user}:${pass}`).toString('base64')
      }
    })

    await BasicAuthMiddleware.handle(req)

    assert.ok("Middleware Authenticated")
  })

  /**
   * Error: Empty authorizarion header
   */
  test("basic auth middleware - not authorized (empty header)", async () => {
    try {
      const req = new mockHttp.Request({
        headers: {}
      })

      await BasicAuthMiddleware.handle(req)
    } catch (error) {
      assert.equal(error.name, NotAuthorizedError.name)
    }
  })

  /**
   * Error: Invalid authorization header content
   */
  test("basic auth middleware - not authorized (bearer type token)", async () => {
    try {
      const req = new mockHttp.Request({
        headers: {
          authorization: 'Bearer ' + faker.string.alphanumeric()
        }
      })

      await BasicAuthMiddleware.handle(req)
    } catch (error) {
      assert.equal(error.name, NotAuthorizedError.name)
    }
  })

  /**
   * Error: Invalid user
   */
  test("basic auth middleware - not authorized (wrong user)", async () => {
    try {
      const user = faker.string.alphanumeric(5)
      const pass = Config.read('auth.pass')

      const req = new mockHttp.Request({
        headers: {
          authorization: 'Basic ' + Buffer.from(`${user}:${pass}`).toString('base64')
        }
      })

      await BasicAuthMiddleware.handle(req)
    } catch (error) {
      assert.equal(error.name, NotAuthorizedError.name)
    }
  })

  /**
   * Error: Invalid password
   */
  test("basic auth middleware - not authorized (wrong password)", async () => {
    try {
      const user = Config.read('auth.user')
      const pass = faker.string.alphanumeric(5)

      const req = new mockHttp.Request({
        headers: {
          authorization: 'Basic ' + Buffer.from(`${user}:${pass}`).toString('base64')
        }
      })

      await BasicAuthMiddleware.handle(req)
    } catch (error) {
      assert.equal(error.name, NotAuthorizedError.name)
    }
  })
})


