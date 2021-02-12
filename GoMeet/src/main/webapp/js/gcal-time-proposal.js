/**
 * Clears the 'period-start' and 'period-end' input fields and alerts the user, 
 * if the user entered times where the 'period-end' is earlier than 'period-start', 
 * or if any one of the times is in the past.
 * Otherwise, if both 'period-start and 'period-end' are valid, calls the 
 * GoogleCalendarTimesDAO to fetch the automatically generated meeting times.
 */
async function generateTimes() {
  // Verify that both start and end are in the future, and
  // that end is later than start by at least 1 minute.
  let startInput = document.getElementById('period-start');
  let endInput = document.getElementById('period-end');
  if (startInput.value !== '' && endInput.value !== '' &&
      rectifyTimeBoundaries(startInput.value, endInput.value)) {
    // Call the DAO function to fetch times from the servlet and display
    displayAutoGeneratedTimes(
        await GoogleCalendarTimesDAO.findTimes(startInput.value, endInput.value)
    );
  } else {
    // Clear both inputs and alert the user 
    startInput.value = '';
    endInput.value = '';
    alert(INVALID_TIME_PERIOD);
  }
}

/**
 * Returns true or false whether start and end times are in the future, 
 * and whether end is later than start.
 * @param {String} start The start time, in the format yyyy-MM-ddTHH:mm.
 * @param {String} end The end time, in the format yyyy-MM-ddTHH:mm
 * @return True if both start and end are times in the future from now, 
 * AEDT, and if end is later than start. Otherwise returns false.
 */
function rectifyTimeBoundaries(start, end) {
  // Verify that both start and end are in the future, and
  // that end is later than start by at least 1 minute.
  let startDate = new Date(start);
  let endDate = new Date(end);
  if (TimeProposalUtil.verifyFutureTime(start) &&
      TimeProposalUtil.verifyFutureTime(end) &&
      endDate > startDate) {
    return true;
  } else {
    return false;
  }
}

/**
 * Displays the server response to the HTML page, in the
 * 'generated-times' div. 
 * Will display the error message and button to redirect to the 
 * manual time proposal page, if serverResponse is an error response, 
 * otherwise will display each of the times as returned by the server.
 * @param {Object} serverResponse The response from the 'gcal-find-times' 
 * server.
 */
function displayAutoGeneratedTimes(serverResponse) {
  let displayDiv = document.getElementById('generated-times');

  if ('status' in serverResponse && parseInt(serverResponse.status) !== 200) {
    // If response is an error message, display the error message 
    // and allow user to redirect to manual time proposal page.
    let errorMessage = 'Unable to generate times. Server responsed with a message: ' + 
        serverResponse.status + ' ' +
        serverResponse.message + '\n' + 
        'Click button to manually propose times instead.';
    
    let errorMessagePara = document.createElement('p');
    errorMessagePara.innerText = errorMessage;
    
    let redirectButton = document.createElement('button');
    redirectButton.click = 'location.href = "create-meeting-step2-manual.html"';
    redirectButton.innerHTML = 'Manually Propose Times'

    displayDiv.appendChild(errorMessagePara);
    displayDiv.appendChild(redirectButton);
  } else {
    // Otherwise, display the times, one time per <p> element
    // TODO: Can extend the functionality to allow users
    // to modify the times (e.g. delete times they do not want)
    for (let i = 0; i < serverResponse.length; i++) {
      // Each time string returned will be in the format:
      // yyyy-MM-ddTHH:mm:ss.sssZ (RCF3339 standard)

      // Remove the 'Z' indicating UTC time and seconds and milliseconds, 
      // since the the time is to be in local time, we don't need that 
      // level of granularity. 
      // First, remove the milliseconds and 'Z', after the '.'
      let timeStr = serverResponse[i].split('.')[0];
      // Then, remove the seconds (':ss').
      timeStr = timeStr.substring(0, timeStr.length - 3);

      let paraElem = document.createElement('p');
      paraElem.innerText = timeStr;
      displayDiv.appendChild(paraElem);
    }
  }
}
