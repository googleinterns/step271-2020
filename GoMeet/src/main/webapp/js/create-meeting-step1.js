let guestsAdded = 0; // Number of guest email inputs on the page 

/**
 * Add an input element to the guest list for user to add email 
 * @param {*} doc the document object to be manipulated 
 */
function addGuest(doc) {
  guestsAdded += 1; 
  let listItem = doc.createElement('li');
  let guestNumber = guestsAdded; 
  listItem.id = 'guest-' + guestNumber; 

  let newTextInput = doc.createElement('input'); 
  newTextInput.type = 'email';
  newTextInput.name = 'guest-' + guestNumber

  let newInputLabel = doc.createElement('label');
  newInputLabel.htmlFor = 'guest-' + guestNumber;
  newInputLabel.innerText = 'Guest: ';

  // delete button associated with this guest
  let removeGuestButton = doc.createElement('button');
  removeGuestButton.innerText = 'X';
  removeGuestButton.addEventListener('click', ()=>(removeGuest(listItem.id, doc)));

  listItem.appendChild(newInputLabel);
  listItem.appendChild(newTextInput);
  listItem.appendChild(removeGuestButton);

  let guestList = doc.getElementById('guest-list');
  guestList.appendChild(listItem);
}

 /**
  * Remove the guest email from the list and update the id's of the remaining guests
  * @param {*} guest the id of the 'li' element to be removed
  * @param {*} doc the document object to be manipulated 
  */
 function removeGuest(guest, doc) {
  doc.getElementById(guest).remove();
}
