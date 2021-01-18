const MAX_TIME_INPUTS = 5; // Allow up to 5 proposed times
var timeInputs = 1; // Current number of time inputs on page
const MEETING_TIME_NAME_PREFIX = 'meeting-time-'; // The prefix of the sessionStorage key name for meeting times
var timeNameSuffix = 1; // The suffix appended to MEETING_TIME_NAME_PREFIX to make the name unique

/**
 * Adds a time input field to the page in the meeting-time-inputs div.
 */
function addTimeInput() {
  if (timeInputs >= MAX_TIME_INPUTS) {
    alert('Maximum number of proposed times: ' + MAX_TIME_INPUTS.toString());
    return;
  }
  timeInputs++
  timeNameSuffix++
  
  let inputDiv = document.getElementById('meeting-time-inputs');
  let enclosingDiv = document.createElement('div');

  let inputField = document.createElement('input');
  inputField.type = 'datetime-local';
  inputField.name = MEETING_TIME_NAME_PREFIX + timeNameSuffix.toString();
  
  let label = document.createElement('label');
  label.htmlFor = inputField.name;
  label.innerText = 'New Time';
  
  enclosingDiv.appendChild(label);
  enclosingDiv.appendChild(inputField);
  inputDiv.appendChild(enclosingDiv);
}
