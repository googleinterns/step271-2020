describe ('LoginStatus - doGet', function() {
  const MEETING_EVENT_ID = 'qwerty12345'; 
  const QUERY_STRING = '?meetingEventId=' + MEETING_EVENT_ID; 
  const ERROR_RESPONSE = {
    status: 404, 
    messsage: 'Some error message'
  };
  const LOGIN_STATUS_DATA = {
    loggedIn: 'true',
    logoutUrl: 'Some url',
    userEmail: 'Some email'
  };

  beforeEach(function() {
    spyOn(window, 'fetch').and.callFake(async function(url) {
      return new Response(JSON.stringify(LOGIN_STATUS_DATA), null);
    });
  }); 

  it ('Throws an exception if the meetingEventId param is not provided', async function() {
    let errorMessage;
    try {
      await LoginStatus.doGet();
    } catch (error) {
      errorMessage = error.message;
    }
    expect(errorMessage).toEqual(INSUFFICIENT_REQUEST_PARAM);
  });

  it('Throws an error if the meetingEventId param type is not a string', async function () {
    let errorMessge; 
    try {
      await LoginStatus.doGet(12345); 
    } catch (error) {
      errorMessge = error.message; 
    }
    expect(errorMessge).toEqual(INVALID_PARAM_TYPE); 
  }); 

  it('Returns a JSON object with the login status data on success', async function () {
    let result = await LoginStatus.doGet(MEETING_EVENT_ID);
    expect(result).toEqual(LOGIN_STATUS_DATA);
    expect(window.fetch).toHaveBeenCalledWith(
      LoginStatus.endpoint + QUERY_STRING
    );
  });
}); 
