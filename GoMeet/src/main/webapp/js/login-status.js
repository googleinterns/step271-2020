class LoginStatus {
  
  static endpoint = '/user-status'; 

  static async doGet(meetingEventId) {
    if (meetingEventId === null || meetingEventId === undefined) {
      throw new Error(INSUFFICIENT_REQUEST_PARAM); 
    }

    if (typeof meetingEventId !== 'string') {
      throw new Error(INVALID_PARAM_TYPE); 
    }

    let urlString = DAOUtils.url(LoginStatus.endpoint, {'meetingEventId': meetingEventId});
    let results = await fetch(urlString).then((results) => results.json());
    return results;
  }
}
