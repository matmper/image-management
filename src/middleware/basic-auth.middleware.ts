import { IncomingMessage } from "http";
import NotAuthorizedError from "../errors/not-authorized.error";
import Config from "../helpers/config.helper";

export default class BasicAuthMiddleware {
  /**
   * Basic Auth Middleware
   * @param req
   * @returns Promise<boolean>
   */
  static async handle(req: IncomingMessage): Promise<boolean> {
    const auth = req.headers.authorization

    if (!auth || auth.indexOf('Basic ') === -1) {
      throw new NotAuthorizedError
    }

    const [username, password] = Buffer
      .from(auth.split(' ')[1], 'base64')
      .toString('ascii')
      .split(':')

    const validUsername = username === Config.read('auth.user')
    const validPassword = password === Config.read('auth.pass')

    if (!validUsername || !validPassword) {
      throw new NotAuthorizedError
    }

    return true
  }
}
