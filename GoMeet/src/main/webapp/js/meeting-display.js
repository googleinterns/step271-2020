/**
 * Toggles meeting event display depending on login status of user.
 */
function toggleMeetingDisplay() {
  LoginStatus.doGet().then((loginStatus) => {
    let prompt; 
    let style; 
    if (loginStatus.loggedIn === 'true') {
      style = 'block'; 
      prompt = '<a href=' + loginStatus.logoutUrl + '>Logout</a>';
    } else {
      style = 'none'; 
      prompt = '<p>Please log in to view the meeting event details</p>'
      + '<a href=' + loginStatus.loginUrl + '>Login</a>';
    }
    document.getElementById('meeting-title').style.display = style;
    document.getElementById('vote-meeting-times').style.display = style;
    document.getElementById('vote-meeting-locations').style.display = style;
    document.getElementById('votes-table').style.display = style;
    document.getElementById('login-or-logout-prompt').innerHTML = prompt;
  });
}

/**
 * Generates an error message string of the format:
 * "ERROR: errorResponse.status errorResponse.message".
 * @param {Object} errorResponse The error response object returned from 
 * a DAO.
 * @returns The string of the format "ERROR: errorResponse.status 
 * errorResponse.message"
 */
function generateErrorMessage(errorResponse) {
  let message = "ERROR " + errorResponse.status + " " + errorResponse.message;
  return message;
}

/**
 * Returns the meetingEventId value from the URL of the current
 * displayed page. 
 * Assumes that the URL has a query string of the format: 
 * meetingEventId=ID
 * @returns The String meetingEventId retrieved from the URL
 */
function getMeetingEventId() {
  // Create an anchor element with the current URL.
  // The query string of the URL (INCLUDING the '?') can 
  // then be accessed via element.search.
  let parser = document.createElement('a');
  parser.href = getCurrentURL();
  let query = parser.search.substring(1); // Discard the '?' at position 0 .
	let vars = query.split('&');
	for (let i = 0; i < vars.length; i++) {
    // Disregard all pairs unless it is the meetingEventId.
    let pair = vars[i].split('=');
    if (pair[0] === 'meetingEventId') { 
      return decodeURIComponent(pair[1]); 
    }
  }
  return null;
}

/**
 * Returns the current URL, as stored in window.location.href.
 * 
 * This function will make it easier to test functions 
 * (e.g. getMeetingEventId) that depend on window.location.href - 
 * mock this function to control the value in window.location.href.
 * 
 * @returns The value stored in window.location.href
 */
function getCurrentURL() {
  return window.location.href;
}
