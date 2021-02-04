class DAOUtils {
  /**
   * Returns a URL string with the key value pairs
   * as given in 'keyValues' encoded into a query string, in the format
   * '/endpoint?key1=value1&key2=value2...'
   * @param {String} endpoint the endpoint of the URL, that is, the part of the URL 
   * just before the query string INCLUDING the '?', associated with the relevant servlet
   * @param {Object} fieldValues the map of field to values representing the
   * field-value pairs to be appended to the querystring, in the format:
   * {fieldName1: 'value', fieldName2: 'value'}
   * @returns the url at the given endpoint with the query string appended
   */
  static url(endpoint, fieldValues) {
    let queryString = new URLSearchParams();
    for (const [field, value] of Object.entries(fieldValues)) {
      queryString.append(field, value);
    }
    return endpoint + queryString.toString();
  }
}
