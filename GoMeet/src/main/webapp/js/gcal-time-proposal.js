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
    // Call the DAO function to fetch times from the servlet.
    await GoogleCalendarTimesDAO.findTimes(startInput.value, endInput.value);
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
