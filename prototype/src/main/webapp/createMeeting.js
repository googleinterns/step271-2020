let meetingTimesAdded = 1; // Number of meeting time inputs on the page 

/**
 * Adds a meeting guest to ul element with id "meeting-guest"
 */
function addMeetingGuest() {
  let guestName = document.getElementById('meeting-guest').value;
  
  // Do not let submission of empty field
  if (guestName === '') {
    alert('Please enter a guest name');
    return;
  }

  // TODO: verify that the user name exists by checking in database
  
  let guest = document.createElement('li');
  guest.id = guestName;
  guest.innerText = guestName;

  // delete button associated with this guest
  let removeGuestButton = document.createElement('button');
  removeGuestButton.innerHTML = 'Remove';
  removeGuestButton.addEventListener('click', function() {removeMeetingGuest(guestName);});
  
  guest.appendChild(removeGuestButton);
  document.getElementById('guest-list').appendChild(guest);

  // clear text box
  document.getElementById('meeting-guest').value = '';
}

/**
 * Deletes a guest name 'li' element from the page with the id in guest param.
 * @param {*} guest the id of the 'li' element to be removed.
 */
function removeMeetingGuest(guest) {
  document.getElementById(guest).remove();
}

/**
 * Add a meeting time datetime-local input to the page, enclosed in 
 * a 'li' element.
 * The element appended to the DOM will have an id of 'meeting-time-NUMBER', 
 * where NUMBER equal to value of MEETING_TIMES_ADDED (which is incremented
 * each time this function is called). This is to identify the meeting time input
 * so that users may remove the meeting time. See removeMeetingTime().
 */
function addMeetingTime() {
  let listItem = document.createElement('li');
  listItem.id = 'meeting-time-' + MEETING_TIMES_ADDED; 
  MEETING_TIMES_ADDED += 1;

  let newTimeInput = document.createElement('input');
  newTimeInput.type = 'datetime-local';
  newTimeInput.name = 'meeting-time';

  let newTimeInputLabel = document.createElement('label');
  newTimeInputLabel.htmlFor = 'meeting-time';
  newTimeInputLabel.innerText = 'New Time: ';

  // delete button associated with this meeting time
  let removeTimeButton = document.createElement('button');
  removeTimeButton.innerHTML = '-';
  removeTimeButton.addEventListener('click', function() {removeMeetingTime(listItem.id);});

  listItem.appendChild(newTimeInputLabel);
  listItem.appendChild(newTimeInput);
  listItem.appendChild(removeTimeButton);

  let timeListDiv = document.getElementById('meeting-time-list')
  timeListDiv.appendChild(listItem);
}

/**
 * Removes a meeting time 'li' element with the id as given in
 * timeListItemId.
 * @param {*} timeListItemId the id of the meeting time 'li' element to be
 *     removed.
 */
function removeMeetingTime(timeListItemId) {
  document.getElementById(timeListItemId).remove();
}
