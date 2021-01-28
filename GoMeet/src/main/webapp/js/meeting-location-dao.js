/** Data access object for the /location-data servlet. */
class MeetingLocationDAO {

  static endpoint = '/location-data'; 
  /**
   * Fetches the location data from the servlet.
   * Returns a JSON array of the location data.
   */
  static async fetchLocations() {
    let locations = await fetch(this.endpoint).then((response) => response.json());
    return locations;
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
    let result = await fetch(this.endpoint, {method: 'POST', body: params}).then((response) => response.json());
    return result;
  }
}
