export default class Utils {
  /**
   * Capture valid values between string
   * @param str
   * @param start
   * @param end
   * @returns
   */
  static substring(str: string, start: string, end: string): string {
    const fieldStartIndex = str.indexOf(start) + start.length
    const fieldEndIndex = str.indexOf(end, fieldStartIndex)
    return str.substring(fieldStartIndex, fieldEndIndex)
  }
}
