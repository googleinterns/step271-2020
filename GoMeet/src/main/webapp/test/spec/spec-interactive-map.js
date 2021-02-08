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
  const EMPTY_TITLE = '';
  let mockedLocation;
  
  beforeAll(function() {
    mockedLocation = jasmine.createSpyObj('Marker', ['setMap']);
  });

  it ('Should have two textareas and one button', function() {
    const infoWindowContent = buildInfoWindowInput(LAT_A, LNG_A, mockedLocation);
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

  it ('Should call alert if title is empty', function() {
    spyOn(window, 'alert');
    const infoWindowContent = buildInfoWindowInput(LAT_A, LNG_A, mockedLocation);
    const titleTextbox = infoWindowContent.children[1];
    const button = infoWindowContent.children[6];
    titleTextbox.value = EMPTY_TITLE;
    button.click();
    expect(window.alert).toHaveBeenCalled(); 
  });
});

/** Test for fetch locations. */
describe ('Fetch Locations', function() {
  const TITLE = 'My Location';
  const NOTE = 'My Note';
  const LAT = 10.0;
  const LNG = 15.0;

  it ('Should create a marker for the location returned', async function() {
    const LOCATIONS =
        [{title: TITLE, lat: LAT, lng: LNG, note: NOTE}];
    spyOn(MeetingLocationDAO, 'fetchLocations').and.returnValue(LOCATIONS);

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
});
