const MAX_TIME_INPUTS = 5; // Allow up to 5 proposed times
var timeInputs = 1; // Current number of time inputs on page
const MEETING_TIME_NAME_PREFIX = 'meeting-time-'; // The prefix of the sessionStorage key name for meeting times
var timeNameSuffix = 1; // The suffix appended to MEETING_TIME_NAME_PREFIX to make the name unique
const MAX_TIME_INPUT_REACHED_ALERT = 'Maximum number of proposed times: ' + MAX_TIME_INPUTS.toString();
const TIME_INPUT_FIELD_INDEX = 1; // The index of the <input> field with its parent div
var enteredTimes = new Set();

/**
 * Called onload to set the minimum time users can input into the <input> with
 * name 'meeting-time-1' (default input visible on page load) to the current 
 * date and time, and also sets the onchange property to 
 * 'TimeProposalUtil.rectifyInputtedTime(this, enteredTimes)', which will prevent
 * user from inputting invalid times.
 * @param {Document} document the document that this function operates on.
 */
function setMinDatetime(document) {
  let defaultTimeInput = document.getElementsByName('meeting-time-1').item(0);
  defaultTimeInput.min = TimeProposalUtil.getDatetimeNow();
  defaultTimeInput.onchange = function() {TimeProposalUtil.rectifyInputtedTime(this, enteredTimes)};
}

/**
 * Adds a time input field and corresponding delete button to the meeting-time-inputs div.
 * @param {Document} document the document that this function operates on.
 */
function addTimeInput(document) {
  if (timeInputs >= MAX_TIME_INPUTS) {
    alert(MAX_TIME_INPUT_REACHED_ALERT);
    return;
  }

  timeInputs++
  // Show delete buttons when it has reached 2 time inputs on the page
  if (timeInputs === 2) {
    toggleDeleteButtons(document, true);
  }
  timeNameSuffix++
  
  let inputDiv = document.getElementById('meeting-time-inputs');
  let inputField = document.createElement('input');
  inputField.type = 'datetime-local';
  inputField.name = MEETING_TIME_NAME_PREFIX + timeNameSuffix.toString();
  // restrict potential meeting times to future dates only
  let minDate = TimeProposalUtil.getDatetimeNow();
  inputField.min = minDate;
  // whenever user changes the input value, check what the time they inputted to be valid
  inputField.onchange = function() {TimeProposalUtil.rectifyInputtedTime(this, enteredTimes);};

  let label = document.createElement('label');
  label.htmlFor = inputField.name;
  label.innerText = 'New Time';

  let deleteButton = document.createElement('button');
  deleteButton.innerText = '-';
  deleteButton.className = 'delete-time-button';
  deleteButton.onclick = function() {deleteTimeInput(document, inputField.name);}; 
  
  let allChildren = [label, inputField, deleteButton];
  let enclosingDiv = createEnclosingDiv(allChildren);
  enclosingDiv.id = inputField.name; // ID of div = name of input field, to faciliate deleting
  inputDiv.appendChild(enclosingDiv);
}

/**
 * Creates a <div> element enclosing the child elements
 * provided. Note that the children elements are appended to
 * the <div> in the order they appear in the Array.
 * @param {Array} children the array of child elements to append to
 * the enclosing <div>, in order. 
 * @returns the <div> element with all the child elements appended.
 */
function createEnclosingDiv(children) {
  let enclosingDiv = document.createElement('div');
  children.forEach(child => enclosingDiv.append(child));
  return enclosingDiv;
}

/**
 * Deletes the input div which encloses the datetime-input <input> element, the 
 * <label> for the <input> and the '-' delete button.
 * @param {Document} document the document that this function operates on.
 * @param {string} inputDivId the id of the div to delete. If invalid or not provided,
 * this function will do nothing.
 */
function deleteTimeInput(document, inputDivId) {
  if (inputDivId === null) { // No input ID given
    return;
  }
  let inputDiv = document.getElementById(inputDivId);
  if (inputDiv == null) { // Input ID is invalid (e.g. does not exist)
    return;
  }
  let inputField = inputDiv.children.item(TIME_INPUT_FIELD_INDEX);
  enteredTimes.delete(inputField.value);
  inputDiv.remove();
  timeInputs--; 
  // Hide delete buttons if they only have one time input left
  if (timeInputs === 1) {
    toggleDeleteButtons(document, false);
  }
}

/**
 * Hides or shows the buttons with className 'delete-time-button'.
 * Shows buttons if they're hidden, and vice-versa.
 * Hides buttons by setting buttonElement.style.display to 'none', 
 * and shows the buttons by setting buttonElement.style.display to
 * 'inline'.
 * If no buttons on the page were found with className 'delete-time-button',
 * this function will do nothing.
 * @param {Document} document the document that this function operates on.
 * @param {boolean} display true if the buttons are to be displayed, false otherwise
 */
function toggleDeleteButtons(document, display) {
  let deleteButtons = document.getElementsByClassName('delete-time-button');
  let displayValue;
  if (display) {
    displayValue = 'inline';
  } else {
    displayValue = 'none';
  }
  for (let i = 0; i < deleteButtons.length; i++) {
    deleteButtons[i].style.display = displayValue;
  }
}

/**
 * Saves the proposed times to Session Storage, and redirects to the next step
 * in the create meeting process. Please see saveMeeting() in create-meeting-shared.js
 */
function saveTimes() {
  try {
    if (saveMeeting()) {
      location.href = 'create-meeting-step3.html'; 
    }
  } catch(err) {
    alert(err.message);
  }
}
