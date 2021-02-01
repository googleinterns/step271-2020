function toggleMeetingDisplay() {
  LoginStatus.doGet().then((loginStatus) => {
    let meetingName = document.getElementById('meeting-title');
    let meetingTimes = document.getElementById('vote-meeting-times'); 
    let meetingLocations = document.getElementById('vote-meeting-locations'); 
    let votesTable = document.getElementById('votes-table'); 
    let prompt; 
    
    if (loginStatus.loggedIn === 'true') {
      meetingName.style.display = 'block';
      meetingTimes.style.display = 'block';
      meetingLocations.style.display = 'block';
      votesTable.style.display = 'block';
      prompt = '<a href=' + loginStatus.logoutUrl + '>Logout</a>';
      document.getElementById('login-or-logout-prompt').innerHTML = prompt;
    } else {
      meetingName.style.display = 'none';
      meetingTimes.style.display = 'none';
      meetingLocations.style.display = 'none';
      votesTable.style.display = 'none';
      prompt = '<p>Please log in to view the meeting event details</p>'
      + '<a href=' + loginStatus.loginUrl + '>Login</a>';
      document.getElementById('login-or-logout-prompt').innerHTML = prompt;
    }
  });
}
