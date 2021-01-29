const CURRENT_USER = 'anna@test.com';
const MEETING_TIME_IDS = ['abc123', 'def456', 'ghi789'];
const VOTED_TIMES = new Set(['abc123', 'def456', 'ghi789']); // The times that CURRENT_USER has voted for
const MEETING_TIME_DATA = [
  {
    datetime: '2021-01-28T17:20',
    voteCount: 1,
    voters: ['anna@test.com'],
  },
  {
    datetime: '2021-01-27T11:20',
    voteCount: 3,
    voters: ['anna@test.com', 'therese@test.com', 'vivian@test.com'],
  },
  {
    datetime: '2021-01-28T11:20',
    voteCount: 2,
    voters: ['anna@test.com', 'therese@test.com'],
  }
];
const ERROR_RESPONSE = {
  status: 404,
  message: 'This will be an error message',
};

// TESTS FOR getLoggedInUser
describe('getLoggedInUser', function() {
  const LOGGED_IN = {
    loggedIn: 'true',
    userEmail: 'anna@test.com'
  };
  const LOGGED_OUT = {
    loggedIn: 'false'
  };

  beforeAll(function() {
    spyOn(LoginStatus, 'doGet').and.returnValues(LOGGED_IN, LOGGED_OUT);
  });

  it('returns the email of the logged in user, \
      or null if the user is not logged in', async function() {
    let loggedInUser = await getLoggedInUser();
    expect(loggedInUser).toEqual(LOGGED_IN.userEmail);
    let loggedOutUser = await getLoggedInUser();
    expect(loggedOutUser).toBe(null);
  })
});

// TESTS FOR fetchAndProcess(meetingTimeIds)
describe('fetchAndProcess(meetingTimeIds)', function() {
  beforeEach(function() {
    getCurrentUserSpy = spyOn(window, 'getLoggedInUser');
    getCurrentUserSpy.and.returnValue(CURRENT_USER);
    spyOn(window, 'generateVoteTimeForm');
    spyOn(MeetingTimeDAO, 'fetchMeetingTime').and.callFake(async function(id) {
      if (id === MEETING_TIME_IDS[0]) {
        return MEETING_TIME_DATA[0];
      } else if (id === MEETING_TIME_IDS[1]) {
        return MEETING_TIME_DATA[1];
      } else if (id === MEETING_TIME_IDS[2]){
        return MEETING_TIME_DATA[2]
      } else {
        return ERROR_RESPONSE; 
      }
    });
  });

  it('does nothing and returns null if the user is not logged in', async function() {
    getCurrentUserSpy.and.returnValue(null);
    expect(await fetchAndProcess(MEETING_TIME_IDS)).toBe(null);
    expect(MeetingTimeDAO.fetchMeetingTime).not.toHaveBeenCalled();
    expect(window.generateVoteTimeForm).not.toHaveBeenCalled();
  });

  it('throws an error if the meetingTimeIds parameter is not an array', async function() {
    let meetingTimeIds = 123; 
    let errorMessage;
    try {
      await fetchAndProcess(meetingTimeIds);
    } catch (error) {
      errorMessage = error.message;
    }
    expect(errorMessage).toEqual(INVALID_PARAM_TYPE);
    expect(window.generateVoteTimeForm).not.toHaveBeenCalled();
  });

  it('logs any error responses received from the DAO without alerting the user', async function() {
    // Errors from the DAO are internal errors that the user cannot deal with, 
    // so don't alert them, but also don't crash the program either
    let nonExistentMeetingIds = ['non-existent-key'];
    spyOn(console, 'error');
    await fetchAndProcess(nonExistentMeetingIds);
    expect(console.error).toHaveBeenCalledWith(
      'ERROR ' +
      ERROR_RESPONSE.status +
      ' ' +
      ERROR_RESPONSE.message +
      ' - MeetingTimeId: ' +
      nonExistentMeetingIds[0]
    );
    expect(window.generateVoteTimeForm).toHaveBeenCalledWith([], CURRENT_USER, new Set());
  });

  it('calls generateVoteTime form with a list of objects containing the MeetingTime data \
      retrieved by MeetingTimeDAO, and the set of times the currentUser has voted for', async function() {
    // the set of times voted for make it easier to determine: 
    // - which times the user cannot vote for again (can't vote for same time twice)
    // - whether the user has voting rights (each user has MAX_VOTES number of votes total)
    await fetchAndProcess(MEETING_TIME_IDS);
    expect(window.generateVoteTimeForm).toHaveBeenCalledWith(MEETING_TIME_DATA, CURRENT_USER, VOTED_TIMES);
  });
});
