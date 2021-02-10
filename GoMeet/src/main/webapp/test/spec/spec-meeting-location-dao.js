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
      await new PermMeetingLocationDAO().fetchPopularLocations();
    } catch (error) {
      errorMessage = error.message;
    }
    expect(errorMessage).toEqual(BAD_REQUEST_RESPONSE.statusText);
  });
});
 
/** Tests for newLocation(). */
describe('New Location', function() {
  const TITLE_A = 'Taco Place';
  const EMPTY = '';
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

  it ('Should throw an error if the title is empty', async function() {
    let errorMessage;
    try {
      await new PermMeetingLocationDAO().newLocation(EMPTY, LAT_A, LNG_A, NOTE_A);
    } catch (error) {
      errorMessage = error.message;
    }
    expect(errorMessage).toEqual(BLANK_FIELDS_ALERT);
  });
});

/** Tests for updateLocation(). */
describe('Update Location', function() {
  const KEY_STRING = '1234';
  const OK_RESPONSE = {status : 200};
  const BAD_REQUEST_RESPONSE = {status : 400};

  it ('Should send a post request with the correct params', function() {
    spyOn(window, 'fetch').and.returnValue(OK_RESPONSE);

    let expectedParams = new URLSearchParams();
    expectedParams.append('key', KEY_STRING);

    new PermMeetingLocationDAO().updateLocation(KEY_STRING);

    // Check if fetch was called with the right params.
    expect(window.fetch).toHaveBeenCalledWith('/update-location-data',
        {method: 'POST', body: expectedParams}); 
  });

  it ('Should throw an error if fetch return status code of 400', async function() {    
    spyOn(window, 'fetch').and.returnValue(BAD_REQUEST_RESPONSE);
    let errorMessage;
    try {
      await new PermMeetingLocationDAO().updateLocation(KEY_STRING);
    } catch (error) {
       errorMessage = error.message;
    }
    expect(errorMessage).toEqual(ENTITY_NOT_FOUND);
  });
});

/** Tests for TempMeetingLocationDao. */

/** Tests if a new location is stored on session storage. */
describe('New Location Temp', function() {
  const LOCATION_A =
      {title: 'Pizza Place', lat: 10.0, lng: 15.0, note: 'I like cheese!', keyString: ''};
  const LOCATION_B = 
      {title: 'Super Soup', lat: 10.0, lng: 15.0,
      note: 'Where is my super soup?', keyString: ''};
  let fakeSessionStorage;
  const dao = new TempMeetingLocationDAO();

  beforeEach(function() {
    // Set up fake session storage.
    fakeSessionStorage = {};
    spyOn(sessionStorage, 'setItem').and.callFake(function(key, value) {
      fakeSessionStorage[key] = value;
    });
    spyOn(sessionStorage, 'getItem').and.callFake(function(key) {
      return fakeSessionStorage[key];
    });
  });
      
  it ('Should store arguments as a new location', async function() {
    await dao.newLocation(LOCATION_A.title, LOCATION_A.lat, LOCATION_A.lng,
        LOCATION_A.note);
    
    const storedLocations = JSON.parse(fakeSessionStorage['locations']);
    expect(storedLocations.length).toBe(1);

    const storedLocation = storedLocations[0];
    expect(storedLocation).toEqual(LOCATION_A);
  });

  it ('Should add to the location list of there is something already stored',
      async function() {
    // Add a location to fakeSessionStorage.
    fakeSessionStorage['locations'] = JSON.stringify([LOCATION_B]);

    await dao.newLocation(LOCATION_A.title, LOCATION_A.lat, LOCATION_A.lng,
        LOCATION_A.note);

    const storedLocations = JSON.parse(fakeSessionStorage['locations']);
    expect(storedLocations.length).toBe(2);

    const storedLocation1 = storedLocations[0];
    const storedLocation2 = storedLocations[1];
    expect(storedLocation1).toEqual(LOCATION_B);
    expect(storedLocation2).toEqual(LOCATION_A);
  });
});

describe('Fetch Locations', function() {
  const LOCATION_A =
      {title: 'Pizza Place', lat: 10.0, lng: 15.0, note: 'I like cheese!', keyString: ''};
  const dao = new TempMeetingLocationDAO();
  let fakeSessionStorage;

  beforeEach(function() {
    // Set up fake session storage.
    fakeSessionStorage = {};
    spyOn(sessionStorage, 'setItem').and.callFake(function(key, value) {
      fakeSessionStorage[key] = value;
    });
    spyOn(sessionStorage, 'getItem').and.callFake(function(key) {
      return fakeSessionStorage[key];
    });
  });

  it ('Should return locations stored on sessionStorage', function() {
    fakeSessionStorage['locations'] = JSON.stringify([LOCATION_A]);

    let results = dao.fetchLocations();

    expect(results.length).toBe(1);
    expect(results[0]).toEqual(LOCATION_A);
  });

  it ('Should return an empty array with sessionStorage is empty', function() {
    let results = dao.fetchLocations();
    expect(results.length).toBe(0);
  });
});

describe('validTitle', function() {
  const LOCATION_A =
      {title: 'Pizza Place', lat: 10.0, lng: 15.0, note: 'I like cheese!',
      keyString: ''};
  const dao = new TempMeetingLocationDAO();
  let fakeSessionStorage;

  beforeEach(function() {
    // Set up fake session storage.
    fakeSessionStorage = {};
    fakeSessionStorage['locations'] = JSON.stringify([LOCATION_A]);
    spyOn(sessionStorage, 'setItem').and.callFake(function(key, value) {
      fakeSessionStorage[key] = value;
    });
    spyOn(sessionStorage, 'getItem').and.callFake(function(key) {
      return fakeSessionStorage[key];
    });
  });

  it ('Should return false if the new location title is a repeat',
      function() {
    let result = dao.validTitle(LOCATION_A.title);
    expect(result).toBe(false);
  });

  it ('Should return true if the new location title is not a repeat',
      function() {
    let result = dao.validTitle('Anti-Pizza Place');
    expect(result).toBe(true);
  });
});

describe('maxEntitiesReached', function() {

});
