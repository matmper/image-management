import { IncomingMessage, OutgoingHttpHeader } from "http"
import fs from "node:fs"
import path from "node:path"
import sharp from "sharp"
import Config from "../helpers/config.helper"
import BadRequestError from "../errors/bad-request.error"
import ResponseDTO from "../types/response.dto"

export default class FileController {
  /**
   * Get, resize and crop image file
   * @param req
   * @returns Promise<ResponseDTO>
   */
  async show(req: IncomingMessage): Promise<ResponseDTO> {
    const params = await this.validate(req)

    const storagePath = Config.read('storage.options.local.path').toString()
    const pathResolved = path.resolve(`${storagePath}/${params.key}`)

    let getFile = null

    try {
      getFile = fs.readFileSync(pathResolved)
    } catch (error) {
      throw new BadRequestError(error.message)
    }

    const file = await sharp(getFile)
      .resize(params.width, params.height)
      .toBuffer()

    const headers = this.getHeaders(file, params.key)

    return { data: file, headers }
  }

  /**
   * Validate query params
   * @param req
   * @returns Promise<{key:string, width: number|null, height: number|null}>
   */
  private async validate(req: IncomingMessage): Promise<{
    key: string,
    width: number | null,
    height: number | null,
  }> {
    const queryString = req.url.split('?')

    if (queryString[1] === undefined) {
      throw new BadRequestError('No query string found')
    }

    const params = new URLSearchParams(queryString[1])

    let width = null
    let height = null

    if (!params.has('key') || params.get('key').length === 0) {
      throw new BadRequestError('Param "key" is required')
    }

    if (params.has('w')) {
      width = parseInt(params.get('w'))

      if (width <= 0) {
        throw new BadRequestError('Width must be greater than 0')
      }
    }

    if (params.has('h')) {
      height = parseInt(params.get('h'))

      if (height <= 0) {
        throw new BadRequestError('Height must be greater than 0')
      }
    }

    return { key: params.get('key'), width: width, height: height }
  }

  /**
   * Get response headers
   * @param file Buffer
   * @param key string
   * @returns OutgoingHttpHeader[]
   */
  private getHeaders(file: Buffer, key: string): OutgoingHttpHeader[] {
    let contentType = ''

    switch (key.split('.').pop().toLowerCase()) {
      case 'png':
        contentType = 'image/png'
        break;
      default:
        contentType = 'image/jpeg'
        break;
    }

    const headers: OutgoingHttpHeader = []

    headers.push('Content-Type', contentType)
    headers.push('Content-Length', file.length.toString())

    return headers
  }
}
