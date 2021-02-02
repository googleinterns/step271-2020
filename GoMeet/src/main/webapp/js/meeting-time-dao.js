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
    let results = await fetch(urlString).then((results) => results.json());
    return results;
  }

  /**
   * Completes a POST request to create a new MeetingTime entity
   * with the data as provided in datetimeStr and saves the entity to
   * Datastore.
   * @param {String} datetimeStr the datetime string in the exact format
   * YYYY-MM-DDTHH:MM, representing the date and time to be stored in the 
   * new MeetingTime Entity
   * @return JSON containing the meetingTimeId of the newly created 
   * MeetingTime entity. 
   */
  static async newMeetingTime(datetimeStr) {
    if (datetimeStr === null || datetimeStr === undefined) {
      throw new Error(INSUFFICIENT_REQUEST_PARAM);
    }

    if (typeof datetimeStr !== 'string') {
      throw new Error(INVALID_PARAM_TYPE);
    }

    // check that the datetime string is in the format: YYYY-MM-DDTHH:MM
    let format = new RegExp(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/);
    if (!format.test(datetimeStr)) {
      throw new Error(INVALID_PARAM_VALUE);
    } 

    // check that the datetimeStr is valid
    // only valid datetime strings can be converted into a Date
    let date = new Date(datetimeStr);
    if (!(date instanceof Date) || isNaN(date)) {
      throw new Error(INVALID_PARAM_VALUE);
    }

    // encode the data to be sent in the query string
    let urlString = MeetingTimeDAO.url({'datetime': datetimeStr}); 
    let responseInit = {
      method: 'POST'
    }
    let response = await fetch(urlString, responseInit).then((response) => response.json());
    return response;
  }
}
