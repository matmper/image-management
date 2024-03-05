import { IncomingMessage } from "http"
import FileController from "../controllers/file.controller"
import PageController from "../controllers/page.controller"
import UploadController from "../controllers/upload.controller"
import NotAuthorizedError from "../errors/not-authorized.error"
import PageNotFoundError from "../errors/page-not-found.error"
import RouteDTO from "../types/route.dto"
import BadRequestError from "../errors/bad-request.error"
import BasicAuthMiddleware from "../middleware/basic-auth.middleware"

export default class Route {
  /**
   * API Routes
   * @param req any
   * @param res any
   * @returns Promise<RouteDTO>
   */
  async handle(req: IncomingMessage): Promise<RouteDTO> {
    try {
      const url = req.url.split('?')[0]

      // Routes: GET
      if (req.method === "GET") {
        if (url === "/") {
          const controller = new PageController
          const message = await controller.index()
          return { message, code: 200 }
        }

        if (url === "/healthcheck") {
          const controller = new PageController
          const message = await controller.healthcheck()
          return { message, code: 200 }
        }

        if (url === "/files") {
          await BasicAuthMiddleware.handle(req)
          const controller = new FileController
          const message = await controller.show(req)
          return { message, code: 200 }
        }
      }

      // Routes: POST
      if (req.method === "POST") {
        if (url === "/files") {
          await BasicAuthMiddleware.handle(req)
          const controller = new UploadController
          const message = await controller.store(req)
          return { message, code: 201 }
        }
      }

      throw new PageNotFoundError
    } catch (error) {
      let code = 500

      if (error instanceof BadRequestError) {
        code = 400
      } else if (error instanceof NotAuthorizedError) {
        code = 403
      } else if (error instanceof PageNotFoundError) {
        code = 404
      }

      return {
        message: { data: { error: error.message, code: code } },
        code
      }
    }
  }
}
