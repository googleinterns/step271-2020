describe('MeetingTimeDAO - MeetingTime entity Data Access Object', function () {
  const MEETING_TIME_ID = 'abc123def456';
  const INVALID_ID = 'non-existent-id';
  const QUERY_STRING = 'meetingTimeId=' + MEETING_TIME_ID;
  const ERROR_RESPONSE = {
    status: 404,
    message: 'This will be an error message',
  };
  const MEETING_TIME_DATA = {
    datetime: '2021-01-26T10:30',
    voteCount: '2',
    voters: ['John Smith', 'Bob Citizen'],
  };

  beforeEach(function () {
    // Return a Response promise
    spyOn(window, 'fetch').and.callFake(async function (url) {
      // assume all fetches other than the hardcoded query string above
      // to be invalid
      let responseInit = null;
      if (url !== MeetingTimeDAO.endpoint + QUERY_STRING) {
        // Body of the response = ERROR_RESPONSE
        return new Response(JSON.stringify(ERROR_RESPONSE), responseInit);
      } else {
        return new Response(JSON.stringify(MEETING_TIME_DATA), responseInit);
      }
    });
  });

  it('throws an exception if the meetingTimeId param is not provided', async function () {
    // Note: cannot use expect().toThrow, because the .toThrow executes before call to
    // async fetchMeetingTime is resolved.
    let errorMessage;
    try {
      await MeetingTimeDAO.fetchMeetingTime();
    } catch (error) {
      errorMessage = error.message;
    }
    expect(errorMessage).toEqual(INSUFFICIENT_REQUEST_PARAM);
  });

  it('returns a JSON object with the meeting time data on success', async function () {
    let result = await MeetingTimeDAO.fetchMeetingTime(MEETING_TIME_ID);
    expect(result).toEqual(MEETING_TIME_DATA);
    expect(window.fetch).toHaveBeenCalledWith(
      MeetingTimeDAO.endpoint + QUERY_STRING
    );
  });

  it('returns the error response sent by the server on failure', async function () {
    // failures include non-existent or invalid MeetingTimeIds
    let result = await MeetingTimeDAO.fetchMeetingTime(INVALID_ID);
    expect(result).toEqual(ERROR_RESPONSE);
    expect(window.fetch).toHaveBeenCalledWith(
      MeetingTimeDAO.endpoint + 'meetingTimeId=' + INVALID_ID
    );
  });

  it('handles invalid argument types by throwing an error', async function () {
    // Note: cannot use expect().toThrow, because the .toThrow executes before call to
    // async fetchMeetingTime is resolved.
    let errorMessage;
    try {
      await MeetingTimeDAO.fetchMeetingTime(123); // meetingTimeId should be a string
    } catch (error) {
      errorMessage = error.message;
    }
    expect(errorMessage).toEqual(INVALID_PARAM_TYPE);
  });
});
