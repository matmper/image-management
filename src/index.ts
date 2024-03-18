import http from "node:http"
import Route from "./routes/route"
import Config from "./helpers/config.helper"

// Create application http server
const server = http.createServer(async (
  req: http.IncomingMessage,
  res: http.ServerResponse
) => {
  const response = new Route
  const json = await response.handle(req, res)

  if (Buffer.isBuffer(json.message.data)) {
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
