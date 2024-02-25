class BadRequestError extends Error {
  constructor(message: string) {
    super("Bad Request")
    this.name = "BadRequestError";
    this.message = message
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export default BadRequestError
