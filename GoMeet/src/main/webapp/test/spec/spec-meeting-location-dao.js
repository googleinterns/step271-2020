/** Tests for PermMeetingLocationDAO. */

/** Tests for MeetingLocationDaoFactory. */
describe('getLocationDao', function() {
  it ('Should return Dao for permanent storage', function() {
    const dao = MeetingLocationDaoFactory.getLocationDao('permanent');
    expect(dao instanceof PermMeetingLocationDAO).toBe(true);
  });

  it ('Should return Dao for temporary storage', function() {
    const dao = MeetingLocationDaoFactory.getLocationDao('temporary');
    expect(dao instanceof TempMeetingLocationDAO).toBe(true);
  });
});

/** Tests for fetchLocations(). */
describe ('Fetch Locations', function() {
  let LOCATIONS = [{title: 'Sushi Place', lat: 22.0, lng: 32.0,
      note: 'I like Sushi!'}];

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

    let responseJson = await new PermMeetingLocationDAO().fetchLocations();

    expect(responseJson).toEqual(LOCATIONS);
  });
});

/** Tests for fetchPopularLocatios(). */
describe('Fetch Popular Locations', function() {
  const BAD_REQUEST_RESPONSE =
      {status: 404, statusText : 'Not Found.'};

  it ('Should throw an error if the response status is not between 200 and 299',
      async function() {
    spyOn(window, 'fetch').and.returnValue(BAD_REQUEST_RESPONSE);

    let errorMessage;
    try {
      await new MeetingLocationDAO().fetchPopularLocations();
    } catch (error) {
      errorMessage = error.message;
    }
    expect(errorMessage).toEqual(BAD_REQUEST_RESPONSE.statusText);
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

    let receivedResponse = await new PermMeetingLocationDAO().newLocation(
        TITLE_A, LAT_A, LNG_A, NOTE_A);

    let expectedParams = new URLSearchParams();
    expectedParams.append('title', TITLE_A);
    expectedParams.append('lat', LAT_A);
    expectedParams.append('lng', LNG_A);
    expectedParams.append('note', NOTE_A);

    // Check if fetch was called with the right params.
    expect(window.fetch).toHaveBeenCalledWith('/location-data',
        {method: 'POST', body: expectedParams});

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

    new PermMeetingLocationDAO().updateLocation(KEY_STRING);

    // Check if fetch was called with the right params.
    expect(window.fetch).toHaveBeenCalledWith('/update-location-data',
        {method: 'POST', body: expectedParams}); 
  });
});
