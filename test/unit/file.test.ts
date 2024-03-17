import { describe, test, before, after } from "node:test"
import assert from 'node:assert/strict'
import mockHttp from 'mock-http'
import FileController from "../../src/controllers/file.controller"
import BadRequestError from "../../src/errors/bad-request.error"
import config from "../../src/config/config"
import Config from "../../src/helpers/config.helper"

describe('File - Unit', async () => {
  const cfg = JSON.parse(JSON.stringify(config))

  before(() => {
    Config.write('storage.default', 'local')
    Config.write('storage.options.local.path', 'test')
  })

  after(() => {
    Config.write('storage.default', cfg.storage.default)
    Config.write('storage.options.local.path',  cfg.storage.options.local.path)
  })

  /**
   * Success: Show
   */
  test("file controller: show", async () => {
    const req = new mockHttp.Request({
      url: 'test.com?key=mock/image.jpg&w=100&h=100'
    })

    const controller = new FileController
    const response = await controller.show(req)

    assert.strictEqual(337, response.data.length)
    assert.strictEqual(true, Buffer.isBuffer(response.data))
  })

  /**
   * Error: File not file, key is invalid
   */
  test("file controller: File not file (exception)", async () => {
    try {
      const req = new mockHttp.Request({url: 'test.com?key=error'})
      const controller = new FileController
      await controller.show(req)
    } catch (error) {
      assert.equal(error.name, BadRequestError.name)
    }
  })

  /**
   * Error: No query string found
   */
  test("file controller: No query string found (exception)", async () => {
    try {
      const req = new mockHttp.Request({url: 'test.com'})
      const controller = new FileController
      await controller.show(req)
    } catch (error) {
      assert.equal(error.name, BadRequestError.name)
      assert.equal(error.message, 'No query string found')
    }
  })

  /**
   * Error: Param "key" is required
   */
  test("file controller: Param key is required (exception)", async () => {
    try {
      const req = new mockHttp.Request({url: 'test.com?key='})
      const controller = new FileController
      await controller.show(req)
    } catch (error) {
      assert.equal(error.name, BadRequestError.name)
      assert.equal(error.message, 'Param "key" is required')
    }
  })

  /**
   * Error: Width must be greater than 0
   */
  test("file controller: Width must be greater (exception)", async () => {
    try {
      const req = new mockHttp.Request({url: 'test.com?key=test&w=0'})
      const controller = new FileController
      await controller.show(req)
    } catch (error) {
      assert.equal(error.name, BadRequestError.name)
      assert.equal(error.message, 'Width must be greater than 0')
    }
  })

  /**
   * Error: Height must be greater than 0
   */
  test("file controller: height must be greater (exception)", async () => {
    try {
      const req = new mockHttp.Request({url: 'test.com?key=test&h=0'})
      const controller = new FileController
      await controller.show(req)
    } catch (error) {
      assert.equal(error.name, BadRequestError.name)
      assert.equal(error.message, 'Height must be greater than 0')
    }
  })
})
