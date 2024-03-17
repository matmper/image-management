import { after, before, describe, test } from "node:test"
import { faker } from '@faker-js/faker'
import path from "node:path"
import fs from "node:fs"
import mockHttp from 'mock-http'
import assert from 'node:assert/strict'
import UploadController from "../../src/controllers/upload.controller";
import BadRequestError from "../../src/errors/bad-request.error"
import config from "../../src/config/config"
import Config from "../../src/helpers/config.helper"

describe('Upload - Unit', async () => {
  const cfg = JSON.parse(JSON.stringify(config))

  before(() => {
    Config.write('storage.default', 'local')
    Config.write('storage.options.local.path', 'storage/test')
  })

  after(() => {
    if (fs.existsSync(path.resolve('storage/test'))) {
      fs.rmSync(path.resolve('storage/test'), { recursive: true, force: true })
    }

    Config.write('storage.default', cfg.storage.default)
    Config.write('storage.options.local.path',  cfg.storage.options.local.path)
  })

  /**
   * Success Upload
   */
  test("upload controller: upload", async () => {
   const image = Buffer.from(path.resolve('./test/mock/image.jpg'), 'utf-8')
   const pathMock = faker.string.alphanumeric(10)

    const req = new mockHttp.Request({
      headers: {
        'content-length': image.length,
        'content-type': 'multipart/form-data; boundary=--------------------------203034927071618440094846',
      }
    })

    req.push(`----------------------------203034927071618440094846\r\n`)
    req.push(`Content-Disposition: form-data; name="file"; filename="image.jpg"\r\n`)
    req.push(`Content-Type: image/jpeg\r\n\r\n`)
    req.push(`${image}\r\n`)
    req.push(`----------------------------203034927071618440094846\r\n`)
    req.push(`Content-Disposition: form-data; name="path"\r\n\r\n`)
    req.push(`${pathMock}\r\n`)
    req.push(`----------------------------203034927071618440094846--\r\n`)
    req.push(null)


    const controller = new UploadController
    const response = await controller.store(req)

    assert.strictEqual(JSON.stringify(response), JSON.stringify({
      data: {
        file: {
          key: response.data.file.key,
        },
      }
    }))
  })

  /**
   * Error: Request content type header is required
   */
  test("upload controller: bad request error (empty content header)", async () => {
    try {
      const req = new mockHttp.Request({})
      const controller = new UploadController
      await controller.store(req)
    } catch (error) {
      assert.equal(error.name, BadRequestError.name)
      assert.equal(error.message, 'Request content type header is required')
    }
  })

  /**
   * Error: Request content type is not valid
   */
  test("upload controller: bad request error (invalid content type)", async () => {
    try {
      const req = new mockHttp.Request({
        headers: { 'content-type': 'multipart/data' }
      })
      const controller = new UploadController
      await controller.store(req)
    } catch (error) {
      assert.equal(error.name, BadRequestError.name)
      assert.equal(error.message, 'Request content type is not valid')
    }
  })

  /**
   * Error: File not found
   */
  test("upload controller: bad request error (empty content length)", async () => {
    try {
      const req = new mockHttp.Request({
        headers: {
          'content-length': 0,
          'content-type': 'multipart/form-data;',
        }
      })
      const controller = new UploadController
      await controller.store(req)
    } catch (error) {
      assert.equal(error.name, BadRequestError.name)
      assert.equal(error.message, 'File not found')
    }
  })

  /**
   * Error: File size larger than allowed
   */
  test("upload controller: bad request error (empty content length)", async () => {
    try {
      const req = new mockHttp.Request({
        headers: {
          'content-length': 6 * 1024 * 1024,
          'content-type': 'multipart/form-data;',
        }
      })
      const controller = new UploadController
      await controller.store(req)
    } catch (error) {
      assert.equal(error.name, BadRequestError.name)
      assert.equal(error.message, `File size larger than allowed`)
    }
  })

  /**
   * Error: File extension type is invalid
   */
  test("upload controller: error (invalid file extension)", async () => {
    try {
      const html = Buffer.from(path.resolve('./test/mock/index.html'), 'utf-8')
      const pathMock = faker.string.alphanumeric(10)

      const req = new mockHttp.Request({
        headers: {
          'content-length': html.length,
          'content-type': 'multipart/form-data; boundary=--------------------------203034927071618440094846',
        }
      })

      req.push(`----------------------------203034927071618440094846\r\n`)
      req.push(`Content-Disposition: form-data; name="file"; filename="index.html"\r\n`)
      req.push(`Content-Type: text/html\r\n\r\n`)
      req.push(`${html}\r\n`)
      req.push(`----------------------------203034927071618440094846\r\n`)
      req.push(`Content-Disposition: form-data; name="path"\r\n\r\n`)
      req.push(`${pathMock}\r\n`)
      req.push(`----------------------------203034927071618440094846--\r\n`)
      req.push(null)

      const controller = new UploadController
      await controller.store(req)
    } catch (error) {
      assert.equal(error.message, 'File extension type is invalid')
    }
  })
})
