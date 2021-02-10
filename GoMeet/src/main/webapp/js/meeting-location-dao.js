/** Data access object for the /location-data servlet. */
class MeetingLocationDAO {

  static storingEndPoint = '/location-data'; 
  static votingEndPoint = '/update-location-data';
  static popularEndPoint = '/popular-location-data';

  /**
   * Fetches the location data from the servlet.
   * Returns a JSON array of the location data.
   */
  static async fetchLocations() {
    let locations = await fetch(this.storingEndPoint).then(
        (response) => response.json());
    return locations;
  }

   /**
   * Fetches the popular location data from the servlet.
   * @return a JSON array of the popular location data.
   * @throws an error if the response status is not between 200 and 299.
   */
  static async fetchPopularLocations() {
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
   * Returns response from the servlet.
   */
  static async newLocation(title, lat, lng, note) {
    const params = new URLSearchParams();
    params.append('title', title);
    params.append('lat', lat);
    params.append('lng', lng);
    params.append('note', note);
    let response = await fetch(this.storingEndPoint, {method: 'POST', body: params});
    let result = await response.json();
    return result;
  }

  /** Sends a request to the servlet to update a location entity's voteCount.*/
  static async updateLocation(keyString) {
    const params = new URLSearchParams();
    params.append('key', keyString);
    await fetch(this.votingEndPoint, {method: 'POST', body: params});
  }
}
