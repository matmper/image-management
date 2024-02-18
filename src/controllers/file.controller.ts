import BasicAuthMiddleware from "../middleware/basic-auth.middleware"
import ResponseDTO from "../types/response.dto"

export default class FileController {
  /**
   * Get, resize and crop image file
   * @param req
   * @returns Promise<ResponseDTO>
   */
  async show(req: object): Promise<ResponseDTO> {
    const middleware = new BasicAuthMiddleware
    await middleware.handle(req)

    return { data: { message: "success" }, meta: {} }
  }

  /**
   * Upload a new file
   * @param req
   * @returns Promise<ResponseDTO>
   */
  async store(req: object): Promise<ResponseDTO> {
    const middleware = new BasicAuthMiddleware
    await middleware.handle(req)

    return { data: { message: "upload" }, meta: {} }
  }
}
