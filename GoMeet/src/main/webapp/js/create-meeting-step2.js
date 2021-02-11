const MAX_HOURS = 23; // maximum number of hours in hour input of meeting duration
const MAX_MINS = 59; // max number of minutes in minute input of meeting duration

/**
 * Validate that the hours and minutes entered for meeting duration are 
 * valid.
 * The duration should at least be 1 minute, and hours is a value 0-23
 * and minutes 0-59. Alerts the user to input valid value(s)
 * @returns true if duration is valid, otherwise throws an Error.
 */
function validateDuration() {
  let hours = document.getElementById('duration-hours').value;
  let mins = document.getElementById('duration-mins').value;
  if (hours === '' || mins === '') {
    throw(new Error(BLANK_FIELDS_ALERT));
  }
  hours = parseInt(hours);
  mins = parseInt(mins);
  if (hours === 0 && mins === 0) {
    throw(new Error(ZERO_DURATION_ALERT));
  } else if (hours < 0 || hours > MAX_HOURS || mins < 0 || mins > MAX_MINS) {
    throw(new Error(INVALID_DURATION_ALERT));
  }
  return true;
}

/**
 * Sets the duration and meeting time finding method for this meeting,
 * by saving the duration and method to session storage, and redirects
 * to the next step in the create meeting sequence.
 */
function saveDurationAndMethod() {
  try {
    if (validateDuration() && saveMeeting()) {
      // Check whether the user selected 'manual' or 'gcal' 
      // as their time find method. 
      let method = sessionStorage.getItem("time-find-method");
      if (method === 'gcal') {
        location.href = 'create-meeting-step2-gcal.html';
      } else {
        location.href = 'create-meeting-step2-manual.html';
      } 
    }
  } catch(err) {
    alert(err.message);
  }
}
