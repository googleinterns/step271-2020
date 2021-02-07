class VoteMeetingTimeDAO {
  static endpoint = '/vote-meeting-time?'; // endpoint associated with this servlet

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
    if (meetingTimeId === null || meetingTimeId === undefined || 
        voter === null || voter === undefined) {
      throw new Error(INSUFFICIENT_REQUEST_PARAM);
    }

    if (typeof meetingTimeId !== 'string' || typeof voter !== 'string') {
      throw new Error(INVALID_PARAM_TYPE);
    }

    // encode the data to be sent in the query string
    let urlString = DAOUtils.url(VoteMeetingTimeDAO.endpoint, {
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
