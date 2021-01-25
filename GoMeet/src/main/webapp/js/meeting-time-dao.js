class MeetingTimeDAO {
  /** Data Access Object for MeetingTimes */

  static endpoint = '/meeting-time?'; // URL endpoint of the associated servlet
  
  /**
   * Returns a URL string with the key value pairs
   * as given in 'keyValues' encoded into a query string, in the format
   * '/meeting-time?key1=value1&key2=value2...'
   * @param {Object} fieldValues the map of field to values representing the
   * field-value pairs to be appended to the querystring.
   * @returns the url at the /meeting-time endpoint with the query string
   * appended
   */
  static url(fieldValues) {
    let queryString = new URLSearchParams();
    for (const [field, value] of Object.entries(fieldValues)) {
      queryString.append(field, value);
    }
    return MeetingTimeDAO.endpoint + queryString.toString();
  }
  /**
   * Fetches the meeting time data associated with the provided
   * MeetingTimeID.
   * @param {String} meetingTimeId the MeetingTimeID of the MeetingTime 
   * entity to be fetched from Datastore. Equivalent to the 
   * Datastore-generated Key of the entity.
   * @returns a JSON object with the details of the fetched 
   * MeetingTime entity.
   */
  static async fetchMeetingTime(meetingTimeId) {
    if (meetingTimeId === null || meetingTimeId === undefined) {
      throw new Error(INSUFFICIENT_REQUEST_PARAM);
    }
     
    if (typeof meetingTimeId !== 'string') {
      throw new Error(INVALID_PARAM_TYPE);
    }

    let urlString = MeetingTimeDAO.url({'meetingTimeId': meetingTimeId});
    let results = await fetch(urlString);
    let resultsJson = await results.json();
    return resultsJson;
  }
}
