/** Test for the createMap function. */
describe('Create map', function() {
  it ('Should create and return a map object', function() {
    const mapConstructorSpy = spyOn(google.maps, 'Map');
    const mockedMap = jasmine.createSpyObj('Map', ['addListener']);
    mapConstructorSpy.and.returnValue(mockedMap);

    const createdMap = createMap();

    expect(createdMap).toBe(mockedMap);
  });
});

/** Tests for the createLocationForEdit function. */
describe('Create location for edit', function() {
  const LAT_A = 33.0;
  const LNG_A = 150.0;
  
  it ('Should create a marker', function() {
    let mapA;

    const fakeMarker = {lat: 10, lng: 15};
    const markerConstructorSpy = spyOn(google.maps, 'Marker')
        .and.returnValue(fakeMarker);
   
    const infowindowConstructorSpy = spyOn(google.maps, 'InfoWindow');
    const infowindow = jasmine.createSpyObj('InfoWindow', ['open']);
    infowindowConstructorSpy.and.returnValue(infowindow);

    const createdMarker = createLocationForEdit(mapA, LAT_A, LNG_A);

    expect(google.maps.Marker).toHaveBeenCalledWith({position:
        {lat: LAT_A, lng: LNG_A}, map: mapA});
    expect(createdMarker).toBe(fakeMarker);
  });
});

/** Tests for the buildInfoWindowInput function. */
describe('Build Info window input', function() {
  const LAT_A = 33.0;
  const LNG_A = 150.0;
  const TITLE_A = 'My meeting place';
  const EMPTY_TITLE = '';
  const NOTE_A = 'My note!';
  const MAP = {};
  const KEY_STRING = '1234';
  
  it ('Should have two textareas and one button', function() {
    const mockedLocation = jasmine.createSpyObj('Marker', ['setMap']);
    const infoWindowContent =
        buildInfoWindowInput(LAT_A, LNG_A, mockedLocation, MAP);

    const childNodes = infoWindowContent.children;

    let textareaCount = 0;
    let buttonCount = 0;
    for (let i = 0; i < childNodes.length; i++) {
      let childName = childNodes[i].tagName;
      if (childName === 'TEXTAREA') {
        textareaCount++;
      }
      if (childName === 'BUTTON') {
        buttonCount++;
      }
    }
    expect(textareaCount).toBe(2);
    expect(buttonCount).toBe(1);
  });

  it ('Should handle error if dao throws error', async function() {
    const mockedLocationDao = new PermMeetingLocationDAO();
    spyOn(mockedLocationDao, 'newLocation').and.throwError(BLANK_FIELDS_ALERT);
    spyOn(MeetingLocationDaoFactory, 'getLocationDao').and.returnValue(
        mockedLocationDao);

    const mockedLocation = jasmine.createSpyObj('Marker', ['setMap']);
    const infoWindowContent = buildInfoWindowInput(LAT_A, LNG_A, mockedLocation, MAP);

    spyOn(window, 'handleError');
    const titleTextbox = infoWindowContent.children[1];
    const button = infoWindowContent.children[6];
    titleTextbox.value = EMPTY_TITLE;
    await button.onclick();
    expect(window.handleError).toHaveBeenCalled(); 
  });

  it ('Should call createLocationForDisplay with the correct params', async function() {
    const mockedLocationDao = new PermMeetingLocationDAO();
    spyOn(mockedLocationDao, 'newLocation').and.returnValue(KEY_STRING);
    spyOn(MeetingLocationDaoFactory, 'getLocationDao').and.returnValue(
        mockedLocationDao);

    const mockedLocation = jasmine.createSpyObj('Marker', ['setMap']);
    const infoWindowContent = buildInfoWindowInput(LAT_A, LNG_A, mockedLocation, MAP);

    spyOn(window, 'createLocationForDisplay');

    infoWindowContent.querySelector('#titleTextbox').value = TITLE_A;
    infoWindowContent.querySelector('#noteTextbox').value = NOTE_A;
    const button = infoWindowContent.querySelector('#confirmButton');

    await button.onclick();

    expect(window.createLocationForDisplay).toHaveBeenCalledWith(
        MAP, LAT_A, LNG_A, TITLE_A, 1, NOTE_A, KEY_STRING);
  });
});

