class EmailDAO {
  /** Data Access Object for sending emails */

  static endpoint = '/email'; // URL endpoint of the associated servlet
  
  /**
   * Completes a POST request to send an email invitation with the 
   * meeting event link to all addresses in the guest list 
   * @param {String} meetingTimeId the unique entity key of the 
   * MeetingEvent that the guest list is invited to 
   * @param {List} guestList the list of guests' email addresses 
   * @return JSON containing the sent status of the emails  
   */
  static async inviteGuestsToMeeting(meetingEventId, guestList) {
    if (meetingEventId === null || meetingEventId === undefined ||
        guestList === null || guestList === undefined) {
      throw new Error(INSUFFICIENT_REQUEST_PARAM);
    }

    if (typeof meetingEventId !== 'string' || !Array.isArray(guestList)) {
      throw new Error(INVALID_PARAM_TYPE); 
    }

    for (let i = 0; i < guestList.length; i++) {
      if (typeof guestList[i] !== 'string') {
        throw new Error(INVALID_PARAM_TYPE); 
      }
    }

    // Encode the data to be sent in the query string
    let urlString = DAOUtils.url(EmailDAO.endpoint, {'meetingEventId': meetingEventId, 
    'guestList': guestList});

    let responseInit = {method: 'POST'}
    let response = await fetch(urlString, responseInit).then((response) => response.json());
    return response;
  }
}
