class VoteMeetingTimeDAO {
  static endpoint = '/vote-meeting-time?'; // endpoint associated with this servlet

  /**
   * Returns a URL string with the key value pairs
   * as given in 'keyValues' encoded into a query string, in the format
   * '/vote-meeting-time?key1=value1&key2=value2...'
   * @param {Object} fieldValues the map of field to values representing the
   * field-value pairs to be appended to the querystring.
   * @returns the url at the /vote-meeting-time endpoint with the query string
   * appended
   */
  static url(fieldValues) {
    let queryString = new URLSearchParams();
    for (const [field, value] of Object.entries(fieldValues)) {
      queryString.append(field, value);
    }
    return VoteMeetingTimeDAO.endpoint + queryString.toString();
  }

  /**
   * Increments the number of votes associated with the MeetingTime
   * entity as identified by meetingTimeId, and adds the voter to the
   * collection of people that have voted for this meeting time.
   * @param {String} meetingTimeId the ID (entity Key) of the MeetingTime
   * entity to be voted for
   * @param {String} voter the name or identifier of the user voting for the
   * MeetingTime
   */
  static async voteMeetingTime(meetingTimeId, voter) {
    if (meetingTimeId === null || meetingTimeId === undefined) {
      throw new Error(INSUFFICIENT_REQUEST_PARAM);
    }
    if (voter === null || voter === undefined) {
      throw new Error(INSUFFICIENT_REQUEST_PARAM);
    }

    if (typeof meetingTimeId !== 'string' || typeof voter !== 'string') {
      throw new Error(INVALID_PARAM_TYPE);
    }

    // encode the data to be sent in the query string
    let urlString = VoteMeetingTimeDAO.url({
      'meetingTimeId': meetingTimeId,
      'voters': voter
    }); 
    let responseInit = {
      method: 'POST'
    }
    let response = await fetch(urlString, responseInit).then((response) => response.json());
    return response;
  }
}
