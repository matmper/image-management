class PageNotFoundError extends Error {
  constructor() {
    super("Page not found")
    this.name = "PageNotFoundError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export default PageNotFoundError
