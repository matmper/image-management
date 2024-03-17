import http from "node:http"
import Route from "./routes/route"
import Config from "./helpers/config.helper"

// Check if exists values to basic auth (user and password)
if (!Config.read('auth.user') || !Config.read('auth.pass')) {
  throw new Error('Configuration of AUTH_USER and AUTH_PASS is required into .env file')
}

// Create application http server
const server = http.createServer(async (req: http.IncomingMessage, res: http.ServerResponse) => {
  const response = new Route
  const json = await response.handle(req)

  if (json.message.headers) {
    res.writeHead(json.code, json.message.headers)
    res.end(json.message.data)
  } else {
    res.writeHead(json.code, { "Content-Type": "application/json" })
    res.end(JSON.stringify(json.message))
  }
});

const port = Config.read('app.port')

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.info(`Server is running on Port ${port}`);
});
