import { IncomingMessage } from "http"
import multiparty from "multiparty"
import fs from "node:fs"
import path from "node:path"
import ResponseDTO from "../types/response.dto"
import BadRequestError from "../errors/bad-request.error"
import Config from "../helpers/config.helper"
import FileDataDTO from "../types/filedata.dto"
import FileDTO from "../types/file.dto"

export default class UploadController {
  /**
   * Upload a new file
   * @param req
   * @returns Promise<ResponseDTO>
   */
  async store(req: IncomingMessage): Promise<ResponseDTO<{file: FileDataDTO}>> {
    await this.validate(req)

    const fields = await this.getFormFields(req)

    const upload = await this.upload(fields.file, fields.path)

    return { data: { file: upload } }
  }

  /**
   * Validate request header and params
   * @param req IncomingMessage
   */
  private async validate(req: IncomingMessage): Promise<void> {
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
          reject('Field "path" is required')
        }

        if (files.file === undefined || files.file.length !== 1) {
          reject('Field "file" is required with one image')
        }

        // if (!['image/jpeg', 'image/png'].includes(fileType)) {
        //   reject('File extension type is invalid')
        // }

        if (err) {
          reject(err.message)
        }

        resolve({ file: files.file[0], path: fields.path[0] })
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
  ): Promise<FileDataDTO> {
    const storagePath = Config.read('storage.options.local.path').toString()
    const pathResolved = path.resolve(`${storagePath}////${uploadPath}`)

    if (!fs.existsSync(pathResolved)) {
      fs.mkdirSync(pathResolved, { recursive: true });
    }

    const buffer = fs.readFileSync(file.path)

    fs.writeFileSync(`${pathResolved}/${file.originalFilename}`, buffer)

    return {
      path: uploadPath,
      name: '',
      type: '',
      ext: ''
    }
  }
}