/** Test for fetch locations. */
describe ('Fetch Locations', function() {
  const TITLE = 'My Location';
  const NOTE = 'My Note';
  const LAT = 10.0;
  const LNG = 15.0;

  it ('Should create a marker for the location returned', async function() {
    const locations =
        [{title: TITLE, lat: LAT, lng: LNG, note: NOTE}];

    const mockedLocationDao = new PermMeetingLocationDAO();
    spyOn(mockedLocationDao, 'fetchLocations').and.returnValue(locations);
    spyOn(MeetingLocationDaoFactory, 'getLocationDao').and.returnValue(
        mockedLocationDao);

    // Set up mocks for Google MAPS API
    const markerConstructorSpy = spyOn(google.maps, 'Marker');
    const fakeMarker = jasmine.createSpyObj('Marker', ['addListener']);
    markerConstructorSpy.and.returnValue(fakeMarker);
    let returnedDiv;
    const infowindowConstructorSpy = spyOn(google.maps, 'InfoWindow')
        .and.callFake(function(div) {
      returnedDiv = div;
    })
    let fakeMap = {};

    await fetchLocations(fakeMap);

    // Check marker was called with the correct coordinates
    expect(google.maps.Marker).toHaveBeenCalledWith(
        {position: {lat: LAT, lng: LNG}, map: fakeMap});

    // Check if the content passed to the infowindow constructor contains the
    // title and note.
    let titleText = returnedDiv.content.querySelector('#displayTitle').innerText;
    let noteText = returnedDiv.content.querySelector('#displayNote').innerText;

    expect(titleText).toBe(TITLE);
    expect(noteText).toBe(NOTE);
  }); 

  it ('Should call handle error if Dao throws an error', async function() {
    // Spy on Dao.  
    const mockedLocationDao = new PermMeetingLocationDAO();
    spyOn(mockedLocationDao, 'fetchLocations').and.throwError('Not Found.');
    spyOn(MeetingLocationDaoFactory, 'getLocationDao').and.returnValue(
        mockedLocationDao);

    spyOn(window, 'handleError');

    await fetchLocations();

    expect(window.handleError).toHaveBeenCalled();
  });
});

/** Test for building info window for voting. */
describe ('Build Info Window Vote', function() {
  const TITLE_A = 'Taco Place';
  const COUNT_A = 2;
  const NOTE_A = 'Tacos taste yum!';

  it ('Should display correctly with inputted args and button', function() {
    const infoWindowContent = buildInfoWindowVote(TITLE_A, COUNT_A, NOTE_A);
    const childNodes = infoWindowContent.children;

    // Check if there is a button.
    let buttonCount = 0;
    for (let i = 0; i < childNodes.length; i++) {
      let childName = childNodes[i].tagName;
      if (childName === 'BUTTON') {
        buttonCount++;
        buttonNode = childNodes[i];
      }
    }
    expect(buttonCount).toBe(1);

    // Check if the title and note are displayed.
    let titleText = infoWindowContent.querySelector('#displayTitle').innerText;
    let noteText = infoWindowContent.querySelector('#displayNote').innerText;

    expect(titleText).toBe(TITLE_A);
    expect(noteText).toBe(NOTE_A);
  });

  it ('Should increment the voteCount when the vote button is pressed',
      async function() {
    // Create Dao spy.
    const mockedLocationDao = new PermMeetingLocationDAO();
    spyOn(mockedLocationDao, 'updateLocation');
    spyOn(MeetingLocationDaoFactory, 'getLocationDao').and.returnValue(
        mockedLocationDao);

    let currDisplayVote;
    const infoWindowContent = buildInfoWindowVote(TITLE_A, COUNT_A, NOTE_A);

    currDisplayVote = infoWindowContent.querySelector('#displayVoteCount')
        .innerText;
    expect(parseInt(currDisplayVote)).toBe(COUNT_A);

    const button = infoWindowContent.querySelector('#voteButton');
    await button.onclick();
    currDisplayVote = infoWindowContent.querySelector('#displayVoteCount')
        .innerText;
    expect(parseInt(currDisplayVote)).toBe(COUNT_A + 1);
  });
  
  it ('Should handle error if dao throws an error', async function() {
    // Set up dao mock. 
    const mockedLocationDao = new PermMeetingLocationDAO();
    spyOn(mockedLocationDao, 'updateLocation').and.throwError(ENTITY_NOT_FOUND);
    spyOn(MeetingLocationDaoFactory, 'getLocationDao').and.returnValue(
        mockedLocationDao);

    spyOn(window, 'handleError');

    const infoWindowContent = buildInfoWindowVote(TITLE_A, COUNT_A, NOTE_A);

    const button = infoWindowContent.querySelector('#voteButton');
    await button.onclick();

    expect(window.handleError).toHaveBeenCalled();
  });
});

