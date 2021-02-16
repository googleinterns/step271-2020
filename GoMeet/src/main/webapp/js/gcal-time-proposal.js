/**
 * Clears the 'period-start' and 'period-end' input fields and alerts the user, 
 * if the user entered times where the 'period-end' is earlier than 'period-start', 
 * or if any one of the times is in the past.
 * Otherwise, if both 'period-start and 'period-end' are valid, calls the 
 * GoogleCalendarTimesDAO to fetch the automatically generated meeting times, and 
 * displays the times on the HTML page.
 */
async function generateTimes() {
  // Verify that both start and end are in the future, and
  // that end is later than start by at least 1 minute.
  let startInput = document.getElementById('period-start');
  let endInput = document.getElementById('period-end');
  if (startInput.value !== '' && endInput.value !== '' &&
      verifyTimeBoundary(startInput.value, endInput.value)) {
    // Call the DAO function to fetch times from the servlet and display
    let generatedTimes = displayAutoGeneratedTimes(
      await GoogleCalendarTimesDAO.findTimes(startInput.value, endInput.value)
    );
    if (generatedTimes !== null) {
      // Setup the 'Next' button to now allow the user to progress
      setupNextButton(generatedTimes);
    } // Otherwise, the error message would be displayed.
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
function verifyTimeBoundary(start, end) {
  // Verify that both start and end are in the future, and
  // that end is later than start by at least 1 minute.
  let startDate = new Date(start);
  let endDate = new Date(end);
  return (TimeProposalUtil.verifyFutureTime(start) &&
      TimeProposalUtil.verifyFutureTime(end) &&
      endDate > startDate);
}

/**
 * Displays the server response to the HTML page, in the
 * 'generated-times' div. 
 * Will display the error message and button to redirect to the 
 * manual time proposal page, if serverResponse is an error response, 
 * otherwise will display each of the times as returned by the server.
 * @param {Object} serverResponse The response from the 'gcal-find-times' 
 * server.
 * @returns {List[String]} The list of times displayed to the user,
 * or null if the serverResponse was an error response.
 */
function displayAutoGeneratedTimes(serverResponse) {
  let displayDiv = document.getElementById('generated-times');
  // Clear whatever is in the <div>
  displayDiv.innerHTML = '';

  if ('status' in serverResponse && parseInt(serverResponse.status) !== 200) {
    // If response is an error message, display the error message 
    // and allow user to redirect to manual time proposal page.
    displayErrorMessage(serverResponse, displayDiv);
    return null;
  } 
  // Otherwise, display the times, one time per <p> element
  // TODO: Can extend the functionality to allow users
  // to modify the times (e.g. delete times they do not want)
  let generatedTimes = [];
  for (let i = 0; i < serverResponse.length; i++) {
    // Each time string returned will be in the format:
    // yyyy-MM-ddTHH:mm:ss.sssZ (RCF3339 standard)

    // Remove the timezone data and seconds and milliseconds, 
    // since the the time is to be in local time, we don't need the
    // seconds and milliseconds level of granularity
    // First, remove the milliseconds and timezone, after the '.'
    let timeStr = serverResponse[i].split('.')[0];
    // Then, remove the seconds (':ss').
    timeStr = timeStr.substring(0, timeStr.length - 3);

    let paraElem = document.createElement('p');
    paraElem.innerText = new Date(timeStr).toLocaleString('en-AU');
    displayDiv.appendChild(paraElem);
    generatedTimes.push(timeStr);
  }

  return generatedTimes;
}

/**
 * Setup the 'Next' button - enable the button and set the onclick 
 * property to call saveAutoGeneratedTimes(times).
 * See saveAutoGeneratedTimes.
 * @param {*} times The times generated by the server, to be saved
 * before the user progresses to the next step in the meeting creation
 * process.
 */
function setupNextButton(times) {
  let nextButton = document.getElementById('next-button');
  nextButton.onclick = 
      function() {saveAutoGeneratedTimes(times);redirectTo('create-meeting-step3.html');};
  nextButton.disabled = false;
}

/**
 * Saves the automatically generated times to
 * sessionStorage, and redirects the user to the next
 * step in the create meeting sequence 
 * (create-meeting-step3.html).
 * @param {List[String]} times The times strings each
 * in the format yyyy-MM-ddTHH:mm to be saved to 
 * sessionStorage.
 */
function saveAutoGeneratedTimes(times) {
  for (let i = 0; i < times.length; i++) {  
    sessionStorage.setItem('meeting-time-' + i, times[i]);
  }
}

/**
 * Redirects the user to the page as specified in 'href'.
 * Sets the location.href property to the value in 'href'.
 * @param {String} href The page to redirect to.
 */
function redirectTo(href) {
  location.href = href;
}

/**
 * Display an error message notifying user that the server was 
 * unable to auto generate times in the div provided, and a button
 * that allows the user to redirect to the manual time proposal page.
 * @param {Element} generateTimesDiv The <div> element to append the 
 * error message and button to.
 */
function displayErrorMessage(serverResponse, generateTimesDiv) {
  let errorMessage = 'Unable to generate times. Server responsed with a message: ' + 
      serverResponse.status + ' ' +
      serverResponse.message + '\n' + 
      'Click button to manually propose times instead.';

  let errorMessagePara = document.createElement('p');
  errorMessagePara.innerText = errorMessage;

  let redirectButton = document.createElement('button');
  redirectButton.onclick = function(){redirectTo('create-meeting-step2-manual.html')};
  redirectButton.innerHTML = 'Manually Propose Times'

  generateTimesDiv.appendChild(errorMessagePara);
  generateTimesDiv.appendChild(redirectButton);
}