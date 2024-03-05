interface ResponseDTO<TData = Record<string, unknown>> {
  data: TData;
}

export default ResponseDTO;
