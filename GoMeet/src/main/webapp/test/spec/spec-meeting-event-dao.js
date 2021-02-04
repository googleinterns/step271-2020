/**
 * Creates <input> elements with the names and values as given in arr.
 * @param {Array} arr Array of objects each in the format {name: value},
 * representing the name and value of the <input> elements to create.
 * @returns {Array} Array of <input> elements created
 */
function createInputElems(arr) {
  let inputElements = [];
  for (let i = 0; i < arr.length; i++) {
    let elem = document.createElement('input');
    let name = Object.keys(arr[i])[0];
    let value = arr[i][name];
    elem.name = name;
    elem.value = value;
    inputElements.push(elem);
  }
  return inputElements;
}

describe ('MeetingEventDAO - getter functions', function() {
  // Set up
  let documentSpy;
  let fakeSessionStorage = {};
  const MEETING_NAME = 'Christmas Lunch';
  const DURATION_MINS = '30'; 
  const DURATION_HOURS = '1'; 
  const TIME_FIND_METHOD = 'manual';
  const HOST = 'vivian@gmail.com';
  const GUEST_1 = 'anna@gmail.com';
  const GUEST_2 = 'therese@gmail.com';
  const TIME_1 = '2021-02-02T08:19';
  const TIME_2 = '2021-02-05T08:19';
  const FAKE_KEYS = ['meeting-name', 'meeting-host', 'guest-1', 'guest-3', 'duration-mins', 
      'duration-hours', 'time-find-method', 'meeting-time-1', 'meeting-time-4'];

  beforeAll(function () {
    // Hardcode some data to store to session storage
    // Note: getGuestList() should return all sessionStorage entries with the 
    // prefix 'guest-' regardless of the number. Same goes for getMeetingTimes()
    let inputElemData = [
      { 'meeting-name': MEETING_NAME },
      { 'meeting-host': HOST },
      { 'guest-1': GUEST_1 }, 
      { 'guest-3': GUEST_2 }, 
      { 'duration-mins': DURATION_MINS }, 
      { 'duration-hours': DURATION_HOURS }, 
      { 'time-find-method': TIME_FIND_METHOD }, 
      { 'meeting-time-1': TIME_1 }, 
      { 'meeting-time-4': TIME_2 }
    ];
    
    let inputElements = createInputElems(inputElemData);
    inputElementsMock = new MockHTMLCollection(inputElements);

    // Mocks for external functions
    spyOn(document, 'getElementsByTagName').and.returnValue(inputElementsMock); 
    spyOnProperty(Storage.prototype, 'length', 'get').and.returnValue(FAKE_KEYS.length); 
    spyOn(sessionStorage, 'key').and.callFake(function(i) {
      return FAKE_KEYS[i]; 
    });
    spyOn(sessionStorage, 'setItem').and.callFake(function(key,value) {
      fakeSessionStorage[key] = value;
    });
    spyOn(sessionStorage, 'getItem').and.callFake(function(key) {
      return fakeSessionStorage[key];
    });
    
    // Save hardcoded data to sessionStorage
    saveMeeting();
  });

  it ('Should get the meeting name from session storage', function() {
    expect(MeetingEventDAO.getMeetingName()).toBe(MEETING_NAME);
  });

  it ('Should get the meeting durations mins from session storage', function() {
    expect(MeetingEventDAO.getDurationMins()).toBe(DURATION_MINS); 
  });

  it ('Should get the meeting duration hours from session storage', function() {
    expect(MeetingEventDAO.getDurationHours()).toBe(DURATION_HOURS);
  });

  it ('Should get the meeting time find method from session storage', function() {
    expect(MeetingEventDAO.getTimeFindMethod()).toBe(TIME_FIND_METHOD); 
  });

  it ('Should get the meeting guest list from session storage', function() {
    let result = MeetingEventDAO.getGuestList();
    expect(result.length).toBe(3); 
    expect(result[0]).toBe(HOST); 
    expect(result[1]).toBe(GUEST_1);
    expect(result[2]).toBe(GUEST_2);
  });

  it ('Should get the meeting times list from session storage', function() {
    let result = MeetingEventDAO.getMeetingTimes(); 
    expect(result.length).toBe(2); 
    expect(result[0]).toBe(TIME_1); 
    expect(result[1]).toBe(TIME_2);
  }); 
});

