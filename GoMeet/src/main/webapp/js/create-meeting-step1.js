let guestsAdded = 0; // Number of guest email inputs on the page 

/**
 * Add an input element to the guest list for user to add email 
 * @param {Document} doc the document object to be manipulated 
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
  * @param {String} guest the id of the 'li' element to be removed
  * @param {Document} doc the document object to be manipulated 
  */
 function removeGuest(guest, doc) {
  doc.getElementById(guest).remove();
}

/**
 * Checks whether all the email input elements on the document are valid
 * Note: Server side checks will also be made to validate emails 
 * @param {Document} doc the document object containing the email inputs
 */
function validateEmails(doc) {
  let allInputs = doc.getElementsByTagName('INPUT');

  for (let i = 0; i < allInputs.length; i++) {
    if (allInputs.item(i).type === 'email') {
      if (allInputs.item(i).value === '') {
        throw(new Error(BLANK_FIELDS_ALERT)); 
      } else if (!isValidEmail(allInputs.item(i).value)) {
        throw(new Error(INVALID_EMAILS_ALERT));
      }
    }
  }
  return true; 
}

/**
 * Checks whether the given email address is valid according to the 
 * regular expression pattern 
 * @param {String} address the email address to be validated 
 */
function isValidEmail(address) {
  const regex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
  return regex.test(address.toLowerCase());
}

/**
 * Saves the meeting name, host email and guest emails to session
 * storage, and redirects to the next step in the create meeting sequence.
 * @param {Document} doc the document object containing the user inputs
 */
 function saveStepOneToSessionStorage(doc) {
  try {
    if (validateEmails(doc) && saveMeeting()) {
      location.href = 'create-meeting-step2.html';
    }
  } catch(err) {
    alert(err.message);
  }
}
