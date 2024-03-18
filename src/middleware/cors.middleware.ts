import { ServerResponse } from "http";

export default class CorsMiddleware {
  /**
   * Cors Middleware
   * @param res
   * @returns Promise<ServerResponse>
   */
  static async handle(res: ServerResponse): Promise<void> {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Authorization, Accept, Content-Type, Content-Length'
    );
  }
}