describe ('MeetingEventDAO - fetchMeetingEvent', function() {
  const MEETING_EVENT_ID = 'qwerty12345'; 
  const INVALID_ID = 'invalid_id';
  const QUERY_STRING = 'meetingEventId=' + encodeURIComponent(MEETING_EVENT_ID); 
  const ERROR_RESPONSE = {
    status: 404, 
    messsage: 'Some error message'
  };
  const MEETING_EVENT_DATA = {
    meetingName: 'Christmas',
    durationMins: '30',
    durationHours: '1',
    timeFindMethod: 'manual',
    guestList: ['guest1@gmail.com', 'guest2@gmail.com', 'another@guest.com'],
    meetingTimeIds: ['abcd1234', 'efgh5678'],
  };

  beforeEach(function() {
    spyOn(window, 'fetch').and.callFake(async function(url) {
      // Assume all fetches other than the hardcoded const QUERY_STRING 
      // to be invalid 
      if (url !== MeetingEventDAO.endpoint + QUERY_STRING) {
        return new Response(JSON.stringify(ERROR_RESPONSE), null);
      } else {
        return new Response(JSON.stringify(MEETING_EVENT_DATA), null);
      }
    })
  }); 

  it ('Throws an exception if the meetingEventId param is not provided', async function() {
    let errorMessage;
    try {
      await MeetingEventDAO.fetchMeetingEvent();
    } catch (error) {
      errorMessage = error.message;
    }
    expect(errorMessage).toEqual(INSUFFICIENT_REQUEST_PARAM);
  });

  it('Returns a JSON object with the meeting event data on success', async function () {
    let result = await MeetingEventDAO.fetchMeetingEvent(MEETING_EVENT_ID);
    expect(result).toEqual(MEETING_EVENT_DATA);
    expect(window.fetch).toHaveBeenCalledWith(
      MeetingEventDAO.endpoint + QUERY_STRING
    );
  });

  it('Returns the error response sent by the server on failure', async function () {
    // Failures include non-existent or invalid MeetingTimeIds
    let result = await MeetingEventDAO.fetchMeetingEvent(INVALID_ID);
    expect(result).toEqual(ERROR_RESPONSE);
    expect(window.fetch).toHaveBeenCalledWith(
      MeetingEventDAO.endpoint + 'meetingEventId=' + INVALID_ID
    );
  });

  it('Throws an error if the meetingEventId param type is not a string', async function () {
    let errorMessage;
    try {
      await MeetingEventDAO.fetchMeetingEvent(123);
    } catch (error) {
      errorMessage = error.message;
    }
    expect(errorMessage).toEqual(INVALID_PARAM_TYPE);
  });
});

describe ('MeetingEventDAO - newMeetingEvent', function() {
  const MEETING_EVENT_ID = 'qwerty12345'; 
  // Note that encodeURIComponenet encodes spaces to %20, 
  // but URLSearchParam used in MeetingEventDAO class encodes 
  // spaces to +. Therefore, just hardcode URLSearchParam result 
  // and save as MEETING_NAME_URI constant.
  const MEETING_NAME = 'Christmas Lunch'; 
  const MEETING_NAME_URI = 'Christmas+Lunch'; 
  const DURATION_MINS = '30'; 
  const DURATION_HOURS = '1'; 
  const TIME_FIND_METHOD = 'manual';
  const GUEST_LIST = ['guest1@gmail.com', 'guest2@gmail.com', 'another@guest.com'];
  const MEETING_TIMES = ['2021-01-25T17:52', '2021-02-25T17:52'];
  const MEETING_TIME_IDS = ['abcd1234', 'efgh5678']; 
  const QUERY_STRING = 'meetingName=' + MEETING_NAME_URI +  
    '&durationMins=' + DURATION_MINS + '&durationHours=' + DURATION_HOURS + 
    '&timeFindMethod=' + TIME_FIND_METHOD + '&guestList=' + encodeURIComponent(GUEST_LIST) + 
    '&meetingTimeIds=' + encodeURIComponent(MEETING_TIME_IDS);
  const RESPONSE_INIT = {method: 'POST'};

  beforeEach(function() {
    spyOn(window, 'fetch').and.callFake(async function(url, init) {
      return new Response(JSON.stringify(MEETING_EVENT_ID), RESPONSE_INIT); 
    });

    spyOn(MeetingEventDAO, 'getMeetingName').and.returnValue(MEETING_NAME); 
    spyOn(MeetingEventDAO, 'getDurationMins').and.returnValue(DURATION_MINS); 
    spyOn(MeetingEventDAO, 'getDurationHours').and.returnValue(DURATION_HOURS); 
    spyOn(MeetingEventDAO, 'getTimeFindMethod').and.returnValue(TIME_FIND_METHOD); 
    spyOn(MeetingEventDAO, 'getGuestList').and.returnValue(GUEST_LIST); 
    spyOn(MeetingEventDAO, 'getMeetingTimes').and.returnValue(MEETING_TIMES);
    spyOn(MeetingEventDAO, 'getMeetingTimeIds').and.returnValue(MEETING_TIME_IDS);    
  });

  it ('Returns a JSON string with the meetingEventId of the new meetingEvent entity', async function() {
    let result = await MeetingEventDAO.newMeetingEvent();
    expect(result).toEqual(MEETING_EVENT_ID);
    expect(window.fetch)
        .toHaveBeenCalledWith(MeetingEventDAO.endpoint + QUERY_STRING, RESPONSE_INIT);
  });
});
