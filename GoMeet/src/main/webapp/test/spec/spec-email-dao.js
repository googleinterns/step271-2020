describe ('EmailDAO - inviteGuestsToMeeting', function() {
  const SENT_RESULT = ['sent', true]; 
  const ERROR_RESPONSE = {
    status: 404, 
    messsage: 'Some error message'
  };
  const RESPONSE_INIT = {method: 'POST'};
  const MEETING_EVENT_ID = 'qwerty12345'; 
  // Note: Guest list should be of type array and each element within the list
  // should be of type string 
  const GUEST_LIST = ['guest1@gmail.com', 'guest2@gmail.com', 'guest3@gmail.com'];
  const BAD_GUEST_LIST_1 = 'guest1@gmail.com, guest2@gmail.com, guest3@gmail.com'; 
  const BAD_GUEST_LIST_2 = [123, 456, 789]; 
  const BAD_GUEST_LIST_3 = ['guest1@gmail.com', 123, 'guest3@gmail.com']; 
  const QUERY_STRING = '?meetingEventId=' + encodeURIComponent(MEETING_EVENT_ID) + 
      '&guestList=' + encodeURIComponent(GUEST_LIST); 
  
  beforeEach(function() {
    spyOn(window, 'fetch').and.callFake(async function(url) {
      // Assume all fetches other than the hardcoded const QUERY_STRING 
      // to be invalid
      if (url !== EmailDAO.endpoint + QUERY_STRING) {
        return new Response(JSON.stringify(ERROR_RESPONSE), null);
      }
      return new Response(JSON.stringify(SENT_RESULT), null);
    }); 
  }); 
  
  it('Throws an exception if the meetingEventId param is not provided', async function () {
    let errorMessage;
    try {
      await EmailDAO.inviteGuestsToMeeting(GUEST_LIST);
    } catch (error) {
      errorMessage = error.message;
    }
    expect(errorMessage).toEqual(INSUFFICIENT_REQUEST_PARAM);
  });

  it('Throws an exception if the guestList param is not provided', async function () {
    let errorMessage;
    try {
      await EmailDAO.inviteGuestsToMeeting(MEETING_EVENT_ID);
    } catch (error) {
      errorMessage = error.message;
    }
    expect(errorMessage).toEqual(INSUFFICIENT_REQUEST_PARAM);
  });

  it('Throws an exception if the meetingEventId and guestList param is not provided', async function () {
    let errorMessage;
    try {
      await EmailDAO.inviteGuestsToMeeting();
    } catch (error) {
      errorMessage = error.message;
    }
    expect(errorMessage).toEqual(INSUFFICIENT_REQUEST_PARAM);
  });

  it('Throws an exception if the meetingEventId is not a string', async function () {
    let errorMessage;
    try {
      await EmailDAO.inviteGuestsToMeeting(123, GUEST_LIST); 
    } catch (error) {
      errorMessage = error.message;
    }
    expect(errorMessage).toEqual(INVALID_PARAM_TYPE);
  });

  it('Throws an exception if the guestList is not an object with string elements', async function () {
    let errorMessage;
    try {
      await EmailDAO.inviteGuestsToMeeting(MEETING_EVENT_ID, BAD_GUEST_LIST_1); 
    } catch (error) {
      errorMessage = error.message;
    }
    expect(errorMessage).toEqual(INVALID_PARAM_TYPE);

    try {
      await EmailDAO.inviteGuestsToMeeting(MEETING_EVENT_ID, BAD_GUEST_LIST_2); 
    } catch (error) {
      errorMessage = error.message; 
    }
    expect(errorMessage).toEqual(INVALID_PARAM_TYPE); 

    try {
      await EmailDAO.inviteGuestsToMeeting(MEETING_EVENT_ID, BAD_GUEST_LIST_3); 
    } catch (error) {
      errorMessage = error.message; 
    }
    expect(errorMessage).toEqual(INVALID_PARAM_TYPE); 
  });

  it('Returns a JSON string with the email sent status on success', async function () {
    let result = await EmailDAO.inviteGuestsToMeeting(MEETING_EVENT_ID, GUEST_LIST);
    expect(result).toEqual(SENT_RESULT);
    expect(window.fetch).toHaveBeenCalledWith(EmailDAO.endpoint + QUERY_STRING, RESPONSE_INIT);
  });
}); 
