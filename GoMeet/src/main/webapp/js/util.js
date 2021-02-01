class Util {
    /**
   * Returns a URL string with the key value pairs
   * as given in 'keyValues' encoded into a query string, in the format
   * '/endpoint?key1=value1&key2=value2...'
   * @param {Object} fieldValues the map of field to values representing the
   * field-value pairs to be appended to the querystring.
   * @param {String} endpoint the endpoint of the servlet
   * @returns the url at the associated endpoint with the query string appended
   */
  static url(fieldValues, endpoint) {
    let queryString = new URLSearchParams();
    for (const [field, value] of Object.entries(fieldValues)) {
      queryString.append(field, value);
    }
    return endpoint + queryString.toString();
  }
}
