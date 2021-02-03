describe ('toggleMeetingDisplay', function() {
  const LOGGED_IN_RESPONSE = {
    loggedIn: 'true',
    logoutUrl: '/_ah/logout?continue\u003d%2Fmeeting-event.html',
  };

  const LOGGED_OUT_RESPONSE = {
    loggedIn: 'false',
    loginUrl: '/_ah/login?continue\u003d%2Fmeeting-event.html',
  };

  afterAll(function() {
    // Hide all the divs so that it doesn't interfere with the test GUI
    document.getElementById('meeting-title').style.display = 'none';
    document.getElementById('vote-meeting-times').style.display = 'none';
    document.getElementById('vote-meeting-locations').style.display = 'none';
    document.getElementById('votes-table').style.display = 'none';
    document.getElementById('login-or-logout-prompt').style.display = 'none'; 
  })

  it ('Should show all the meeting details if the user is logged in', async function() {
    spyOn(LoginStatus, 'doGet').and.returnValue(new Promise((resolve, reject) => {
      resolve(LOGGED_IN_RESPONSE);
    }));

    const meetingName = document.getElementById('meeting-title');
    const meetingTimes = document.getElementById('vote-meeting-times');
    const meetingLocations = document.getElementById('vote-meeting-locations');
    const votesTable = document.getElementById('votes-table');
    
    await toggleMeetingDisplay();

    expect(meetingName.style.display).toBe('block');
    expect(meetingTimes.style.display).toBe('block'); 
    expect(meetingLocations.style.display).toBe('block'); 
    expect(votesTable.style.display).toBe('block');
  });

  it ('Should hide all the meeting details if the user is not logged in', async function() {
    spyOn(LoginStatus, 'doGet').and.returnValue(new Promise((resolve, reject) => {
      resolve(LOGGED_OUT_RESPONSE);
    }));

    const meetingName = document.getElementById('meeting-title');
    const meetingTimes = document.getElementById('vote-meeting-times');
    const meetingLocations = document.getElementById('vote-meeting-locations');
    const votesTable = document.getElementById('votes-table');
    
    await toggleMeetingDisplay();

    expect(meetingName.style.display).toBe('none');
    expect(meetingTimes.style.display).toBe('none'); 
    expect(meetingLocations.style.display).toBe('none'); 
    expect(votesTable.style.display).toBe('none');
  });
});
