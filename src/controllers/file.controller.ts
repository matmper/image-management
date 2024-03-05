import { IncomingMessage } from "http"
import ResponseDTO from "../types/response.dto"

export default class FileController {
  /**
   * Get, resize and crop image file
   * @param req
   * @returns Promise<ResponseDTO>
   */
  async show(req: IncomingMessage): Promise<ResponseDTO<{readable: boolean}>> {
    return { data: { readable: req.readable } }
  }
}
