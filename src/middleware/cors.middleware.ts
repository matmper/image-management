import { ServerResponse } from "http";

export default class CorsMiddleware {
  /**
   * Cors Middleware
   * @param res ServerResponse
   * @returns void
   */
  static handle(res: ServerResponse): void {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', [
      'Authorization',
      'Accept',
      'Access-Control-Request-Method',
      'Content-Type',
      'Content-Length',
    ]);
  }
}
