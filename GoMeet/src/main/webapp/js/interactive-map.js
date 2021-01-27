/** Creates a map that allows users to add markers. */
function createMap() {
  let map = new google.maps.Map(
      document.getElementById('map'),
      {center: {lat: -33.8688, lng: 151.2093}, zoom: 12}); 

  map.addListener('click', (event) => {
    createLocationForEdit(map, event.latLng.lat(), event.latLng.lng());
  });

  const fetchWrapper = new FetchWrapper();
  fetchLocations(map, fetchWrapper);
  return map; 
}

/** Creates a marker that shows a textbox the user can edit. */
function createLocationForEdit(map, lat, lng) {
 
  editLocation =
      new google.maps.Marker({position: {lat: lat, lng: lng}, map: map});

  const infoWindow =
      new google.maps.InfoWindow({content: buildInfoWindowInput(lat, lng, editLocation)});

  // When the user closes the editable info window, remove the marker.
  google.maps.event.addListener(infoWindow, 'closeclick', () => {
    editLocation.setMap(null);
  });
  infoWindow.open(map, editLocation);
  return editLocation;
}

/** Creates a marker that shows the location's information. */
async function createLocationForDisplay(map, lat, lng, title) {
  let displayLocation =
      new google.maps.Marker({position: {lat: lat, lng: lng}, map: map});

  const infoWindow = new google.maps.InfoWindow({content: title});
  displayLocation.addListener('click', () => {
    infoWindow.open(map, displayLocation);
  });
  return displayLocation;
}

/**
 * Builds and returns HTML elements that show an editable textbox and a submit
 * button.
 */
function buildInfoWindowInput(lat, lng, editLocation) {
  const fetchWrapper = new FetchWrapper();

  const titleTextbox = document.createElement('textarea');
  const noteTextbox = document.createElement('textarea');

  const button = document.createElement('button');
  button.appendChild(document.createTextNode('CONFIRM'));
  button.onclick = () => {
    try {
      validateTitle(titleTextbox.value);
      postLocation(titleTextbox.value, lat, lng, noteTextbox.value, fetchWrapper);
      editLocation.setMap(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const containerDiv = document.createElement('div');
  containerDiv.append('Enter location title:', document.createElement('br'), titleTextbox,
      document.createElement('br'), 'Enter note:', document.createElement('br'), noteTextbox,
      document.createElement('br'), button);
  return containerDiv;
}

/** Sends a POST request with the location data. */
function postLocation(title, lat, lng, note, fetchWrapper) {
  const params = new URLSearchParams();
  params.append('title', title);
  params.append('lat', lat);
  params.append('lng', lng);
  params.append('note', note);
  fetchWrapper.doPost('/location-data', params);
}

/** 
 * Check if user input is valid. 
 * Throws an error if title in an invalid input.
 */
function validateTitle(title) {
  if (title === '') {
    throw (new Error(BLANK_FIELDS_ALERT));
  }
}

/** Fetches the location data. */
async function fetchLocations(map, fetchWrapper) {
  let response = await fetchWrapper.doGet('location-data');
  let json = await response.json();
  json.forEach(async (location) => {
    await createLocationForDisplay(map, location.lat, location.lng, location.title);
  });
}
