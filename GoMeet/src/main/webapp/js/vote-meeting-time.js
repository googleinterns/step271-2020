let MAX_VOTES = 3; // users can vote up to MAX_VOTES times

/**
 * Returns the logged in user's email from the LoginServlet, or
 * null if the user is not logged in.
 * @returns the email of the current logged in user.
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
 * @param {Array[String]} meetingTimeIds the array of meetingTimeIds 
 * that are the meeting times associated with this Meeting
 * @returns the array of timeData retrieved via GET request from the 
 * '/meeting-time' endpoint, in the format: 
 * [{meetingTimeId: id, datetime: datetimeStr, voteCount: count, voters: [voters]}]
 */
async function fetchAndProcess(meetingTimeIds) {
  let currentUser = await getLoggedInUser();
  if (currentUser === null) {
    return null; // Do not generate the voting form if the user is not logged in
  }

  if (!(meetingTimeIds instanceof Array)) {
    throw new Error(INVALID_PARAM_TYPE);
  }

  let timeData = [];
  let votedTimes = new Set(); // Times that the user has voted for, so cannot vote them again
  for (let i = 0; i < meetingTimeIds.length; i++) {
    let time = await MeetingTimeDAO.fetchMeetingTime(meetingTimeIds[i]);
    if ('status' in time && parseInt(time.status) !== 200) {
      // NOTE: Error responses from the DAO are internal errors that the user cannot deal with, 
      // so don't alert them, but also don't crash the program or stop execution either.
      // Hence not throwing an error (which stops execution), but logging it.
      console.error(
        "ERROR " +
          time.status +
          " " +
          time.message +
          " - MeetingTimeId: " +
          meetingTimeIds[i]
      );
    } else {
      time.id = meetingTimeIds[i]; // store the meetingId with the time to identify them later
      // add time Id to the votedTimes if logged in user has voted for it
      if (time.voters.includes(currentUser)) {
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
 * @param {Array[Object]} timeData an array of timeData objects
 * retrieved from the '/meeting-time' servlet via GET request, in 
 * the format:
 * {meetingTimeId: id, datetime: datetimeStr, voteCount: count, voters: [voters]}
 */
function generateVoteTimeForm(timeData, currentUser, votedTimes) {
  let votingRight = true;
  if (votedTimes.size === MAX_VOTES) {
    votingRight = false; // user may not vote again if they have voted maximum times
  }
  // disable all vote buttons for users that have voted MAX_VOTES already
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

    // Clicking on this button will cast a vote for this meeting time
    let voteFormCell = timeRow.insertCell(3);
    let voteButton = document.createElement('button');
    voteButton.id = time.id;
    voteButton.onclick = function() {voteTime(time.id, currentUser)};
    if (votedTimes.has(time.id)) {
      // always disable buttons of times the user has voted for already
      voteButton.disabled = true;
    } else {
      voteButton.disabled = disabledState;
    }
    voteFormCell.appendChild(voteButton);
  }
}

/**
 * Sorts the timeData objects given by their 'voteCount'
 * property in descending order
 * @param {Array[Object]} timeData an array of timeData objects
 * retrieved from the '/meeting-time' servlet via GET request, in 
 * the format:
 * {meetingTimeId: id, datetime: datetimeStr, voteCount: count, voters: [voters]}
 */
function sortTimesbyVotes(timeData) {
  // sort the times by votes, in decreasing order
  timeData.sort((time1, time2) => {
    if (time1.voteCount > time2.voteCount) {
      return -1;
    }
    if (time1.voteCount < time2.voteCount) {
      return 1;
    }
    // voteCounts equal
    return 0;
  });
}

/**
 * Increments the vote count for the MeetingTime with the id
 * given. Stores the new vote count, and the email of the user 
 * that voted to Datastore.
 * @param {String} id The id of the meeting time voted for
 * @param {String} currentUser The user that is currently logged in,
 * and who is voting
 */
async function voteTime(id, currentUser) {
  await VoteMeetingTimeDAO.voteMeetingTime(id, currentUser);
}
