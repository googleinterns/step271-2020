let MAX_VOTES = 3; // Users can vote up to MAX_VOTES times.

/**
 * Function called on page load of meeting-event.html
 * to fetch all relevant MeetingTime data from servlets 
 * and generate voting form for the MeetingTimes.
 */
async function displayMeetingTimeForm() {
  let meetingEventId = getMeetingEventId();
  let meetingEvent = await MeetingEventDAO.fetchMeetingEvent(meetingEventId);
  let meetingTimeIds = meetingEvent['meetingTimeIds']; 

  if (('status' in meetingEvent && parseInt(meetingEvent.status) !== 200) 
      || meetingTimeIds === null) {
    // Execution cannot continue unless meetingTimeIds can be retrieved. 
    // Must terminate script with an Error. 
    throw new Error(generateErrorMessage(meetingEvent) + " - MeetingEventId: " + meetingEventId);
  }; 
  
  // Prepare for re-render: reset the 'meeting-times-table' table 
  // to JUST the table headers.
  let table = document.getElementById('meeting-times-table');
  for (let i = table.rows.length - 1; i > 0; i--) {
    table.deleteRow(i);
  }
  await fetchAndProcess(meetingTimeIds);
}

/**
 * Returns the logged in user's email from the LoginServlet, or
 * null if the user is not logged in.
 * @returns The email of the current logged in user.
 */
async function getLoggedInUser() {
  let status = await LoginStatus.doGet('/user-status');
  if (status.loggedIn === 'true') {
    return status.userEmail;
  } else {
    return null;
  }
}

/**
 * Fetches the data from the MeetingTime entities represented 
 * by the meetingTimeIds, and pre-processes the data.
 * @param {Array[String]} meetingTimeIds The array of meetingTimeIds 
 * that are the meeting times associated with this Meeting
 * @returns The array of timeData retrieved via GET request from the 
 * '/meeting-time' endpoint, in the format: 
 * [{meetingTimeId: id, datetime: datetimeStr, voteCount: count, voters: [voters]}]
 */
async function fetchAndProcess(meetingTimeIds) {
  let currentUser = await getLoggedInUser();
  if (currentUser === null) {
    return null; // Do not generate the voting form if the user is not logged in.
  }

  if (!(meetingTimeIds instanceof Array)) {
    throw new Error(INVALID_PARAM_TYPE);
  }

  let timeData = [];
  let votedTimes = new Set(); // Times that the user has voted for, so cannot vote them again.
  for (let i = 0; i < meetingTimeIds.length; i++) {
    let time = await MeetingTimeDAO.fetchMeetingTime(meetingTimeIds[i]);
    if ('status' in time && parseInt(time.status) !== 200) {
      // NOTE: Error responses from the DAO are internal errors that the user cannot deal with, 
      // so don't alert them, but also don't crash the program or stop execution either.
      // Hence not throwing an error (which stops execution), but logging it.
      console.error(generateErrorMessage(time) + " - MeetingTimeId: " + meetingTimeIds[i]);
    } else {
      time.id = meetingTimeIds[i]; // Store the meetingId with the time to identify them later.
      // Add time Id to the votedTimes if logged in user has voted for it.
      if (time.voters !== null && time.voters.includes(currentUser)) {
        votedTimes.add(time.id);
      }
      timeData.push(time);
    }
  }
  generateVoteTimeForm(timeData, currentUser, votedTimes);
}

/**
 * Generates a voting form containing the MeetingTime timeData 
 * in the 'vote-meeting-times' <div>. 
 * Current logged-in user will use this form to vote on the 
 * associated meeting times.
 * @param {Array[Object]} timeData An array of timeData objects
 * retrieved from the '/meeting-time' servlet via GET request, in 
 * the format:
 * {meetingTimeId: id, datetime: datetimeStr, voteCount: count, voters: [voters]}
 */
function generateVoteTimeForm(timeData, currentUser, votedTimes) {
  let votingRight = true;
  if (votedTimes.size === MAX_VOTES) {
    votingRight = false; // User may not vote again if they have voted maximum times.
  }
  // Disable all vote buttons for users that have voted MAX_VOTES already.
  let disabledState = !votingRight; 

  sortTimesbyVotes(timeData);

  let voteTable = document.getElementById('meeting-times-table');
  
  for (let i = 0; i < timeData.length; i++) {
    let time = timeData[i];
    let timeRow = voteTable.insertRow(i + 1);

    let dateTimeCell = timeRow.insertCell(0);
    dateTimeCell.innerText = time.datetime;

    let voteCountCell = timeRow.insertCell(1);
    voteCountCell.innerText = time.voteCount;

    let votersCell = timeRow.insertCell(2);
    votersCell.innerText = time.voters;

    // Clicking on this button will cast a vote for this meeting time.
    let voteFormCell = timeRow.insertCell(3);
    let voteButton = document.createElement('button');
    voteButton.innerText = 'Vote Time'
    voteButton.id = time.id;
    voteButton.onclick = function() {voteTime(time.id, currentUser)};
    if (votedTimes.has(time.id)) {
      // Always disable buttons of times the user has voted for already.
      voteButton.disabled = true;
    } else {
      voteButton.disabled = disabledState;
    }
    voteFormCell.appendChild(voteButton);
  }
}

/**
 * Sorts the timeData objects given by their 'voteCount'
 * property in descending order.
 * NOTE: Sorting the timeData objects client-side, because likely not every single 
 * client-side use case of the timeData requires the data to be sorted in vote order. 
 * Hence, sorting the timeData server-side will add unnecessary additional complexity 
 * to the server code (and consequently the fetch() calls to the servlet).
 * @param {Array[Object]} timeData an array of timeData objects
 * retrieved from the '/meeting-time' servlet via GET request, in 
 * the format:
 * {meetingTimeId: id, datetime: datetimeStr, voteCount: count, voters: [voters]}
 */
function sortTimesbyVotes(timeData) {
  // Sort the times by votes, in decreasing order.
  timeData.sort((time1, time2) => {
    return time2.voteCount - time1.voteCount;
  });
}

/**
 * Increments the vote count for the MeetingTime with the id
 * given. Stores the new vote count, and the email of the user 
 * that voted to Datastore.
 * @param {String} id The id of the meeting time voted for.
 * @param {String} currentUser The user that is currently logged in,
 * and who is voting.
 */
async function voteTime(id, currentUser) {
  let response = await VoteMeetingTimeDAO.voteMeetingTime(id, currentUser);
  if ('status' in response && parseInt(response.status) !== 200) {
    // NOTE: Error responses from the DAO are internal errors that the user cannot deal with, 
    // so don't alert them, but also don't crash the program or stop execution either.
    // Hence not throwing an error (which stops execution), but logging it.
    console.error(generateErrorMessage(response) + " - MeetingTimeId: " + id);
  }
  // Re-render the form to update the votes.
  await displayMeetingTimeForm();
}
