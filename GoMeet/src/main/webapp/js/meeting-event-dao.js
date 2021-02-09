class MeetingEventDAO {
  /** Data Access Object for MeetingEvents */

  static endpoint = '/meeting-event'; // URL endpoint of the associated servlet

  static getMeetingName() {
    return sessionStorage.getItem('meeting-name'); 
  }

  static getDurationMins() {
    return sessionStorage.getItem('duration-mins'); 
  }

  static getDurationHours() {
    return sessionStorage.getItem('duration-hours');
  }

  static getTimeFindMethod() {
    return sessionStorage.getItem('time-find-method'); 
  }

  static getGuestList() {
    let guestList = [];
    guestList.push(sessionStorage.getItem('meeting-host')); 

    for (let i = 0; i < sessionStorage.length; i++) {
      if (sessionStorage.key(i).includes('guest-')) {
        guestList.push(sessionStorage.getItem(sessionStorage.key(i))); 
      }
    }
    return guestList; 
  }

  static getMeetingTimes() {
    let meetingTimes = [];

    for (let i = 0; i < sessionStorage.length; i++) {
      if (sessionStorage.key(i).includes('meeting-time-')) {
        meetingTimes.push(sessionStorage.getItem(sessionStorage.key(i))); 
      }
    }
    return meetingTimes; 
  }

  static async getMeetingTimeIds(meetingTimes) {
    let ids = [];
    for (let i = 0; i < meetingTimes.length; i++) {
      let id = await MeetingTimeDAO.newMeetingTime(meetingTimes[i]); 
      ids.push(id.meetingTimeId); 
    }
    return ids; 
  }

  static async getMeetingLocationIds() {
    let ids = [];
    let json = await MeetingLocationDAO.fetchLocations();
    json.forEach((location) => {
      ids.push(location.keyString); 
    });
    return ids; 
  }

  static async newMeetingEvent() {
    let meetingName = this.getMeetingName(); 
    let durationMins = this.getDurationMins(); 
    let durationHours = this.getDurationHours(); 
    let timeFindMethod = this.getTimeFindMethod(); 
    let guestList = this.getGuestList(); 
    let meetingTimes = this.getMeetingTimes(); 
    let meetingTimeIds = await this.getMeetingTimeIds(meetingTimes); 
    let meetingLocationIds = await this.getMeetingLocationIds();

    // Encode the data to be sent in the query string
    let urlString = DAOUtils.url(MeetingEventDAO.endpoint, {'meetingName': meetingName, 
    'durationMins': durationMins, 'durationHours': durationHours, 
    'timeFindMethod': timeFindMethod, 'guestList': guestList, 
    'meetingTimeIds': meetingTimeIds, 'meetingLocationIds': meetingLocationIds}); 

    let responseInit = {method: 'POST'}
    let response = await fetch(urlString, responseInit).then((response) => response.json());
    return response;
  }

  static async fetchMeetingEvent(meetingEventId) {
    if (meetingEventId === null || meetingEventId === undefined) {
      throw new Error(INSUFFICIENT_REQUEST_PARAM); 
    }

    if (typeof meetingEventId !== 'string') {
      throw new Error(INVALID_PARAM_TYPE); 
    }

    let urlString = DAOUtils.url(MeetingEventDAO.endpoint, {'meetingEventId': meetingEventId});
    let results = await fetch(urlString).then((results) => results.json());
    return results;
  }
}
