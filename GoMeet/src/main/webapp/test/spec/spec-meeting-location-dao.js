/** Tests for MeetingLocationDAO. */

/** Tests for fetchLocations(). */
describe ('Fetch Locations', function() {
  let LOCATIONS = [{title: 'Sushi Place', lat: 22.0, lng: 32.0, note: 'I like Sushi!'}];

  it ('Should return the fetch response as a JSON object', async function() {
    // Set up fake promise to return 
    let promiseHelper;
    let fetchPromise = new Promise(function(resolve, reject) {
      promiseHelper = {
        resolve: resolve,
        reject: reject
      };
    });
    const response = new Response(JSON.stringify(LOCATIONS));
    promiseHelper.resolve(response);
    spyOn(window, 'fetch').and.returnValue(fetchPromise);

    let responseJson = await MeetingLocationDAO.fetchLocations();

    expect(responseJson).toEqual(LOCATIONS);
  });
});

/** Tests for newLocation(). */
describe('New Location', function() {
  const TITLE_A = 'Taco Place';
  const LAT_A = 10.0; 
  const LNG_A = 15.0; 
  const NOTE_A = 'I like Tacos';
  const KEY_STRING = '1234';

  it ('Should send a post request with the correct params', async function() {
    // Set up fake promise to return 
    let promiseHelper;
    let fetchPromise = new Promise(function(resolve, reject) {
      promiseHelper = {
        resolve: resolve,
        reject: reject
      };
    });
    const response = new Response(JSON.stringify(KEY_STRING));
    promiseHelper.resolve(response);

    spyOn(window, 'fetch').and.returnValue(fetchPromise);

    let receivedResponse = await MeetingLocationDAO.newLocation(TITLE_A, LAT_A, LNG_A, NOTE_A);

    let expectedParams = new URLSearchParams();
    expectedParams.append('title', TITLE_A);
    expectedParams.append('lat', LAT_A);
    expectedParams.append('lng', LNG_A);
    expectedParams.append('note', NOTE_A);

    // Check if fetch was called with the right params.
    expect(window.fetch).toHaveBeenCalledWith('/location-data', {method: 'POST', body: expectedParams});

    // Check if the response was returned.
    expect(receivedResponse).toEqual(KEY_STRING);
  });
});

/** Tests for updateLocation(). */
describe('Update Location', function() {
  const KEY_STRING = '1234';

  it ('Should send a post request with the correct params', function() {
    spyOn(window, 'fetch');

    let expectedParams = new URLSearchParams();
    expectedParams.append('key', KEY_STRING);

    MeetingLocationDAO.updateLocation(KEY_STRING);

    // Check if fetch was called with the right params.
    expect(window.fetch).toHaveBeenCalledWith('/update-location-data',
        {method: 'POST', body: expectedParams}); 
  });
});
