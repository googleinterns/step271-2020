class GoogleCalendarTimesDAO {
  /** 
   * Data Access Object for the servlet at gcal-find-times endpoint, 
   * that automatically proposes meeting times. 
   */

  static endpoint = 'gcal-find-times';

  /**
   * Fetched the automatically generated meeting times from the servlet
   * at the 'gcal-find-times' endpoint.
   * @param {String} periodStart The start of the period, in the 
   * format 'yyyy-MM-ddTHH:mm'
   * @param {String} periodEnd The end of the period, in the 
   * format 'yyyy-MM-ddTHH:mm'
   * @returns The list of the possible meeting times in JSON format, as 
   * returned by the servlet at the 'gcal-find-times' endpoint.
   */
  static async findTimes(periodStart, periodEnd) {
    if (periodStart === null || periodStart === undefined ||
        periodEnd === null || periodEnd === undefined) {
      throw new Error(INSUFFICIENT_REQUEST_PARAM);
    }

    if (typeof periodStart !== 'string' || typeof periodEnd !== 'string') {
      throw new Error(INVALID_PARAM_TYPE);
    }

    // check that the strings are in the format: YYYY-MM-DDTHH:MM
    let format = new RegExp(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/);
    if (!format.test(periodStart) || !format.test(periodEnd)) {
      throw new Error(INVALID_PARAM_VALUE);
    } 

    // check that the periodStart and periodEnd is valid
    // only valid datetime strings can be converted into a Date
    let startDate = new Date(periodStart);
    let endDate = new Date(periodEnd);
    if (!(startDate instanceof Date) || isNaN(startDate) ||
        !(endDate instanceof Date) || isNaN(endDate)) {
      throw new Error(INVALID_PARAM_VALUE);
    }

    // Fetch the relevant data from sessionStorage
    // TODO: Refactor the getter functions that retrieve from sessionStorage
    // to a separate class, since they are not strongly cohesive with 
    // the MeetingEventDAO functions that talk to the servlet.
    let guestList = MeetingEventDAO.getGuestList();
    let durationHours = MeetingEventDAO.getDurationHours();
    let durationMins = MeetingEventDAO.getDurationMins();

    // encode the data to be sent in the query string
    let urlString = DAOUtils.url(
      GoogleCalendarTimesDAO.endpoint, 
      {
        'guest-list': guestList,
        'duration-hours': durationHours, 
        'duration-mins': durationMins,
        'period-start': periodStart, 
        'period-end': periodEnd
      }
    ); 

    let response = await fetch(urlString).then((response) => response.json());
    return response;
  }
}
