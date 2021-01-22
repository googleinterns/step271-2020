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
  const TITLE_A = 'Waffle Place';
  const NOTE_A = 'Waffles are yummy!';
  let mockedLocation;
  let mockedFetchWrapper;

  beforeAll(function() {
    mockedLocation = jasmine.createSpyObj('Marker', ['setMap']);
    mockedFetchWrapper = new FetchWrapper();
    spyOn(mockedFetchWrapper, 'postLocation');
  });

  it ('Should have two textareas and one button', function() {
    const infoWindowContent = buildInfoWindowInput(LAT_A, LNG_A, mockedLocation, mockedFetchWrapper);
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

  it ('Should send the correct post request', function() {
    const infoWindowContent = buildInfoWindowInput(LAT_A, LNG_A, mockedLocation, mockedFetchWrapper);

    const titleTextbox = infoWindowContent.children[1];
    const noteTextbox = infoWindowContent.children[4];
    const button = infoWindowContent.children[6];
    titleTextbox.value = TITLE_A;
    noteTextbox.value = NOTE_A;

    const expectedParams = new URLSearchParams();
    expectedParams.append('title', TITLE_A);
    expectedParams.append('lat', LAT_A);
    expectedParams.append('lng', LNG_A);
    expectedParams.append('note', NOTE_A);

    button.click();

    expect(mockedFetchWrapper.postLocation).toHaveBeenCalledWith('/location-data', expectedParams);    
  });
});
