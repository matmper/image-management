import ResponseDTO from "../types/response.dto"

export default class PageController {
  /**
   * Homepage method
   * @returns Promise<ResponseDTO>
   */
  async index(): Promise<ResponseDTO> {
    return {
      data: {
        name: "image-management",
        version: "1.0"
      },
      meta: {}
    }
  }

  /**
   * Health check method
   * @returns Promise<ResponseDTO>
   */
  async healthcheck(): Promise<ResponseDTO> {
    return {
      data: {
        success: true
      },
      meta: {}
    }
  }
}
