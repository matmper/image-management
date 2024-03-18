import { IncomingMessage } from "http";
import UnauthorizedError from "../errors/unauthorized.error";
import Config from "../helpers/config.helper";

export default class BasicAuthMiddleware {
  /**
   * Basic Auth Middleware
   * @param req
   * @returns Promise<boolean>
   */
  static async handle(req: IncomingMessage): Promise<boolean> {
    // Check if exists values to basic auth (user and password)
    if (!Config.read('auth.user') || !Config.read('auth.pass')) {
      throw new Error(
        'Configuration of AUTH_USER and AUTH_PASS is required into .env file'
      )
    }

    const auth = req.headers.authorization

    if (!auth || auth.indexOf('Basic ') === -1) {
      throw new UnauthorizedError
    }

    const [username, password] = Buffer
      .from(auth.split(' ')[1], 'base64')
      .toString('ascii')
      .split(':')

    const validUsername = username === Config.read('auth.user')
    const validPassword = password === Config.read('auth.pass')

    if (!validUsername || !validPassword) {
      throw new UnauthorizedError()
    }

    return true
  }
}
