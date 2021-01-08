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
