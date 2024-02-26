import { after, before, describe, test } from "node:test"
import { faker } from '@faker-js/faker'
import path from "node:path"
import fs from "node:fs"
import mockHttp from 'mock-http'
import assert from 'node:assert/strict'
import UploadController from "../../src/controllers/upload.controller";
import BadRequestError from "../../src/errors/bad-request.error"

describe('Upload - Unit', async () => {
  const env = process.env;

  before(() => {
    process.env = {
      ...env,
      AUTH_USER: faker.string.alphanumeric(10),
      AUTH_PASS: faker.string.alphanumeric(20),
      STORAGE_PATH: 'storage/test',
      STORAGE_MAX_SIZE: '5'
    }
  })

  after(() => {
    if (fs.existsSync(path.resolve('storage/test'))) {
      fs.rmSync(path.resolve('storage/test'), { recursive: true, force: true })
    }

    process.env = env;
  })

  /**
   * Success Upload
   */
  test("upload controller: upload", async () => {
    const authorization = 'Basic ' + Buffer.from(`${process.env.AUTH_USER}:${process.env.AUTH_PASS}`).toString('base64')
    const image = Buffer.from(path.resolve('./test/mock/image.jpg'), 'utf-8')

    const req = new mockHttp.Request({
      headers: {
        'authorization': authorization,
        'content-length': image.length,
        'content-type': 'multipart/form-data; boundary=--------------------------659543434561705972292758',
      }
    })

    req.push(`--------------------------659543434561705972292758\r\n`)
    req.push(`Content-Disposition: form-data; name="file"; filename="image.jpg"\r\n`)
    req.push(`Content-Type: image/jpeg\r\n\r\n`)
    req.push(image)
    req.push(`\r\n--------------------------659543434561705972292758--\r\n`)
    req.push(null)

    const controller = new UploadController
    const response = await controller.store(req)

    assert.strictEqual(JSON.stringify(response), JSON.stringify({
      data: {
        file: {
          path: process.env.STORAGE_PATH,
          name: response.data.file.name,
          type: 'image/jpeg',
          ext: 'jpg'
        },
      },
      meta: {}
    }))
  })

  /**
   * Error: Request content type header is required
   */
  test("upload controller: bad request error (empty content header)", async () => {
    try {
      const authorization = 'Basic ' + Buffer.from(`${process.env.AUTH_USER}:${process.env.AUTH_PASS}`).toString('base64')
      const req = new mockHttp.Request({
        headers: { 'authorization': authorization }
      })
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
      const authorization = 'Basic ' + Buffer.from(`${process.env.AUTH_USER}:${process.env.AUTH_PASS}`).toString('base64')
      const req = new mockHttp.Request({
        headers: { 'authorization': authorization, 'content-type': 'multipart/data' }
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
      const authorization = 'Basic ' + Buffer.from(`${process.env.AUTH_USER}:${process.env.AUTH_PASS}`).toString('base64')
      const req = new mockHttp.Request({
        headers: {
          'authorization': authorization,
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
      const authorization = 'Basic ' + Buffer.from(`${process.env.AUTH_USER}:${process.env.AUTH_PASS}`).toString('base64')
      const req = new mockHttp.Request({
        headers: {
          'authorization': authorization,
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
   * Error: Field input file is required
   */
  test("upload controller: error (wrong field name)", async () => {
    try {
      const authorization = 'Basic ' + Buffer.from(`${process.env.AUTH_USER}:${process.env.AUTH_PASS}`).toString('base64')
      const req = new mockHttp.Request({
        headers: {
          'authorization': authorization,
          'content-length': 1,
          'content-type': 'multipart/form-data; boundary=--------------------------659543434561705972292758',
        }
      })
      req.push(`--------------------------659543434561705972292758\r\n`)
      req.push(`Content-Disposition: form-data; name="upload"; filename="image.jpg"\r\n`)
      req.push(`\r\n--------------------------659543434561705972292758--\r\n`)
      const controller = new UploadController
      await controller.store(req)
    } catch (error) {
      assert.equal(error.message, 'Field input file is required')
    }
  })

  /**
   * Error: File extension type is invalid
   */
  test("upload controller: error (invalid file extension)", async () => {
    try {
      const authorization = 'Basic ' + Buffer.from(`${process.env.AUTH_USER}:${process.env.AUTH_PASS}`).toString('base64')
      const image = Buffer.from(path.resolve('./test/mock/index.html'), 'utf-8')
      const req = new mockHttp.Request({
        headers: {
          'authorization': authorization,
          'content-length': image.length,
          'content-type': 'multipart/form-data; boundary=--------------------------659543434561705972292758',
        }
      })
      req.push(`--------------------------659543434561705972292758\r\n`)
      req.push(`Content-Disposition: form-data; name="file"; filename="index.html"\r\n`)
      req.push(`Content-Type: text/html\r\n\r\n`)
      req.push(image)
      req.push(`\r\n--------------------------659543434561705972292758--\r\n`)
      req.push(null)
      const controller = new UploadController
      await controller.store(req)
    } catch (error) {
      assert.equal(error.message, 'File extension type is invalid')
    }
  })
})
