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

// TESTS FOR generateVoteTimeForm
/**
 * Verifies that the cells of each row of the meeting time voting table 
 * contains expected data (in order: datetime, voteCount, 
 * voters list, voting button).
 */
function verifyRowData() {
  // there should be 4 fields of information per row: 
  // datetime, voteCount, voters, voting button
  const ROW_LENGTH = 4; 
  let table = document.getElementById('meeting-times-table');
  expect(table.rows.length)
      .toEqual(MEETING_TIME_DATA.length + 1); // length of data + 1 to include headers row
  
  for (let i = 1; i < table.rows.length; i++) {
    let dataRow = table.rows.item(i);
    expect(dataRow.children.length).toEqual(ROW_LENGTH);
    // first cell in the datetime string
    expect(dataRow.children.item(0).innerText)
        .toEqual(MEETING_TIME_DATA[i - 1].datetime); 
    // second cell is the voteCount
    expect(dataRow.children.item(1).innerText)
        .toEqual(MEETING_TIME_DATA[i - 1].voteCount.toString());
    // third cell is the voters 
    expect(dataRow.children.item(2).innerText)
        .toEqual(MEETING_TIME_DATA[i - 1].voters.toString());
    // fourth cell contains the voting button
    let voteButton = dataRow.children.item(3).children.item(0);
    expect(voteButton.tagName).toEqual('BUTTON');
    expect(voteButton.onclick.toString()).toEqual(`function() {voteTime(time.id, currentUser)}`);
  }
}

describe('generateVoteTimeForm', function() {
  it('creates rows in the table with id="meeting-times-table" with the data received \
      disabling all the vote buttons if the user has voted MAX_VOTES times', async function() {
    generateVoteTimeForm(MEETING_TIME_DATA, CURRENT_USER, VOTED_TIMES);
    verifyRowData();
    // verify the voting buttons separately, as their state varies depending on voter
    let table = document.getElementById('meeting-times-table');
    for (let i = 1; i < table.rows.length; i++) {
      let dataRow = table.rows.item(i);
      let voteButton = dataRow.children.item(3).children.item(0);
      expect(voteButton.disabled).toBe(true); // currentUser has voted for MAX_VOTES times
    }
  });

  it('creates rows in the table with id="meeting-times-table" with the data received \
      disabling the vote buttons of times that the user has voted for', async function() {
    let votedTimesTherese = new Set(['def456', 'ghi789']);
    generateVoteTimeForm(MEETING_TIME_DATA, "therese@test.com", votedTimesTherese);
    verifyRowData();
    let table = document.getElementById('meeting-times-table');
    for (let i = 1; i < table.rows.length; i++) {
      let dataRow = table.rows.item(i);
      let voteButton = dataRow.children.item(3).children.item(0);
      // If the button if associated with a time not voted for yet, 
      // button should not be disabled
      if (!votedTimesTherese.has(voteButton.id)) {
        expect(voteButton.disabled).toBe(false); 
      } else {
        expect(voteButton.disabled).toBe(true); 
      }
    }
  });

  it('creates rows in the table with id="meeting-times-table" with the data received \
      enabling all vote buttons if user has not voted yet', async function() {
    let votedTimesNewUser = new Set();
    generateVoteTimeForm(MEETING_TIME_DATA, "newuser@test.com", votedTimesNewUser);
    verifyRowData();
    let table = document.getElementById('meeting-times-table');
    for (let i = 1; i < table.rows.length; i++) {
      let dataRow = table.rows.item(i);
      let voteButton = dataRow.children.item(3).children.item(0);
      expect(voteButton.disabled).toBe(false); // currentUser has not voted at all
    }
  });
  afterEach(function() {
    // reset the 'meeting-times-table' table to JUST include the headers
    let table = document.getElementById('meeting-times-table');
    for (let i = table.rows.length - 1; i > 0; i--) {
      table.deleteRow(i);
    }
  });
});

