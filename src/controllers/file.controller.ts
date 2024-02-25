import { IncomingMessage } from "http"
import fs from "node:fs"
import path from "node:path"
import BasicAuthMiddleware from "../middleware/basic-auth.middleware"
import ResponseDTO from "../types/response.dto"

export default class FileController {
  /**
   * Get, resize and crop image file
   * @param req
   * @returns Promise<ResponseDTO>
   */
  async show(req: IncomingMessage): Promise<ResponseDTO> {
    const middleware = new BasicAuthMiddleware
    await middleware.handle(req)

    return { data: { message: "success" }, meta: {} }
  }

  /**
   * Upload a new file
   * @param req
   * @returns Promise<ResponseDTO>
   */
  async store(req: IncomingMessage): Promise<ResponseDTO> {
    const middleware = new BasicAuthMiddleware
    await middleware.handle(req)

    const contentTypeHeader = req.headers['content-type'].split(';')
    const boundary = contentTypeHeader[1].split('=')[1]
    const contentLength = parseInt(req.headers['content-length'])
    const maxFileSize = process.env.STORAGE_MAX_SIZE ? parseInt(process.env.STORAGE_MAX_SIZE) : 5 // Mb

    if (contentTypeHeader[0] !== 'multipart/form-data') {
      throw new Error('Content type is not valid')
    }

    if (isNaN(contentLength) || contentLength <= 0) {
      throw new Error('File not found')
    }

    if (contentLength > (1024 * 1024 * maxFileSize)) {
      throw new Error(`File size larger than ${maxFileSize}Mb`)
    }

    const file = await new Promise((resolve, reject) => {
      let filePath = path.resolve(process.env.STORAGE_PATH || 'storage')
      let fileName = ''
      let fileExt = ''

      let fileData = []

      req.on("data", (chunk) => {
        const boundaryIndex = chunk.indexOf(boundary);
        if (boundaryIndex !== -1) {
          const filenameMatch = /filename="([^"]+)"/.exec(chunk.toString());

          if (!filenameMatch) {
            reject('File data is invalid')
          }

          fileName = Math.floor(new Date().getTime() / 1000) + '-' + filenameMatch[1]
          fileExt = fileName.split('.').slice(-1).toString()

          fileData.push(chunk.slice(boundaryIndex + boundary.length + 4, -4))
        }
      })

      req.on("error", (error) => {
        reject(error.message)
      })

      req.on("end", () => {
        if (fileData.length <= 0) {
          reject('File content is empty')
        }

        fs.writeFileSync(`${filePath}/${fileName}`, Buffer.concat(fileData))

        resolve({
          path: filePath,
          name: fileName,
          extension: fileExt
        })
      })
    })

    return {
      data: {
        file: file
      },
      meta: {}
    }
  }
}
