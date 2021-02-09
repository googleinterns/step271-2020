/** Initialises the map. */
function initMap() {
  // Create the map object
  let map = createMap();
  
  // Add the data from the database to the map
  fetchLocations(map);
}

/** Creates a map that allows users to add markers. */
function createMap() {
  let map = new google.maps.Map(
      document.getElementById('map'),
      {center: {lat: -33.8688, lng: 151.2093}, zoom: 12}); 

  map.addListener('click', (event) => {
    createLocationForEdit(map, event.latLng.lat(), event.latLng.lng());
  });
  return map; 
}

/** Creates a marker that shows a textbox the user can edit. */
function createLocationForEdit(map, lat, lng) {
 
  const editLocation =
      new google.maps.Marker({position: {lat: lat, lng: lng}, map: map});

  const infoWindow =
      new google.maps.InfoWindow({content: buildInfoWindowInput(lat, lng,
         editLocation)});

  // When the user closes the editable info window, remove the marker.
  google.maps.event.addListener(infoWindow, 'closeclick', () => {
    editLocation.setMap(null);
  });
  infoWindow.open(map, editLocation);
  return editLocation;
}

/** Creates a marker that shows the location's information. */
function createLocationForDisplay(map, lat, lng, title, voteCount, note, keyString) {
  let displayLocation =
      new google.maps.Marker({position: {lat: lat, lng: lng}, map: map});

  const infoWindow = new google.maps.InfoWindow({content:
     buildInfoWindowVote(title, voteCount, note, keyString)});
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
  const titleTextbox = document.createElement('textarea');
  const noteTextbox = document.createElement('textarea');

  const button = document.createElement('button');
  button.appendChild(document.createTextNode('CONFIRM'));
  button.onclick = () => {
    try {
      validateTitle(titleTextbox.value);
      MeetingLocationDAO.newLocation(titleTextbox.value, lat, lng,
          noteTextbox.value);
      editLocation.setMap(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const containerDiv = document.createElement('div');
  containerDiv.append('Enter location title:', document.createElement('br'),
      titleTextbox, document.createElement('br'), 'Enter note:',
      document.createElement('br'), noteTextbox, document.createElement('br'),
      button);
  return containerDiv;
}

/** Sends a POST request with the location data. */
function postLocation(title, lat, lng, note) {
  const params = new URLSearchParams();
  params.append('title', title);
  params.append('lat', lat);
  params.append('lng', lng);
  params.append('note', note);
  MeetingLocationDAO.postLocation('/location-data', params);
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
async function fetchLocations(map) {
  let json = await MeetingLocationDAO.fetchLocations();
  json.forEach((location) => {
    createLocationForDisplay(map, location.lat, location.lng,
        location.title, location.voteCount, location.note, location.keyString);
  });
}

/** Builds a HTML element to display the location's data and a vote button. */
function buildInfoWindowVote(title, voteCount, note, keyString) {
  let titleContainer = document.createElement('span');
  titleContainer.setAttribute('id', 'displayTitle');
  titleContainer.innerText = title;

  let noteContainer = document.createElement('span');
  noteContainer.setAttribute('id', 'displayNote');
  noteContainer.innerText = note;

  const button = document.createElement('button');
  button.appendChild(document.createTextNode('VOTE'));
  button.onclick = () => {
    MeetingLocationDAO.updateLocation(keyString);
  };

  const containerDiv = document.createElement('div');
  containerDiv.append('Location title: ', titleContainer, 
      document.createElement('br'), 'Vote Count: ', voteCount, 
      document.createElement('br'), 'Note: ', noteContainer,
      document.createElement('br'), button);
  return containerDiv;
}

/** Creates a list element that represents a location. */
function createPopularLocationElement(location) {
  const liElement = document.createElement('li');
  liElement.className = 'location';

  let titleContainer = document.createElement('span');
  titleContainer.setAttribute('id', 'popularLocationTitle');
  titleContainer.innerText = location.title;

  let voteCountContianer = document.createElement('span');
  voteCountContianer.setAttribute('id', 'popularLocationVoteCount');
  voteCountContianer.innerText = location.voteCount;

  liElement.append('Title: ', titleContainer, document.createElement('br'),
      'Number of Votes: ', voteCountContianer);
  return liElement;
}

/** Fetches the popular location data and adds it to the DOM. */
async function displayPopularLocations() {
  const popularLocationElement = 
      document.getElementById('popular-locations-container');
  popularLocationElement.innerHTML = '';

  let json = await MeetingLocationDAO.fetchPopularLocations();
  if (!json.length) {
    popularLocationElement.append('There are no locations to display.');
  } else {
    json.forEach((location) => {
      popularLocationElement.appendChild(createPopularLocationElement(location)); 
    });
  }
}
