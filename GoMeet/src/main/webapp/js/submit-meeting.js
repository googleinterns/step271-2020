async function submitMeeting() {
  // Create a meeting event entity and save to Datastore
  let response = await MeetingEventDAO.newMeetingEvent();
  let meetingEventId = response['meetingEventId'];
  if (meetingEventId === null || meetingEventId === undefined) {
    throw new Error(UNABLE_TO_SUBMIT_MEETING); 
  } else {
    displayMeetingCreatedMsg(); 
    // Get the guest list so that it can be passed to send email function 
    let guestList = MeetingEventDAO.getGuestList();
    let status = await EmailDAO.inviteGuestsToMeeting(meetingEventId, guestList);
    displayGuestList(guestList, status);
    displayMeetingEventLink(meetingEventId); 
  }
}

// Adds a message to the document notifying the user that the meeting event 
// has been created 
function displayMeetingCreatedMsg() {
  let createdMeetingMsg = document.createElement('h3'); 
  createdMeetingMsg.innerText = 'Meeting Event Created!';
  document.getElementById('message').appendChild(createdMeetingMsg);
}

// Displays the results from attempting to send email invitations to 
// the guest list
function displayGuestList(guestList, status) {
  let sent = [];
  let failed = [];

  // Sort the guest list into 2 arrays: 
  // sent - emails were sent successfully to these addresses 
  // failed - emails were unable to be sent to these addresses 
  for (let i = 0; i < guestList.length; i++) {
    if (status[guestList[i]]) {
      sent.push(guestList[i]);
    } else {
      failed.push(guestList[i]);
    }
  }

  // Display the sent status data on the html page 
  if (sent.length == 0) { // No emails were sent successfully 
    document.getElementById('failed-text').innerText = 
        'Unable to sent invitations to the guest list'; 
  } else if (failed.length == 0) { // All emails were sent successfully 
    document.getElementById('sent-text').innerText = 
        'All invitations were sent successfully to the guest list'; 
  } else { // Some emails were sent successfully, some were not 
    document.getElementById('sent-text').innerText = 'Invitations were sent successfully to:'; 
    document.getElementById('failed-text').innerText = 'Failed to sent invitiations to:'; 
    addToList(sent, 'sent-list'); 
    addToList(failed, 'failed-list'); 
  }
}

// Displays the link to the newly created meeting event page 
function displayMeetingEventLink(meetingEventId) {
  let url = "/meeting-event.html?meetingEventId=" + meetingEventId; 
  let a = document.createElement('a'); 
  let linkText = document.createTextNode('Meeting Event Link'); 
  a.appendChild(linkText); 
  a.href = url; 
  document.getElementById('meeting-event-link').appendChild(a); 
}

// Adds list elements to the given unsorted list element on the DOM
function addToList(list, ul) {
  for (let i = 0; i < list.length; i++) {
    let listItem = document.createElement('li'); 
    listItem.innerText = list[i]; 
    document.getElementById(ul).appendChild(listItem); 
  }
}
