let map;

/* Editable marker that displays when a user clicks in the map. */
let editMarker;

/** Creates a map that allows users to add markers. */
function createMap() {
  map = new google.maps.Map(
      document.getElementById('map'),
      {center: {lat: -33.8688, lng: 151.2093}, zoom: 12});

  map.addListener('click', (event) => {
    createMarkerForEdit(event.latLng.lat(), event.latLng.lng());
  }); 
}

/** Creates a map that allows users to add markers and already has a displayed marker.
 * Note: This is just for the prototype. In the MVP, all maps will created with no 
 * markers.
 */
function createMapWithMarker() {
  createMap();
  createMarkerForDisplay(-33.8688, 151.2093, "A Proposed Location");
}

/** Creates a marker that shows a read-only info window when clicked. */
function createMarkerForDisplay(lat, lng, content) {
  const marker =
      new google.maps.Marker({position: {lat: lat, lng: lng}, map: map});

  const contentString = 
      `<div id="content">
      <div id="locationInfo">
      </div>
      <p> Location Title: </p>
      ${content}
      <div id="bodyContent">
      <p>Number of Votes: 1</br>
      Voters: You</br></p>
      <input type='checkbox' id='vote' name='vote' value='vote'>
      <label for='vote'> VOTE</label><br></br>
      </div>
      </div>`;

  const infoWindow = new google.maps.InfoWindow({content: contentString});
  marker.addListener('click', () => {
    infoWindow.open(map, marker);
  });
}

/** Creates a marker that shows a textbox the user can edit. */
function createMarkerForEdit(lat, lng) {
  // If we're already showing an editable marker, then remove it.
  if (editMarker) {
    editMarker.setMap(null);
  }

  editMarker =
      new google.maps.Marker({position: {lat: lat, lng: lng}, map: map});

  const infoWindow =
      new google.maps.InfoWindow({content: buildInfoWindowInput(lat, lng)});

  // When the user closes the editable info window, remove the marker.
  google.maps.event.addListener(infoWindow, 'closeclick', () => {
    editMarker.setMap(null);
  });

  infoWindow.open(map, editMarker);
}

/**
 * Builds and returns HTML elements that show an editable textbox and a submit
 * button.
 */
function buildInfoWindowInput(lat, lng) {
  const prompt = document.createElement('span');
  prompt.innerText = "Enter location title:"

  const textBox = document.createElement('textarea');
  const button = document.createElement('button');
  button.appendChild(document.createTextNode('CONFIRM'));

  button.onclick = () => {
    createMarkerForDisplay(lat, lng, textBox.value);
    editMarker.setMap(null);
  };

  const containerDiv = document.createElement('div');
  containerDiv.appendChild(prompt);
  containerDiv.appendChild(document.createElement('br'));
  containerDiv.appendChild(textBox);
  containerDiv.appendChild(document.createElement('br'));
  containerDiv.appendChild(button);

  return containerDiv;
}
