const MAX_HOURS = 23; // maximum number of hours in hour input of meeting duration
const MAX_MINS = 59; // max number of minutes in minute input of meeting duration
const ZERO_DURATION_ALERT = 'Duration should be at least 1 minute';
const INVALID_DURATION_ALERT = 'Please input a valid duration: 0-23 hours 0-59 minutes';

/**
 * Validate that the hours and minutes entered for meeting duration are 
 * valid.
 * The duration should at least be 1 minute, and hours is a value 0-23
 * and minutes 0-59. Alerts the user to input valid value(s)
 * @returns true if duration is valid, false otherwise.
 */
function validateDuration() {
  let hours = document.getElementById('duration-hours').value;
  let mins = document.getElementById('duration-mins').value;
  if (hours === '' || mins === '') {
    alert(FILL_ALL_FIELDS_ALERT);
    return false;
  }
  hours = parseInt(hours);
  mins = parseInt(mins);
  if (hours === 0 && mins === 0) {
    alert(ZERO_DURATION_ALERT);
    return false;
  } else if (hours < 0 || hours > MAX_HOURS || mins < 0 || mins > MAX_MINS) {
    alert(INVALID_DURATION_ALERT);
    return false;
  }
  return true;
}

/**
 * Sets the duration and meeting time finding method for this meeting,
 * by saving the duration and method to session storage, and redirects
 * to the next step in the create meeting sequence.
 */
function saveDurationAndMethod() {
  if (validateDuration() && saveMeeting()) {
    location.href = 'create-meeting-step2-manual.html';
  }
}
