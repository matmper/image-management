import { IncomingMessage } from "http"
import FileController from "../controllers/file.controller"
import PageController from "../controllers/page.controller"
import NotAuthorizedError from "../errors/not-authorized.error"
import PageNotFoundError from "../errors/page-not-found.error"
import RouteDTO from "../types/route.dto"

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
          return { code: 200, message: message }
        }

        if (url === "/healthcheck") {
          const controller = new PageController
          const message = await controller.healthcheck()
          return { code: 200, message: message }
        }

        if (url === "/files") {
          const controller = new FileController
          const message = await controller.show(req)
          return { code: 200, message: message }
        }
      }

      // Routes: POST
      if (req.method === "POST") {
        if (url === "/files") {
          const controller = new FileController
          const message = await controller.store(req)
          return { code: 201, message: message }
        }
      }

      throw new PageNotFoundError
    } catch (error) {
      if (error instanceof NotAuthorizedError) {
        return { code: 403, message: {data: {error: "Not authorized"}, meta: {code: 403}}}
      } else if (error instanceof PageNotFoundError) {
        return { code: 404, message: {data: {error: "Page not found"}, meta: {code: 404}}}
      } else {
        return { code: 500, message: {data: {error: error.message}, meta: {code: 500}}}
      }
    }
  }
}