// TESTS FOR sortTimeByVotes
describe('sortTimeByVotes', function() {
  let sortedTimeData;
  beforeEach(function() {
    sortedTimeData = [
      {
        datetime: '2021-01-27T11:20',
        voteCount: 3,
        voters: ['anna@test.com', 'therese@test.com', 'vivian@test.com'],
      },
      {
        datetime: '2021-01-28T11:20',
        voteCount: 2,
        voters: ['anna@test.com', 'therese@test.com'],
      },
      {
        datetime: '2021-01-28T17:20',
        voteCount: 1,
        voters: ['anna@test.com'],
      }
    ];
  });

  it('sorts the timeData objects by voteCount in decreasing order', function() {
    let timeData = [
      {
        datetime: '2021-01-28T17:20',
        voteCount: 1,
        voters: ['anna@test.com'],
      },
      {
        datetime: '2021-01-28T11:20',
        voteCount: 2,
        voters: ['anna@test.com', 'therese@test.com'],
      },
      {
        datetime: '2021-01-27T11:20',
        voteCount: 3,
        voters: ['anna@test.com', 'therese@test.com', 'vivian@test.com'],
      }
    ];
    sortTimesbyVotes(timeData);
    expect(timeData).toEqual(sortedTimeData);
  });

  it('does not modify the timeData objects if already sorted', function() {
    // duplicate of sortedTimeData
    let sortedTimeDataDuplicate = [
      {
        datetime: '2021-01-27T11:20',
        voteCount: 3,
        voters: ['anna@test.com', 'therese@test.com', 'vivian@test.com'],
      },
      {
        datetime: '2021-01-28T11:20',
        voteCount: 2,
        voters: ['anna@test.com', 'therese@test.com'],
      },
      {
        datetime: '2021-01-28T17:20',
        voteCount: 1,
        voters: ['anna@test.com'],
      }
    ];
    sortTimesbyVotes(sortedTimeDataDuplicate);
    expect(sortedTimeDataDuplicate).toEqual(sortedTimeData);
  });

  it('does not modify an empty list', function() {
    let emptyTimeData = [];
    sortTimesbyVotes(emptyTimeData);
    expect(emptyTimeData).toEqual([]);
  });
});

// TESTS FOR voteTime
describe('voteTime', function() {
  const SUCCESS_RESPONSE = {status: 200};
  var voteMeetingTimeSpy;
  beforeAll(function() {
    voteMeetingTimeSpy = spyOn(VoteMeetingTimeDAO, 'voteMeetingTime');
    spyOn(window, 'displayMeetingTimeForm');
    spyOn(console, 'error');
  });

  it('calls VoteMeetingTimeDAO.voteMeetingTime with the \
      MeetingTimeId and currentUser', async function() {
    voteMeetingTimeSpy.and.returnValue(SUCCESS_RESPONSE);
    await voteTime(MEETING_TIME_IDS[0], CURRENT_USER);
    expect(VoteMeetingTimeDAO.voteMeetingTime)
        .toHaveBeenCalledWith(MEETING_TIME_IDS[0], CURRENT_USER);
  });

  it('calls displayMeetingTimeForm to re-render the page', async function() {
    voteMeetingTimeSpy.and.returnValue(SUCCESS_RESPONSE);
    await voteTime(MEETING_TIME_IDS[0], CURRENT_USER);
    expect(window.displayMeetingTimeForm).toHaveBeenCalled();
  });

  it('logs any error responses received from the DAO without alerting the user', async function() {
    voteMeetingTimeSpy.and.returnValue(ERROR_RESPONSE);
    // Errors from the DAO are internal errors that the user cannot deal with, 
    // so don't alert them, but also don't crash the program either
    let nonExistentMeetingId = 'non-existent-key';
    await voteTime(nonExistentMeetingId, CURRENT_USER);
    expect(console.error).toHaveBeenCalledWith(
      'ERROR ' +
      ERROR_RESPONSE.status +
      ' ' +
      ERROR_RESPONSE.message +
      ' - MeetingTimeId: ' +
      nonExistentMeetingId
    );
  });
});
