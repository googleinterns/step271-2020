class MeetingTimeDAO {
  /** Data Access Object for MeetingTimes */

  static endpoint = '/meeting-time'; // URL endpoint of the associated servlet
  
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

    let urlString = DAOUtils.url(MeetingTimeDAO.endpoint, {'meetingTimeId': meetingTimeId});
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
    let urlString = DAOUtils.url(MeetingTimeDAO.endpoint, {'datetime': datetimeStr}); 
    let responseInit = {
      method: 'POST'
    }
    let response = await fetch(urlString, responseInit).then((response) => response.json());
    return response;
  }
}
