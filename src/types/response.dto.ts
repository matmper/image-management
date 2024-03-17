import { OutgoingHttpHeader } from "node:http";

interface ResponseDTO<TData = Record<string, unknown> | Buffer> {
  data: TData;
  headers?: OutgoingHttpHeader[];
}

export default ResponseDTO
