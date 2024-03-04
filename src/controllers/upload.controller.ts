import { IncomingMessage } from "http"
import fs from "node:fs"
import path from "node:path"
import ResponseDTO from "../types/response.dto"
import BadRequestError from "../errors/bad-request.error"
import Utils from "../helpers/utils.helper"
import Config from "../helpers/config.helper"
import FileDataDTO from "../types/filedata.dto"

export default class UploadController {
  /**
   * Upload a new file
   * @param req
   * @returns Promise<ResponseDTO>
   */
  async store(req: IncomingMessage): Promise<ResponseDTO> {
    await this.validate(req)

    return await new Promise((resolve, reject) => {
      let fileChunk = ''

      req.on("data", (chunk) => {
        fileChunk += chunk
      })

      req.on("end", async () => {
        try {
          const filedata = await this.getFileData(fileChunk)
          const file = await this.upload(filedata.buffer, filedata.data)
          resolve(file)
        } catch (error) {
          reject(error.message)
        }
      })

      req.on("error", (err) => {
        reject(err.message)
      })
    })
    .then((file) => {
      return { data: { file }, meta: { } }
    })
    .catch((err) => {
      throw new Error(err)
    })
  }

  /**
   * Validate request header and params
   * @param req IncomingMessage
   */
  private async validate(req: IncomingMessage): Promise<void>
  {
    if (req.headers['content-type'] === undefined) {
      throw new BadRequestError('Request content type header is required')
    }

    const contentType = req.headers['content-type'].split(';')[0]
    const contentLength = parseInt(req.headers['content-length'])
    const maxFileSize = parseInt(Config.read('storage.max_size').toString())

    if (contentType !== 'multipart/form-data') {
      throw new BadRequestError('Request content type is not valid')
    }

    if (isNaN(contentLength) || contentLength <= 0) {
      throw new BadRequestError('File not found')
    }

    if (contentLength > (1024 * 1024 * maxFileSize)) {
      throw new BadRequestError(`File size larger than allowed`)
    }
  }

  /**
   * Get file data and params
   * @param fileChunk
   */
  private async getFileData(fileChunk: string): Promise<{
    buffer: Buffer,
    data: FileDataDTO
  }> {
    const fileType =  Utils.substring(fileChunk, 'Content-Type: ', '\r')
    const originalName = Utils.substring(fileChunk, 'filename="', '"')

    if (!['image/jpeg', 'image/png'].includes(fileType)) {
      throw new Error('File extension type is invalid')
    }

    const filePath = Config.read('storage.options.local.path').toString()
    const fileName = Math.floor(new Date().getTime()/1000) + '-' + originalName
    const fileExt = fileName.split('.').pop().toLocaleLowerCase()

    const fileChunkStart = fileChunk.indexOf('\r\n\r\n') + '\r\n\r\n'.length
    const fileBuffer = Buffer.from(
      fileChunk.substring(fileChunkStart),
      'binary'
    )

    return {
      buffer: fileBuffer,
      data: { path: filePath, name: fileName, type: fileType, ext: fileExt }
    }
  }

  /**
   * Upload buffer into storage
   * @param file Buffer
   * @param filedata FileDataDTO
   * @returns FileDataDTO
   */
  private async upload(
    file: Buffer,
    filedata: FileDataDTO
  ): Promise<FileDataDTO> {
    const pathResolved = path.resolve(filedata.path)

    if (!fs.existsSync(path.resolve(pathResolved))) {
      fs.mkdirSync(path.resolve(pathResolved), { recursive: true });
    }

    await fs.writeFileSync(`${pathResolved}/${filedata.name}`, file)

    return filedata
  }
}
