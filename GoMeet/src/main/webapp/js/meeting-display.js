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
