import { describe, test } from "node:test"
import { faker } from '@faker-js/faker'
import assert from 'node:assert/strict'
import Utils from "../../src/helpers/utils.helper"

describe('Utils Helper - Unit', async () => {
  /**
   * Success
   */
  test("Utils Helper: substring", async () => {
    const content = faker.string.alphanumeric(12)
    const str = '(' + content + ')'
    const res = Utils.substring(str, '(', ')')

    assert.equal(res, content)
  })
})


