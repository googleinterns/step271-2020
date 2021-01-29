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
}
