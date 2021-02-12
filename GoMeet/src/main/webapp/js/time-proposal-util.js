class TimeProposalUtil {
  /**
   * Returns the ISO datestring of the local current date and time (hours and minutes),
   * with the time zone data trimmed.
   * The timezone data in the string returned by Date.toISOString() is always 'Z'
   * representing UTC time, meaning regardless of what Date() is initialised with,
   * the time is assumed to be UTC time.
   * Seconds and milliseconds are set to 0, as that level of granularity is
   * not required for the purposes of this module.
   * @returns the ISO string in the format YYYY-MM-DDTHH:MM:00:00
   */
  static getDatetimeNow() {
    let now = new Date();

    // number of minutes BEHIND that UTC time is relative to local time
    // e.g. Sydney Time is 660 minutes (11 hrs) ahead, so timezoneOffset = -660
    let timezoneOffset = now.getTimezoneOffset();

    let nowOffset = new Date(now.getTime() - timezoneOffset * 60 * 1000);
    nowOffset.setMilliseconds(0);
    nowOffset.setSeconds(0);
    nowOffset = nowOffset.toISOString();
    nowOffset = nowOffset.substring(0, nowOffset.length - 1); // trim zone data off

    return nowOffset;
  }

  /**
   * Clears the input field and alerts the user, if the user entered a time that
   * is earlier than or equal to the date and time now. See verifyUniqueFutureTime.
   * @param {Element} elem the input element where the user inputted the time
   * @param {Set} enteredTimes The set of datetime strings representing
   * all the times entered so far. Function will add 'time' to this
   * set if 'time' is unique and in the future.
   */
  static rectifyInputtedTime(elem, enteredTimes) {
    if (!TimeProposalUtil.verifyUniqueFutureTime(elem.value, enteredTimes)) {
      elem.value = "";
      alert(INVALID_TIME_ERROR);
    }
  }

  /**
   * Verify that the time is a future time relative to
   * the time now, and it is unique (i.e. not in enteredTimes).
   * If unique and in the future, add to the enteredTimes set, and
   * return true, otherwise return false.
   * @param {String} time The datetime string to be verified.
   * @param {Set} enteredTimes The set of datetime strings representing
   * all the times entered so far. Function will add 'time' to this
   * set if 'time' is unique and in the future.
   * @return true if the time is unique and in the future,
   * otherwise false
   */
  static verifyUniqueFutureTime(time, enteredTimes) {
    if (TimeProposalUtil.verifyFutureTime(time) && 
        !(enteredTimes.has(time))) {
      enteredTimes.add(time);
      return true;
    } else {
      return false;
    }
  }

  /**
   * Verifies that the time is a time in the future from now,
   * AEDT time.
   * @param {String} time The datetime string to be verified.
   * @returns True if the time is in the future, false otherwise.
   */
  static verifyFutureTime(time) {
    let timeEntered = new Date(time);
    let now = new Date(TimeProposalUtil.getDatetimeNow());
    if (!(timeEntered > now)) {
      return false;
    } else {
      return true;
    }
  }
}
