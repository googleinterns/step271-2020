/**
 * Verfies that the expected error message was returned by VoteMeetingTimeDAO.voteMeetingTime,
 * given the combination of parameters passed to it.
 * @param {String} meetingTimeId The meetingTimeId to be passed to VoteMeetingTimeDAO.voteMeetingTime
 * @param {String} voter The voter to be passes to VoteMeetingTimeDAO.voteMeetingTime
 * @param {String} expectedError The error message expected from VoteMeetingTimeDAO.voteMeetingTime 
 * given the meetingTimeId and voter passed to it.
 */
async function verifyErrorResponse(meetingTimeId, voter, expectedError) {
  // Note: cannot use expect().toThrow, because the .toThrow executes before call to
  // async voteMeetingTime is resolved.
  let errorMessage;
  try {
    await VoteMeetingTimeDAO.voteMeetingTime(meetingTimeId, voter);
  } catch (error) {
    errorMessage = error.message;
  }
  expect(errorMessage).toEqual(expectedError);
}

// TESTS FOR VoteMeetingTimeDAO.voteMeetingTime()
describe('VoteMeetingTimeDAO - voteMeetingTime', function () {
  const MEETING_TIME_ID = 'abc123def456';
  const NON_EXISTENT_ID = 'non-existent-id';
  const VOTER = 'John Citizen';
  const QUERY_STRING = 'meetingTimeId=' 
      + encodeURIComponent(MEETING_TIME_ID) 
      + '&voters=' 
      // Note that encodeURIComponenet encodes spaces to %20, 
      // but URLSearchParam used in VoteMeetingTimeDAO class encodes 
      // spaces to +. So need to replace that here
      + encodeURIComponent(VOTER).replace(/%20/g, '+');
  const INVALID_DATA_QUERY_STRING = 'meetingTimeId=' 
      + encodeURIComponent(NON_EXISTENT_ID) 
      + '&voters=' 
      + encodeURI(VOTER).replace(/%20/g, '+');
  const RESPONSE_INIT = { // send to doPost not doGet
    method: 'POST'
  };
  const SUCCESS_RESPONSE = 200;
  const ERROR_RESPONSE = {
    status: 404,
    message: 'This will be an error message',
  };

  beforeEach(function () {
    spyOn(window, 'fetch').and.callFake(async function (url, init) {
      if (url === VoteMeetingTimeDAO.endpoint + QUERY_STRING) {
        return new Response(JSON.stringify(SUCCESS_RESPONSE));
      } else {
        // assumed all urls but the hardcoded one to be invalid
        return new Response(JSON.stringify(ERROR_RESPONSE));
      }
    });
  });

  it('throws an exception if the meetingTimeId param is not provided', async function () {
    let meetingTimeId = null;
    await verifyErrorResponse(meetingTimeId, VOTER, INSUFFICIENT_REQUEST_PARAM);
  });

  it('throws an exception if the meetingTimeId param is not of string type', async function () {
    let meetingTimeId = 123;
    await verifyErrorResponse(meetingTimeId, VOTER, INVALID_PARAM_TYPE);
  });

  it('throws an exception if the voter param is not provided', async function () {
    let voter = null;
    await verifyErrorResponse(MEETING_TIME_ID, voter, INSUFFICIENT_REQUEST_PARAM);
  });

  it('throws an exception if the voter param is not of string type', async function () {
    let voter = true;
    await verifyErrorResponse(MEETING_TIME_ID, voter, INVALID_PARAM_TYPE);
  });

  it('when successful, returns a JSON string with the OK status code (200)', async function () {
    let successResult = await VoteMeetingTimeDAO.voteMeetingTime(MEETING_TIME_ID, VOTER);
    expect(successResult).toEqual(SUCCESS_RESPONSE);
    expect(window.fetch)
        .toHaveBeenCalledWith(VoteMeetingTimeDAO.endpoint + QUERY_STRING, RESPONSE_INIT);
  });

  it('on failure, returns the JSON error response as returned from the server', async function() {
    // If meetingTimeId is non-existent in datastore, an error response will be sent back
    let failResult = await VoteMeetingTimeDAO.voteMeetingTime(NON_EXISTENT_ID, VOTER);
    expect(failResult).toEqual(ERROR_RESPONSE);
    expect(window.fetch)
        .toHaveBeenCalledWith(VoteMeetingTimeDAO.endpoint + INVALID_DATA_QUERY_STRING, RESPONSE_INIT);
  })
});
