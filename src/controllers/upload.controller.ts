import { IncomingMessage } from "http"
import multiparty from "multiparty"
import fs from "node:fs"
import path from "node:path"
import BadRequestError from "../errors/bad-request.error"
import Config from "../helpers/config.helper"
import ResponseDTO from "../types/response.dto"
import FileDTO from "../types/file.dto"

export default class UploadController {
  /**
   * Upload a new file
   * @param req
   * @returns Promise<ResponseDTO>
   */
  async store(req: IncomingMessage): Promise<ResponseDTO<{
    file: { key: string }
  }>> {
    await this.validate(req)

    const fields = await this.getFormFields(req)

    const upload = await this.upload(fields.file, fields.path)

    return { data: { file: upload } }
  }

  /**
   * Validate request header and params
   * @param req IncomingMessage
   * @returns Promise<void>
   */
  private async validate(req: IncomingMessage): Promise<void> {
    if (req.headers['content-type'] === undefined) {
      throw new BadRequestError('Request content type header is required')
    }

    const contentType: string = req.headers['content-type'].split(';')[0]
    const contentLength: number = parseInt(req.headers['content-length'])
    const maxFileSize: number = parseInt(Config.read('storage.max_size')
      .toString())

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
   * Parse and validate request body
   * @param req IncomingMessage
   * @returns Promise<{file: FileDTO, path: string}>
   */
  private async getFormFields(req: IncomingMessage): Promise<{
    file: FileDTO,
    path: string
  }> {
    const form = new multiparty.Form()

    return new Promise<{
      file: FileDTO,
      path: string
    }>(function(resolve, reject): void {
      form.parse(req, async function(err: Error, fields, files) {
        if (fields.path === undefined || fields.path[0] === '') {
          return reject('Field "path" is required')
        }

        if (files.file === undefined || files.file.length !== 1) {
          return reject('Field "file" is required with one image')
        }

        const file: FileDTO = files.file[0]
        const contentType: string = file.headers['content-type']

        if (['image/jpeg', 'image/png'].includes(contentType) !== true) {
          return reject('File extension type is invalid')
        }

        if (err) {
          return reject(err.message)
        }

        resolve({ file, path: fields.path[0] })
      })
    }).catch(error => {
      throw new BadRequestError(error)
    }).then(result => {
      return result
    })
  }

  /**
   * Upload buffer into storage
   * @param file FileDTO
   * @param uploadPath string
   * @returns Promise<FileDataDTO>
   */
  private async upload(
    file: FileDTO,
    uploadPath: string
  ): Promise<{ key: string }> {
    const storagePath: string = Config.read('storage.options.local.path')
      .toString()
    const pathResolved: string = path.resolve(`${storagePath}/${uploadPath}`)

    if (!fs.existsSync(pathResolved)) {
      fs.mkdirSync(pathResolved, { recursive: true });
    }

    const buffer: Buffer = fs.readFileSync(file.path)
    const filename: string = this.getFilename(file.originalFilename)

    fs.writeFileSync(`${pathResolved}/${filename}`, buffer)

    return { key: `${uploadPath}/${filename}` }
  }

  /**
   * Create unique filename to upload
   * @param originalFilename string
   * @returns string
   */
  private getFilename(originalFilename: string): string {
    const ext: string = originalFilename.split('.').pop()
    const slug: string = originalFilename
      .replace(`.${ext}`, '')
      .normalize('NFD')
      .toLowerCase()
      .trim()
      .replace(/_/g, '-')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .replace(/[^\w-]+/g, '')

    let filename = ''
        filename += Math.floor(new Date().getTime()/1000)
        filename += '-'
        filename += slug
        filename += `.${ext}`

    return filename
  }
}