/** Tests for displaying popular locations. */
describe ('Display Popular Location', function() {
  const LOCATIONS =
      [{title: 'Hamburger Place', lat: 10.0, lng: 15.0, voteCount: 5,
      note: 'I like Hamburgers!'},
      {title: 'Sushi Place', lat: 15.0, lng: 22.0, voteCount: 5,
      note: 'I like Unagi!'},
      {title: 'Pizza Place', lat: 15.0, lng: 22.0, voteCount: 5,
      note: 'I like tomato!'}];
  const EMPTY = [];

  it ('Should add 3 list elements to the popular location list',
      async function() {     
    // Spy on Dao.     
    const mockedLocationDao = new PermMeetingLocationDAO();
    spyOn(mockedLocationDao, 'fetchPopularLocations').and.returnValue(
        LOCATIONS);
    spyOn(MeetingLocationDaoFactory, 'getLocationDao').and.returnValue(
        mockedLocationDao);

    spyOn(window, 'createPopularLocationElement').and.callThrough();

    await displayPopularLocations();

    let listSize = 
        document.getElementById('popular-locations-container').childNodes.length;

    expect(listSize).toBe(3);

    // Test if the location details were correctly passed to 
    // createPopularLoationElement.
    expect(window.createPopularLocationElement)
        .toHaveBeenCalledWith(LOCATIONS[0]);
    expect(window.createPopularLocationElement)
        .toHaveBeenCalledWith(LOCATIONS[1]);
    expect(window.createPopularLocationElement)
        .toHaveBeenCalledWith(LOCATIONS[2]);
  });

  it ('Should display a message when there are no locations', async function() {
    // Spy on Dao.  
    const mockedLocationDao = new PermMeetingLocationDAO();
    spyOn(mockedLocationDao, 'fetchPopularLocations').and.returnValue(EMPTY);
    spyOn(MeetingLocationDaoFactory, 'getLocationDao').and.returnValue(
        mockedLocationDao);

    await displayPopularLocations();

    let childNodes =
        document.getElementById('popular-locations-container').childNodes;
    let listSize = childNodes.length;
    expect(listSize).toBe(1);
    expect(childNodes[0].textContent).toBe('There are no locations to display.');
  });

  it ('Should handle error is PermMeetingLocationDAO throws an error', async function() {
    // Spy on Dao.  
    const mockedLocationDao = new PermMeetingLocationDAO();
    spyOn(mockedLocationDao, 'fetchPopularLocations').and.throwError('Not Found.');
    spyOn(MeetingLocationDaoFactory, 'getLocationDao').and.returnValue(
        mockedLocationDao);

    spyOn(window, 'handleError');

    await displayPopularLocations();

    expect(window.handleError).toHaveBeenCalled();
  });
});

/** Tests for creating list element for popular location list. */
describe ('Create Popular Location Element', function() {
  const LOCATION = 
      {title : 'My Place', lat: 10.0, lng: 15.0, note: 'I like hats',
      voteCount : 5};

  it ('Should display the location title and vote count', function() {
    const returnedElement = createPopularLocationElement(LOCATION);

    // Check if the title and votecount are displayed.
    let titleText = returnedElement.querySelector('#popularLocationTitle').innerText;
    let voteCountText = returnedElement.querySelector('#popularLocationVoteCount').innerText;

    expect(titleText).toBe(LOCATION.title);
    expect(voteCountText).toBe(LOCATION.voteCount.toString());
  });
});
