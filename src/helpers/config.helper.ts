import config from "../config/config"

export default class Config {
  /**
   * Read application config
   * @param name string
   * @returns
   */
  static read(name: string): string|number|object|null {
    const split = name.split('.')

    let response = config

    for (let index = 0; index < split.length; index++) {
      if (response[split[index]] === undefined) {
        return undefined
      }

      response = response[split[index]]
    }

    return response
  }

  /**
   * Set new config value
   * @param name string
   * @param value string
   */
  static write(name: string, value: string|number|object|null): void {
    const split = name.split('.')

    let response = config

    for (let index = 0; index < split.length - 1; index++) {
      response = response[split[index]]
    }

    response[split.pop()] = value
  }
}
