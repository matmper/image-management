import { IncomingMessage } from "http"
import fs from "node:fs"
import path from "node:path"
import BasicAuthMiddleware from "../middleware/basic-auth.middleware"
import ResponseDTO from "../types/response.dto"
import BadRequestError from "../errors/bad-request.error"

export default class UploadController {
  /**
   * Upload a new file
   * @param req
   * @returns Promise<ResponseDTO>
   */
  async store(req: IncomingMessage): Promise<ResponseDTO> {
    const middleware = new BasicAuthMiddleware
    await middleware.handle(req)

    if (req.headers['content-type'] === undefined) {
      throw new BadRequestError('Request content type header is required')
    }

    const contentType = req.headers['content-type'].split(';')[0]
    const contentLength = parseInt(req.headers['content-length'])
    const maxFileSize = process.env.STORAGE_MAX_SIZE ? parseInt(process.env.STORAGE_MAX_SIZE) : 5 // Mb

    if (contentType !== 'multipart/form-data') {
      throw new BadRequestError('Request content type is not valid')
    }

    if (isNaN(contentLength) || contentLength <= 0) {
      throw new BadRequestError('File not found')
    }

    if (contentLength > (1024 * 1024 * maxFileSize)) {
      throw new BadRequestError(`File size larger than allowed`)
    }

    return await new Promise((resolve, reject) => {
      let fileData = ''

      req.on("data", (chunk) => {
        fileData += chunk
      })

      req.on("end", () => {
        const fieldStartIndex = fileData.indexOf('name="') + 'name="'.length
        const fieldEndIndex = fileData.indexOf('"', fieldStartIndex)
        const fieldName = fileData.substring(fieldStartIndex, fieldEndIndex)

        if (fieldName !== 'file') {
          return reject('Field input file is required')
        }

        const typeStartIndex = fileData.indexOf('Content-Type: ') + 'Content-Type: '.length
        const typeEndIndex = fileData.indexOf('\r', typeStartIndex)
        const fileType = fileData.substring(typeStartIndex, typeEndIndex)

        if (!['image/jpeg', 'image/png'].includes(fileType)) {
          return reject('File extension type is invalid')
        }

        const nameStartIndex = fileData.indexOf('filename="') + 'filename="'.length
        const nameEndIndex = fileData.indexOf('"', nameStartIndex)
        const originalName = fileData.substring(nameStartIndex, nameEndIndex)

        const filePath = process.env.STORAGE_PATH || 'storage'
        const filePathResolved = path.resolve(filePath)
        const fileName = Math.floor(new Date().getTime() / 1000) + '-' + originalName
        const fileExt = fileName.split('.').pop().toLocaleLowerCase()

        const fileDataStart = fileData.indexOf('\r\n\r\n') + '\r\n\r\n'.length;
        const decodedFileData = Buffer.from(fileData.substring(fileDataStart), 'binary');

        if (!fs.existsSync(path.resolve(filePathResolved))) {
          fs.mkdirSync(path.resolve(filePathResolved), { recursive: true });
        }

        fs.writeFile(`${filePathResolved}/${fileName}`, decodedFileData, (err) => {
          if (err) {
            reject(err.message)
          } else {
            resolve({
              path: filePath,
              name: fileName,
              type: fileType,
              ext: fileExt
            })
          }
        })
      })

      req.on("error", (err) => {
        return reject(err.message)
      })
    })
      .then((file) => {
        return {
          data: { file },
          meta: {}
        }
      })
      .catch((err) => {
        throw new Error(err)
      })
  }
}
