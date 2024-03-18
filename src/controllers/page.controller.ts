import Config from "../helpers/config.helper"
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
        version: Config.read('app.version').toString(),
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
