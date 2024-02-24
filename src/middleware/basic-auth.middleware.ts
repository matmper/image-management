import { IncomingMessage } from "http";
import NotAuthorizedError from "../errors/not-authorized.error";

export default class BasicAuthMiddleware {
  /**
   * Basic Auth Middleware
   * @param req
   * @returns Promise<void>
   */
  async handle(req: IncomingMessage): Promise<void> {
    const auth = req.headers.authorization

    if (!auth || auth.indexOf('Basic ') === -1) {
      throw new NotAuthorizedError
    }

    const base64Credentials =  auth.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    if (username !== process.env.AUTH_USER || password !== process.env.AUTH_PASS) {
      throw new NotAuthorizedError
    }
  }
}
