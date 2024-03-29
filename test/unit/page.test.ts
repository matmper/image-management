import { describe, test } from "node:test"
import assert from 'node:assert/strict'
import PageController from "../../src/controllers/page.controller";
import Config from "../../src/helpers/config.helper";

describe('Page - Unit', async () => {
  /**
   * Success: Index
   */
  test("page controller: index", async () => {
    const controller = new PageController
    const response = await controller.index()

    assert.strictEqual(JSON.stringify(response), JSON.stringify({
      data: {
        name: "image-management",
        version: Config.read('app.version').toString()
      }
    }))
  })

  /**
   * Success: Health Check
   */
  test("page controller: healthcheck", async () => {
    const controller = new PageController
    const response = await controller.healthcheck()

    assert.strictEqual(JSON.stringify(response), JSON.stringify({
      data: {
        success: true
      }
    }))
  })
})


