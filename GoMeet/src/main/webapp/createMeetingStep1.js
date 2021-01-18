let guestsAdded = 0; // Number of guest email inputs on the page 

function addGuest() {
  guestsAdded += 1; 
  let listItem = document.createElement('li');
  let guestNumber = guestsAdded; 
  listItem.id = 'guest-' + guestNumber; 

  let newTextInput = document.createElement('input'); 
  newTextInput.type = 'text';
  newTextInput.name = 'guest-' + guestNumber

  let newInputLabel = document.createElement('label');
  newInputLabel.htmlFor = 'guest-' + guestNumber;
  newInputLabel.innerText = 'Guest: ';

  // delete button associated with this guest
  let removeGuestButton = document.createElement('button');
  removeGuestButton.innerHTML = 'X';
  removeGuestButton.addEventListener('click', function() {removeGuest(listItem.id);});

  listItem.appendChild(newInputLabel);
  listItem.appendChild(newTextInput);
  listItem.appendChild(removeGuestButton);

  let guestList = document.getElementById('guest-list');
  guestList.appendChild(listItem);
}

/**
 * Remove the guest email from the list and update the id's of the remaining guests
 * @param {} guest the id of the 'li' element to be removed
 */
function removeGuest(guest) {
  document.getElementById(guest).remove();
}
