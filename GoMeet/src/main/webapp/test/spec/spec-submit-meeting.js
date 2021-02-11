describe ('Submit Meeting', function() {
  const MEETING_EVENT_ID = 'qwerty12345';  
  const NEW_MEETING_EVENT_RESPONSE = {
    meetingEventId: MEETING_EVENT_ID
  };
  const NEW_MEETING_EVENT_FAIL_RESPONSE = {
    meetingEventId: null
  };
  const RESPONSE_INIT = {method: 'POST'};
  const GUEST_LIST = ['guest1@gmail.com', 'guest2@gmail.com', 'guest3@gmail.com'];
  const EMAIL_RESPONSE = {
    'guest1@gmail.com': true, 
    'guest2@gmail.com': true, 
    'guest3@gmail.com': true
  };
  const ERROR_RESPONSE = {
    status: 400, 
    message: 'Some error message'
  };

  it ('Should call the neccessary javascript functions without throwing an error', async function() {
    // Note: The protocol variable is used to represent the dependency of the inviteGuestsToMeeting 
    // function on the success of calling newMeetingEvent
    // i.e. inviteGuestsToMeeting should only be called if protocol is 1 (signifying that 
    // newMeetingEvent returned the expected result)
    let protocol = 0; 
    let newMeetingEventSpy = spyOn(MeetingEventDAO, 'newMeetingEvent').and.callFake(async function() {
      protocol = 1; 
      return NEW_MEETING_EVENT_RESPONSE; 
    });
    let getGuestListSpy = spyOn(MeetingEventDAO, 'getGuestList').and.returnValue(GUEST_LIST); 
    let inviteGuestsToMeetingSpy = spyOn(EmailDAO, 'inviteGuestsToMeeting').and.callFake(async function() {
      if (protocol == 1) {
        return EMAIL_RESPONSE; 
      }
      return ERROR_RESPONSE; 
    });
    await submitMeeting(); 
    
    expect(newMeetingEventSpy).toHaveBeenCalled(); 
    expect(protocol).toBe(1); 
    expect(getGuestListSpy).toHaveBeenCalled(); 
    expect(inviteGuestsToMeetingSpy).toHaveBeenCalledWith(MEETING_EVENT_ID, GUEST_LIST);
  });

  it ('Should throw an error if the meeting event was unable to be created', async function() {
    // Note: The protocol variable is used to represent the dependency of the inviteGuestsToMeeting 
    // function on the success of calling newMeetingEvent
    // i.e. inviteGuestsToMeeting should not be called if protocol is 0 (signifying that 
    // newMeetingEvent was not called successfully)
    let protocol = 0; 
    let newMeetingEventSpy = spyOn(MeetingEventDAO, 'newMeetingEvent').and.callFake(async function() {
      return NEW_MEETING_EVENT_FAIL_RESPONSE;
    });
    let getGuestListSpy = spyOn(MeetingEventDAO, 'getGuestList');
    let inviteGuestsToMeetingSpy = spyOn(EmailDAO, 'inviteGuestsToMeeting');

    let errorMessage;
    try {
      await submitMeeting();
    } catch (error) {
      errorMessage = error.message;
    }
    expect(errorMessage).toEqual(UNABLE_TO_SUBMIT_MEETING);
    expect(newMeetingEventSpy).toHaveBeenCalled(); 
    expect(protocol).toBe(0); 
    expect(getGuestListSpy).not.toHaveBeenCalled(); 
    expect(inviteGuestsToMeetingSpy).not.toHaveBeenCalled(); 
  });
});

describe ('displayMeetingCreatedMsg', function() {
  const MESSAGE = 'Meeting Event Created!'; 

  beforeAll(function() {
    document.getElementById('message').innerText = ''; 
  });

  it ('Should add a h3 element with text value as "Meeting Event Created!"', function() {
    displayMeetingCreatedMsg();
    let div = document.getElementById('message');
    let elements = div.childNodes; 
    expect(elements.length).toBe(1); 
    expect(elements[0].tagName).toBe('H3'); 
    expect(elements[0].innerText).toBe(MESSAGE); 
  });
});

describe ('displayMeetingEventLink', function() {
  const MEETING_EVENT_ID = 'qwerty12345';
  const LINK = '/meeting-event.html?meetingEventId=' + MEETING_EVENT_ID;

  beforeAll(function() {
    document.getElementById('meeting-event-link').innerHTML = '';
  });

  it ('Should add a link to the meeting event html page', function() {
    displayMeetingEventLink(MEETING_EVENT_ID); 
    let div = document.getElementById('meeting-event-link'); 
    let elements = div.childNodes; 
    expect(elements.length).toBe(1); 
    expect(elements[0].tagName).toBe('A'); 
    expect(elements[0].href).toContain(LINK);  
  });
});

describe ('addToList', function() {
  const LIST_ID = 'sent-list'; 
  const LIST_ITEM_1 = 'list item 1'; 
  const LIST_ITEM_2 = 'list item 2'; 
  const LIST = [LIST_ITEM_1, LIST_ITEM_2]; 
  const EMPTY_LIST = [];

  beforeEach(function() {
    document.getElementById(LIST_ID).innerHTML = ''; 
  });

  it ('Should add one list element to a given unsorted list element', function() {
    addToList(LIST, LIST_ID); 
    let ul = document.getElementById(LIST_ID); 
    expect(ul.childNodes.length).toBe(2); 
    expect(ul.childNodes[0].innerText).toBe(LIST_ITEM_1); 
    expect(ul.childNodes[1].innerText).toBe(LIST_ITEM_2); 
    expect(ul.childNodes[0].tagName).toBe('LI'); 
    expect(ul.childNodes[1].tagName).toBe('LI'); 
  });

  it ('If the list length is 0 it should add nothing to the unsorted list element', function() {
    addToList(EMPTY_LIST, LIST_ID); 
    let ul = document.getElementById(LIST_ID); 
    expect(ul.childNodes.length).toBe(0); 
  });
});
