class NotAuthorizedError extends Error {
  constructor() {
    super("Not authorized")
    this.name = "NotAuthorizedError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export default NotAuthorizedError
