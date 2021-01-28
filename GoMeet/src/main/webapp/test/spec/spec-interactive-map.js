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
    const markerConstructorSpy = spyOn(google.maps, 'Marker').and.returnValue(fakeMarker);

    const infowindowConstructorSpy = spyOn(google.maps, 'InfoWindow');
    const infowindow = jasmine.createSpyObj('InfoWindow', ['open']);
    infowindowConstructorSpy.and.returnValue(infowindow);

    const createdMarker = createLocationForEdit(mapA, LAT_A, LNG_A);

    expect(google.maps.Marker).toHaveBeenCalledWith({position: {lat: LAT_A, lng: LNG_A}, map: mapA});
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

/** Test for Post Location. */
describe('Post Location', function() {
  const TITLE_A = 'Krusty Krab';
  const NOTE_A = 'Krabby Patty!';
  const LAT_A = 10.0;
  const LNG_A = 15.0;

  it ('Should send the correct post request', function() {
    let mockedFetchWrapper = new FetchWrapper();
    spyOn(mockedFetchWrapper, 'doPost');

    const expectedParams = new URLSearchParams();
    expectedParams.append('title', TITLE_A);
    expectedParams.append('lat', LAT_A);
    expectedParams.append('lng', LNG_A);
    expectedParams.append('note', NOTE_A);

    postLocation(TITLE_A, LAT_A, LNG_A, NOTE_A, mockedFetchWrapper);

    expect(mockedFetchWrapper.doPost).toHaveBeenCalledWith('/location-data', expectedParams);
  });
});