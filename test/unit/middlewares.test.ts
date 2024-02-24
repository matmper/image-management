import { afterEach, beforeEach, describe, mock, test } from "node:test"
import { faker } from '@faker-js/faker'
import mockHttp from 'mock-http'
import assert from 'node:assert/strict'
import BasicAuthMiddleware from "../../src/middleware/basic-auth.middleware"
import NotAuthorizedError from "../../src/errors/not-authorized.error"

describe('Middlewares - Unit', async () => {
  const env = process.env;

  beforeEach(() => {
    process.env = {
      ...env,
      AUTH_USER: faker.string.alphanumeric(10),
      AUTH_PASS: faker.string.alphanumeric(20)
    }
  })

  afterEach(() => {
    process.env = env;
    mock.reset()
  });

  test("basic auth middleware", async () => {
    const user = process.env.AUTH_USER
    const pass = process.env.AUTH_PASS

    const req = new mockHttp.Request({
      headers: {
        authorization: 'Basic ' + Buffer.from(`${user}:${pass}`).toString('base64')
      }
    })

    const middleware = new BasicAuthMiddleware
    await middleware.handle(req)

    assert.ok("Middleware Authenticated")
  })

  test("basic auth middleware - not authorized (empty header)", async () => {
    try {
      const req = new mockHttp.Request({
        headers: {}
      })

      const middleware = new BasicAuthMiddleware
      await middleware.handle(req)
    } catch (error) {
      assert.equal(error.name, NotAuthorizedError.name)
    }
  })

  test("basic auth middleware - not authorized (bearer type token)", async () => {
    try {
      const req = new mockHttp.Request({
        headers: {
          authorization: 'Bearer ' + faker.string.alphanumeric()
        }
      })

      const middleware = new BasicAuthMiddleware
      await middleware.handle(req)
    } catch (error) {
      assert.equal(error.name, NotAuthorizedError.name)
    }
  })

  test("basic auth middleware - not authorized (wrong user)", async () => {
    try {
      const user = faker.string.alphanumeric(5)
      const pass = process.env.AUTH_PASS

      const req = new mockHttp.Request({
        headers: {
          authorization: 'Basic ' + Buffer.from(`${user}:${pass}`).toString('base64')
        }
      })

      const middleware = new BasicAuthMiddleware
      await middleware.handle(req)
    } catch (error) {
      assert.equal(error.name, NotAuthorizedError.name)
    }
  })

  test("basic auth middleware - not authorized (wrong password)", async () => {
    try {
      const user = process.env.AUTH_USER
      const pass = faker.string.alphanumeric(5)

      const req = new mockHttp.Request({
        headers: {
          authorization: 'Basic ' + Buffer.from(`${user}:${pass}`).toString('base64')
        }
      })

      const middleware = new BasicAuthMiddleware
      await middleware.handle(req)
    } catch (error) {
      assert.equal(error.name, NotAuthorizedError.name)
    }
  })
})


