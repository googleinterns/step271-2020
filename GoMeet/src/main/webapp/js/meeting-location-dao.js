/** Constructs a Data Access Object for location data. */
class MeetingLocationDaoFactory {
  /** 
   * Returns a meetingLocationDAO object based on whether the map stores to a temporary
   * or permanent location.
   */
  static getLocationDao(storageType) {
    if (storageType === 'permanent') {
      return new PermMeetingLocationDAO();
    } else {
      return new TempMeetingLocationDAO();
    }
  }
}

/** Stores location data to session storage. */
class TempMeetingLocationDAO {
  constructor() {
    this.emptyKeyString = '';
    this.MAX_ENTITIES = 5;
  }

  /** Fetches the location data stored in session storage. */
  fetchLocations() {
    if (sessionStorage.getItem('locations') == null) {
      return [];
    } else {
      return JSON.parse(sessionStorage.getItem('locations'));
    } 
  }

  /** Saves a new location to session storage. */
  newLocation(title, lat, lng, note) {
    // Check if the new location can be added.
    if (title === '') {
      throw new Error(BLANK_FIELDS_ALERT);
    }
    if (!this.validTitle(title)) {
      throw new Error(SAME_TITLE);
    }
    if (this.maxEntitiesReached()) {
      throw new Error(MAX_ENTITIES);
    }

    // Add the new location.
    let locationList;
    if (sessionStorage.getItem('locations') == null) {
      locationList = [];
    } else {
      locationList = JSON.parse(sessionStorage.getItem('locations'));
    }
    const newLocation = {title: title, lat: lat, lng: lng,
        note: note, keyString: this.emptyKeyString};
    locationList.push(newLocation);
    sessionStorage.setItem('locations', JSON.stringify(locationList));
  }

  /**
   * Called when the user clicks the VOTE button.
   * Note: Temporary storage is only used during the meeting creation.
   * The meeting creator cannot vote more than once.
   * @throws an error when the meeting creator tries to vote for location.
   */
  updateLocation(keyString) {
    throw new Error(USER_HAS_VOTED_ERROR);
  }

  /**
   * Checks if the title is unique and therefore valid. i.e.
   * There is no other location for this meeting with the same title.
   * @param {String} targetTitle the title of the location being added.
   * @return true if the title is valid.
   */
  validTitle(targetTitle) {
    const locations = this.fetchLocations();
    if (locations.length === 0) {
      return true;
    }
    for (let i = 0; i < locations.length; i++) {
      if (locations[i].title === targetTitle) {
        return false;
      }
    }
    return true;
  }

   /** 
   * Returns true if the maximum number of entities has been reached.
   */
  maxEntitiesReached() {
    const locations = this.fetchLocations();
    return (locations.length === this.MAX_ENTITIES);
  }
}

/** Data access object for the /location-data servlet. */
class PermMeetingLocationDAO {

  /** Constructs a Data Access object for permanent storage. */
  constructor() {
    this.storingEndPoint = '/location-data';
    this.votingEndPoint = '/update-location-data';
    this.popularEndPoint = '/popular-location-data';
  };

  /**
   * Fetches the location data from the servlet.
   * Returns a JSON array of the location data.
   */
  async fetchLocations() {
    let response = await fetch(this.storingEndPoint);
    if (response.status >= 200 && response.status <= 299) {
      let locations = await response.json();
      return locations;
    } else {
      throw new Error(response.statusText);
    }    
  }

  /**
   * Fetches the popular location data from the servlet.
   * @return a JSON array of the popular location data.
   * @throws an error if the response status is not between 200 and 299.
   */
  async fetchPopularLocations() {
    let response = await fetch(this.popularEndPoint);
    if (response.status >= 200 && response.status <= 299) {
      let locations = await response.json();
      return locations;
    } else {
      throw new Error(response.statusText);
    }    
  }

  /** 
   * Sends a new location to the servlet.
   * @return {String} Key String from the servlet.
   * Throws an error if title is blank.
   */
  async newLocation(title, lat, lng, note) {
    if (title === '') {
      throw new Error(BLANK_FIELDS_ALERT);
    }
    const params = new URLSearchParams();
    params.append('title', title);
    params.append('lat', lat);
    params.append('lng', lng);
    params.append('note', note);
    let response = await fetch(this.storingEndPoint, {method: 'POST', body: params});
    let result = await response.json();
    return result;
  }

  /** Sends a request to the servlet to update a location entity's voteCount.
   * Throws an error if there is no location on the database with the 
   * given key string.
   */
  async updateLocation(keyString) {
    const params = new URLSearchParams();
    params.append('key', keyString);
    let response = await fetch(this.votingEndPoint, {method: 'POST', body: params});
    if (response.status == 400) {
      throw new Error(ENTITY_NOT_FOUND);
    }
  }
}
