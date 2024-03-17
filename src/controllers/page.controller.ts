import ResponseDTO from "../types/response.dto"

export default class PageController {
  /**
   * Homepage method
   * @returns Promise<ResponseDTO>
   */
  async index(): Promise<ResponseDTO<{name: string, version: string}>> {
    return {
      data: {
        name: "image-management",
        version: "1.0"
      }
    }
  }

  /**
   * Health check method
   * @returns Promise<ResponseDTO>
   */
  async healthcheck(): Promise<ResponseDTO<{ success: boolean }>> {
    return {
      data: {
        success: true
      }
    }
  }
}
