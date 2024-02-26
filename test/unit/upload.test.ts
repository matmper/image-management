import { after, before, describe, test } from "node:test"
import { faker } from '@faker-js/faker'
import path from "node:path"
import fs from "node:fs"
import mockHttp from 'mock-http'
import assert from 'node:assert/strict'
import UploadController from "../../src/controllers/upload.controller";

describe('Pages - Unit', async () => {
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
          ext: 'jpg'
        },
      },
      meta: {}
    }))
  })
})
