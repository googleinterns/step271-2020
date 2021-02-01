function toggleMeetingDisplay() {
  LoginStatus.doGet().then((loginStatus) => {
    let prompt; 
    let style; 
    if (loginStatus.loggedIn === 'true') {
      style = 'block'; 
      prompt = '<a href=' + loginStatus.logoutUrl + '>Logout</a>';
      document.getElementById('login-or-logout-prompt').innerHTML = prompt;
    } else {
      style = 'none'; 
      prompt = '<p>Please log in to view the meeting event details</p>'
      + '<a href=' + loginStatus.loginUrl + '>Login</a>';
      document.getElementById('login-or-logout-prompt').innerHTML = prompt;
    }
    document.getElementById('meeting-title').style.display = style.valueOf();
    document.getElementById('vote-meeting-times').style.display = style.valueOf();
    document.getElementById('vote-meeting-locations').style.display = style.valueOf();
    document.getElementById('votes-table').style.display = style.valueOf();
  });
}
